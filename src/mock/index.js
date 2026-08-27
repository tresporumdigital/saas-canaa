import { TODAY } from '../lib/format.js';
import { planosProduto, planoById } from './planos.js';
import { clientes, clienteById } from './clientes.js';
import { contratos, contratoById, contratosDoCliente, contratoValor, parcelasDoContrato } from './contratos.js';
import { parceiros, parceiroById } from './parceiros.js';
import { obitos, obitoById, obitosDoCliente } from './obitos.js';
import { guias, guiaById, guiasDoParceiro, guiasDoObito, CICLO_GUIA } from './guias.js';
import {
  equipamentosProduto, equipamentoProdutoById, equipamentosAbaixoDoMinimo,
  unidadesEquipamento, unidadeByPatrimonio, emprestimos, emprestimoById,
  emprestimosDoCliente, emprestimosDaUnidade, emprestimosAtrasados,
  vendasEquipamento, vendaTotais, vendaEquipamentoById,
} from './equipamentos.js';
import { carnes, carneById, carnesDoContrato } from './carnes.js';
import { notasFiscais, notaFiscalById } from './notasFiscais.js';
import { pagamentos, pagamentoById, filaExcecoes, logApiBancaria } from './pagamentos.js';
import { leads, leadById } from './leads.js';
import { baixasParceiro, baixasDoParceiro, extratoParceiro } from './portal.js';
import {
  contasReceber, contasPagar, fluxoCaixa, agingInadimplencia,
  fechamentoCaixa, dreMes, dreResultado,
} from './financeiro.js';
import {
  usuarios, perfisPermissoes, parametros, backupConfig,
  backupExecucoes, ultimoBackup, auditoria,
} from './sistema.js';

export * from './planos.js';
export * from './clientes.js';
export * from './contratos.js';
export * from './parceiros.js';
export * from './obitos.js';
export * from './guias.js';
export * from './equipamentos.js';
export * from './carnes.js';
export * from './notasFiscais.js';
export * from './pagamentos.js';
export * from './leads.js';
export * from './portal.js';
export * from './financeiro.js';
export * from './sistema.js';

// ---------- Helpers de período ----------
export function inPeriodo(iso, periodo = 'mes') {
  if (!iso) return false;
  const d = new Date(iso);
  const diffDays = Math.round((TODAY - d) / 86400000);
  if (periodo === 'hoje') return d.toDateString() === TODAY.toDateString();
  if (periodo === 'semana') return diffDays >= 0 && diffDays <= 7;
  if (periodo === 'mes') return d.getFullYear() === TODAY.getFullYear() && d.getMonth() === TODAY.getMonth();
  return diffDays >= 0 && diffDays <= 90; // custom / trimestre
}

const PERIODO_LABEL = { hoje: 'hoje', semana: 'nos últimos 7 dias', mes: 'no mês', custom: 'no trimestre' };

// ---------- Seletores derivados ----------
export const contratosAtivos = () => contratos.filter((c) => c.situacao === 'Ativo' || c.situacao === 'Em atraso');
export const contratosInadimplentes = () => contratos.filter((c) => c.situacao === 'Em atraso' || c.situacao === 'Suspenso');

export function todasParcelas() {
  return contratos.flatMap((c) => parcelasDoContrato(c).map((p) => ({ ...p, clienteId: c.clienteId, situacaoContrato: c.situacao })));
}

export function parcelasVencidas() {
  return todasParcelas().filter((p) => p.status === 'Vencido' || p.status === 'Em aberto');
}

export function inadimplenciaTotal() {
  return agingInadimplencia.reduce((s, b) => s + b.value, 0);
}

export function guiasPorParceiro() {
  const map = {};
  guias.forEach((g) => {
    map[g.parceiroId] = map[g.parceiroId] || { parceiroId: g.parceiroId, total: 0, valor: 0 };
    map[g.parceiroId].total += 1;
    map[g.parceiroId].valor += g.valorAcordado;
  });
  return Object.values(map).sort((a, b) => b.total - a.total);
}

// ---------- Dados do dashboard ----------
export function dashboardData(periodo = 'mes') {
  const ativos = contratosAtivos().length;
  const avgMensalidade = contratosAtivos().reduce((s, c) => s + contratoValor(c), 0) / Math.max(1, ativos);
  const receitaRecebida = pagamentos.filter((p) => inPeriodo(p.recebidoEm, periodo) && p.status !== 'Exceção').reduce((s, p) => s + p.valor, 0);
  const receitaPrevista = ativos * avgMensalidade;
  const inad = inadimplenciaTotal();
  const inadPct = inad / (receitaPrevista + inad);

  const novos = { hoje: 1, semana: 2, mes: 4, custom: 11 }[periodo] ?? 4;
  const cancelamentos = { hoje: 0, semana: 1, mes: 1, custom: 3 }[periodo] ?? 1;

  const emprestadas = unidadesEquipamento.filter((u) => u.status === 'Emprestado').length;
  const atrasadasDevolucao = emprestimosAtrasados().length;
  const vendidosNoMes = vendasEquipamento.filter((v) => inPeriodo(v.data, periodo)).length;

  const obitosPeriodo = obitos.filter((o) => inPeriodo(o.abertoEm, periodo));

  const nfPendentes = notasFiscais.filter((n) => n.status === 'Pendente' || n.status === 'Rejeitada').length;

  return {
    periodoLabel: PERIODO_LABEL[periodo] || 'no período',
    planos: {
      ativos, novos, cancelamentos,
      receitaRecebida, receitaPrevista,
      inadimplenciaValor: inad, inadimplenciaPct: inadPct,
    },
    equipamentos: {
      emEstoque: unidadesEquipamento.filter((u) => u.status === 'Disponível').length,
      emprestados: emprestadas,
      atrasados: atrasadasDevolucao,
      vendidos: vendidosNoMes,
    },
    atendimentos: {
      obitos: obitosPeriodo.length,
      porParceiro: guiasPorParceiro().slice(0, 4).map((g) => ({
        parceiro: parceiroById(g.parceiroId)?.nomeFantasia || g.parceiroId,
        total: g.total,
      })),
    },
    alertas: [
      { tipo: 'danger', icon: 'receipt', label: `${parcelasVencidas().length} carnês/parcelas vencidos`, to: '/financeiro' },
      { tipo: 'warning', icon: 'wheelchair', label: `${atrasadasDevolucao} devoluções de equipamento atrasadas`, to: '/emprestimos' },
      { tipo: 'info', icon: 'refresh', label: '4 planos a renovar nos próximos 30 dias', to: '/planos' },
      { tipo: 'warning', icon: 'doc', label: `${nfPendentes} notas fiscais pendentes ou rejeitadas`, to: '/notas-fiscais' },
      { tipo: 'danger', icon: 'cash', label: `${filaExcecoes().length} pagamentos em exceção de conciliação`, to: '/pagamentos' },
    ],
    serieReceita: fluxoCaixa.slice(-8).map((f) => f.entradas),
  };
}
