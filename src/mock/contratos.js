import { planoById } from './planos.js';

// Contratos de plano (RF-32..RF-39). Um contrato por cliente titular.
export const contratos = [
  { id: 'CTR-2026-0001', clienteId: 'CLI-0001', planoId: 'PL-FAM', inicio: '2021-05-01', diaVencimento: 10, formaPagamento: 'Boleto', vendedor: 'Sandra Duarte', situacao: 'Ativo', parcelasEmAberto: 0 },
  { id: 'CTR-2026-0002', clienteId: 'CLI-0002', planoId: 'PL-SEN', inicio: '2019-09-01', diaVencimento: 5, formaPagamento: 'Boleto', vendedor: 'Renato Aguiar', situacao: 'Em atraso', parcelasEmAberto: 2 },
  { id: 'CTR-2026-0003', clienteId: 'CLI-0003', planoId: 'PL-FAM', inicio: '2022-03-01', diaVencimento: 15, formaPagamento: 'Pix', vendedor: 'Sandra Duarte', situacao: 'Ativo', parcelasEmAberto: 0 },
  { id: 'CTR-2026-0004', clienteId: 'CLI-0004', planoId: 'PL-ESS', inicio: '2020-12-01', diaVencimento: 20, formaPagamento: 'Cartão recorrente', vendedor: 'Renato Aguiar', situacao: 'Ativo', parcelasEmAberto: 0 },
  { id: 'CTR-2026-0005', clienteId: 'CLI-0005', planoId: 'PL-SEN', inicio: '2018-06-01', diaVencimento: 5, formaPagamento: 'Boleto', vendedor: 'Renato Aguiar', situacao: 'Ativo', parcelasEmAberto: 0 },
  { id: 'CTR-2026-0006', clienteId: 'CLI-0006', planoId: 'PL-PREM', inicio: '2023-10-01', diaVencimento: 10, formaPagamento: 'Boleto', vendedor: 'Sandra Duarte', situacao: 'Ativo', parcelasEmAberto: 0 },
  { id: 'CTR-2026-0007', clienteId: 'CLI-0007', planoId: 'PL-FAM', inicio: '2017-04-01', diaVencimento: 1, formaPagamento: 'Pix', vendedor: 'Renato Aguiar', situacao: 'Ativo', parcelasEmAberto: 0 },
  { id: 'CTR-2026-0008', clienteId: 'CLI-0008', planoId: 'PL-ESS', inicio: '2016-08-01', diaVencimento: 25, formaPagamento: 'Boleto', vendedor: 'Renato Aguiar', situacao: 'Suspenso', parcelasEmAberto: 4 },
  { id: 'CTR-2026-0009', clienteId: 'CLI-0009', planoId: 'PL-ESS', inicio: '2024-02-01', diaVencimento: 10, formaPagamento: 'Cartão recorrente', vendedor: 'Sandra Duarte', situacao: 'Ativo', parcelasEmAberto: 0 },
  { id: 'CTR-2026-0010', clienteId: 'CLI-0010', planoId: 'PL-FAM', inicio: '2019-11-01', diaVencimento: 15, formaPagamento: 'Boleto', vendedor: 'Renato Aguiar', situacao: 'Ativo', parcelasEmAberto: 0 },
  { id: 'CTR-2026-0011', clienteId: 'CLI-0011', planoId: 'PL-SEN', inicio: '2023-01-01', diaVencimento: 20, formaPagamento: 'Boleto', vendedor: 'Sandra Duarte', situacao: 'Em atraso', parcelasEmAberto: 1 },
  { id: 'CTR-2026-0012', clienteId: 'CLI-0012', planoId: 'PL-ESS', inicio: '2015-10-01', diaVencimento: 5, formaPagamento: 'Boleto', vendedor: 'Renato Aguiar', situacao: 'Cancelado', parcelasEmAberto: 0, canceladoEm: '2026-03-10', motivoCancelamento: 'Solicitação do cliente' },
  { id: 'CTR-2026-0013', clienteId: 'CLI-0013', planoId: 'PL-FAM', inicio: '2020-07-01', diaVencimento: 10, formaPagamento: 'Pix', vendedor: 'Sandra Duarte', situacao: 'Ativo', parcelasEmAberto: 0 },
  { id: 'CTR-2026-0014', clienteId: 'CLI-0014', planoId: 'PL-PREM', inicio: '2023-05-01', diaVencimento: 1, formaPagamento: 'Boleto', vendedor: 'Renato Aguiar', situacao: 'Ativo', parcelasEmAberto: 0 },
  { id: 'CTR-2026-0015', clienteId: 'CLI-0015', planoId: 'PL-SEN', inicio: '2018-12-01', diaVencimento: 15, formaPagamento: 'Boleto', vendedor: 'Renato Aguiar', situacao: 'Ativo', parcelasEmAberto: 0 },
  { id: 'CTR-2026-0016', clienteId: 'CLI-0016', planoId: 'PL-ESS', inicio: '2017-09-01', diaVencimento: 20, formaPagamento: 'Boleto', vendedor: 'Renato Aguiar', situacao: 'Em atraso', parcelasEmAberto: 3 },
  { id: 'CTR-2026-0017', clienteId: 'CLI-0017', planoId: 'PL-FAM', inicio: '2024-08-01', diaVencimento: 10, formaPagamento: 'Cartão recorrente', vendedor: 'Sandra Duarte', situacao: 'Ativo', parcelasEmAberto: 0 },
  { id: 'CTR-2026-0018', clienteId: 'CLI-0018', planoId: 'PL-SEN', inicio: '2016-03-01', diaVencimento: 5, formaPagamento: 'Boleto', vendedor: 'Renato Aguiar', situacao: 'Ativo', parcelasEmAberto: 0 },
  { id: 'CTR-2026-0019', clienteId: 'CLI-0019', planoId: 'PL-ESS', inicio: '2021-11-01', diaVencimento: 25, formaPagamento: 'Pix', vendedor: 'Sandra Duarte', situacao: 'Ativo', parcelasEmAberto: 0 },
  { id: 'CTR-2026-0020', clienteId: 'CLI-0020', planoId: 'PL-FAM', inicio: '2025-03-01', diaVencimento: 10, formaPagamento: 'Boleto', vendedor: 'Sandra Duarte', situacao: 'Ativo', parcelasEmAberto: 0 },
];

export function contratoValor(contrato) {
  return planoById(contrato.planoId)?.valorMensal || 0;
}

export const contratoById = (id) => contratos.find((c) => c.id === id);
export const contratosDoCliente = (clienteId) => contratos.filter((c) => c.clienteId === clienteId);

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const pad = (n) => String(n).padStart(2, '0');

// Gera 12 competências recorrentes terminando no mês corrente (ago/2026) — RF-33.
export function parcelasDoContrato(contrato) {
  const valor = contratoValor(contrato);
  const emAberto = contrato.parcelasEmAberto || 0;
  const out = [];
  let ano = 2025;
  let mes = 9; // set/2025 .. ago/2026 = 12 competências
  for (let i = 0; i < 12; i++) {
    const idx = 11 - i; // 0 = mais recente
    const cancelado = contrato.situacao === 'Cancelado' && i >= 6;
    let status = 'Pago';
    if (contrato.situacao === 'Cancelado') status = i >= 6 ? 'Cancelado' : 'Pago';
    else if (idx < emAberto) status = idx === 0 ? 'Em aberto' : 'Vencido';
    if (contrato.id === 'CTR-2026-0002' && idx === 2) status = 'Negociado';
    out.push({
      id: `${contrato.id}-P${pad(i + 1)}`,
      contratoId: contrato.id,
      competencia: `${MESES[mes - 1]}/${String(ano).slice(2)}`,
      vencimento: `${ano}-${pad(mes)}-${pad(contrato.diaVencimento)}`,
      valor,
      status: cancelado ? 'Cancelado' : status,
      pagoEm: status === 'Pago' ? `${ano}-${pad(mes)}-${pad(Math.min(28, contrato.diaVencimento + 2))}` : null,
      forma: contrato.formaPagamento,
    });
    mes += 1;
    if (mes > 12) { mes = 1; ano += 1; }
  }
  return out.reverse(); // mais recente primeiro
}
