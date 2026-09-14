import { TODAY } from '../lib/format.js';
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
  perfisPermissoes, parametros, backupConfig,
  backupExecucoes, ultimoBackup, auditoria,
} from './sistema.js';

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
// `contratos`/`planos` vêm do cache reativo da API (useContratosCache/usePlanosCache) — não são
// mais mockados, então quem chama precisa repassar as listas (mesmo padrão de `parceiros`).
export const contratosAtivos = (contratos) => contratos.filter((c) => c.situacao === 'Ativo' || c.situacao === 'Em atraso');
export const contratosInadimplentes = (contratos) => contratos.filter((c) => c.situacao === 'Em atraso' || c.situacao === 'Suspenso');

// A listagem de contratos já traz o total de parcelas "Em aberto" por contrato (calculado no
// servidor); somar essa coluna evita ter que buscar o detalhe (com as parcelas) de cada um só
// para montar um número do Painel.
export function parcelasEmAbertoTotal(contratos) {
  return contratos.reduce((s, c) => s + (c.parcelasEmAberto || 0), 0);
}

export function inadimplenciaTotal() {
  return agingInadimplencia.reduce((s, b) => s + b.value, 0);
}

export function guiasPorParceiro(guias) {
  const map = {};
  guias.forEach((g) => {
    map[g.parceiroId] = map[g.parceiroId] || { parceiroId: g.parceiroId, total: 0, valor: 0 };
    map[g.parceiroId].total += 1;
    map[g.parceiroId].valor += g.valorAcordado;
  });
  return Object.values(map).sort((a, b) => b.total - a.total);
}

// ---------- Dados do dashboard ----------
// `parceiros`/`contratos`/`planos`/`pagamentosReais`/`obitosReais`/`guiasReais` vêm dos
// caches/listas reativos da API — não são mais mockados, então o chamador (Dashboard.jsx)
// precisa repassar as listas.
export function dashboardData(periodo = 'mes', parceiros = [], contratos = [], planos = [], pagamentosReais = [], obitosReais = [], guiasReais = []) {
  const parceiroById = (id) => parceiros.find((p) => p.id === id);
  const planoById = (id) => planos.find((p) => p.id === id);
  const contratoValor = (c) => planoById(c.planoId)?.valorMensal || 0;

  const ativos = contratosAtivos(contratos).length;
  const avgMensalidade = contratosAtivos(contratos).reduce((s, c) => s + contratoValor(c), 0) / Math.max(1, ativos);
  const receitaRecebida = [...pagamentosReais, ...pagamentos]
    .filter((p) => inPeriodo(p.recebidoEm, periodo) && p.status !== 'Exceção')
    .reduce((s, p) => s + p.valor, 0);
  const receitaPrevista = ativos * avgMensalidade;
  const inad = inadimplenciaTotal();
  const inadPct = inad / (receitaPrevista + inad);

  const novos = contratos.filter((c) => inPeriodo(c.criadoEm, periodo)).length;
  const cancelamentos = contratos.filter((c) => c.situacao === 'Cancelado' && inPeriodo(c.canceladoEm, periodo)).length;

  const emprestadas = unidadesEquipamento.filter((u) => u.status === 'Emprestado').length;
  const atrasadasDevolucao = emprestimosAtrasados().length;
  const vendidosNoMes = vendasEquipamento.filter((v) => inPeriodo(v.data, periodo)).length;

  const obitosPeriodo = obitosReais.filter((o) => inPeriodo(o.abertoEm, periodo));

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
      porParceiro: guiasPorParceiro(guiasReais).slice(0, 4).map((g) => ({
        parceiro: parceiroById(g.parceiroId)?.nomeFantasia || g.parceiroId,
        total: g.total,
      })),
    },
    alertas: [
      { tipo: 'danger', icon: 'receipt', label: `${parcelasEmAbertoTotal(contratos)} carnês/parcelas em aberto`, to: '/financeiro' },
      { tipo: 'warning', icon: 'wheelchair', label: `${atrasadasDevolucao} devoluções de equipamento atrasadas`, to: '/emprestimos' },
      { tipo: 'info', icon: 'refresh', label: '4 planos a renovar nos próximos 30 dias', to: '/planos' },
      { tipo: 'warning', icon: 'doc', label: `${nfPendentes} notas fiscais pendentes ou rejeitadas`, to: '/notas-fiscais' },
      { tipo: 'danger', icon: 'cash', label: `${filaExcecoes().length} pagamentos em exceção de conciliação`, to: '/pagamentos' },
    ],
    serieReceita: fluxoCaixa.slice(-8).map((f) => f.entradas),
  };
}
