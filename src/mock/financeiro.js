// Controle financeiro (RF-112..RF-120).

// Contas a receber (origem: planos, vendas, atendimentos)
export const contasReceber = [
  { id: 'AR-4021', origem: 'Plano', ref: 'CTR-2026-0002', clienteNome: 'José Ribeiro da Silva', categoria: 'Mensalidade de plano', centroCusto: 'Planos', vencimento: '2026-08-05', valor: 119.9, status: 'Vencido' },
  { id: 'AR-4020', origem: 'Plano', ref: 'CTR-2026-0011', clienteNome: 'Luiza Helena Barros', categoria: 'Mensalidade de plano', centroCusto: 'Planos', vencimento: '2026-08-20', valor: 119.9, status: 'Vencido' },
  { id: 'AR-4019', origem: 'Plano', ref: 'CTR-2026-0016', clienteNome: 'Sebastião Oliveira Cruz', categoria: 'Mensalidade de plano', centroCusto: 'Planos', vencimento: '2026-08-20', valor: 89.9, status: 'Vencido' },
  { id: 'AR-4018', origem: 'Plano', ref: 'CTR-2026-0008', clienteNome: 'Francisco das Chagas Souza', categoria: 'Mensalidade de plano', centroCusto: 'Planos', vencimento: '2026-08-25', valor: 89.9, status: 'Vencido' },
  { id: 'AR-4017', origem: 'Atendimento', ref: 'OB-2026-0040', clienteNome: 'Marli Teixeira', categoria: 'Atendimento particular', centroCusto: 'Atendimentos', vencimento: '2026-09-03', valor: 2970, status: 'Em aberto' },
  { id: 'AR-4016', origem: 'Atendimento', ref: 'OB-2026-0042', clienteNome: 'Ricardo Gomes', categoria: 'Serviço extra (não coberto)', centroCusto: 'Atendimentos', vencimento: '2026-09-05', valor: 260, status: 'Em aberto' },
  { id: 'AR-4015', origem: 'Venda de equipamento', ref: 'VEQ-2026-0014', clienteNome: 'Casa de Repouso Bem Viver', categoria: 'Venda de equipamento', centroCusto: 'Equipamentos', vencimento: '2026-09-21', valor: 2060, status: 'Em aberto' },
  { id: 'AR-4014', origem: 'Plano', ref: 'CTR-2026-0001', clienteNome: 'Marina Alves Costa', categoria: 'Mensalidade de plano', centroCusto: 'Planos', vencimento: '2026-09-10', valor: 149.9, status: 'Em aberto' },
  { id: 'AR-4013', origem: 'Locação de equipamento', ref: 'EMP-2026-0030', clienteNome: 'Roberto Carlos Antunes', categoria: 'Locação de equipamento', centroCusto: 'Equipamentos', vencimento: '2026-08-10', valor: 180, status: 'Vencido' },
  { id: 'AR-4012', origem: 'Locação de equipamento', ref: 'EMP-2026-0029', clienteNome: 'Antônio Carlos Ferreira', categoria: 'Locação de equipamento', centroCusto: 'Equipamentos', vencimento: '2026-09-18', valor: 320, status: 'Em aberto' },
];

// Contas a pagar (repasses a parceiros, fornecedores, despesas fixas)
export const contasPagar = [
  { id: 'AP-3110', origem: 'Repasse a parceiro', ref: 'PAR-003', favorecido: 'Jardim das Oliveiras', categoria: 'Repasse — sepultamento', centroCusto: 'Parceiros', vencimento: '2026-09-05', valor: 5550, status: 'Em aberto' },
  { id: 'AP-3109', origem: 'Repasse a parceiro', ref: 'PAR-004', favorecido: 'Memorial Bosque', categoria: 'Repasse — cremação', centroCusto: 'Parceiros', vencimento: '2026-09-05', valor: 4800, status: 'Em aberto' },
  { id: 'AP-3108', origem: 'Repasse a parceiro', ref: 'PAR-001', favorecido: 'Boa Viagem Translados', categoria: 'Repasse — translado', centroCusto: 'Parceiros', vencimento: '2026-09-05', valor: 1440, status: 'Em aberto' },
  { id: 'AP-3107', origem: 'Despesa fixa', ref: null, favorecido: 'Aluguel — sede administrativa', categoria: 'Ocupação', centroCusto: 'Administrativo', vencimento: '2026-09-10', valor: 8200, status: 'Em aberto' },
  { id: 'AP-3106', origem: 'Despesa fixa', ref: null, favorecido: 'Folha de pagamento (líquida)', categoria: 'Pessoal', centroCusto: 'Administrativo', vencimento: '2026-09-05', valor: 41800, status: 'Em aberto' },
  { id: 'AP-3105', origem: 'Fornecedor', ref: 'PAR-008', favorecido: 'Luz Eterna Urnas', categoria: 'Compra de urnas', centroCusto: 'Estoque', vencimento: '2026-09-12', valor: 6300, status: 'Em aberto' },
  { id: 'AP-3104', origem: 'Despesa fixa', ref: null, favorecido: 'Energia + água + internet', categoria: 'Utilidades', centroCusto: 'Administrativo', vencimento: '2026-09-08', valor: 2350, status: 'Em aberto' },
  { id: 'AP-3103', origem: 'Repasse a parceiro', ref: 'PAR-005', favorecido: 'Arte Final Tanatopraxia', categoria: 'Repasse — preparação', centroCusto: 'Parceiros', vencimento: '2026-08-28', valor: 1950, status: 'Vencido' },
  { id: 'AP-3102', origem: 'Repasse a parceiro', ref: 'PAR-007', favorecido: 'Documenta', categoria: 'Repasse — documentação', centroCusto: 'Parceiros', vencimento: '2026-09-05', valor: 960, status: 'Em aberto' },
  { id: 'AP-3101', origem: 'Despesa fixa', ref: null, favorecido: 'Sistema de gestão + hospedagem', categoria: 'Tecnologia', centroCusto: 'Administrativo', vencimento: '2026-09-15', valor: 1290, status: 'Em aberto' },
];

// Fluxo de caixa mensal (realizado até jul; ago parcial; proj. set-nov) — em R$
export const fluxoCaixa = [
  { mes: 'mar/26', entradas: 118400, saidas: 96700, tipo: 'Realizado' },
  { mes: 'abr/26', entradas: 121950, saidas: 99200, tipo: 'Realizado' },
  { mes: 'mai/26', entradas: 126300, saidas: 101800, tipo: 'Realizado' },
  { mes: 'jun/26', entradas: 124100, saidas: 103400, tipo: 'Realizado' },
  { mes: 'jul/26', entradas: 129800, saidas: 105200, tipo: 'Realizado' },
  { mes: 'ago/26', entradas: 91200, saidas: 74600, tipo: 'Parcial' },
  { mes: 'set/26', entradas: 132500, saidas: 108900, tipo: 'Projetado' },
  { mes: 'out/26', entradas: 134200, saidas: 109600, tipo: 'Projetado' },
  { mes: 'nov/26', entradas: 136900, saidas: 110300, tipo: 'Projetado' },
];

// Inadimplência consolidada com aging (RF-116)
export const agingInadimplencia = [
  { label: '1–30 dias', value: 3210.4, recuperavel: 0.9 },
  { label: '31–60 dias', value: 2480.0, recuperavel: 0.7 },
  { label: '61–90 dias', value: 1790.0, recuperavel: 0.45 },
  { label: '+90 dias', value: 4120.0, recuperavel: 0.2 },
];

// Fechamento de caixa do dia (RF-117)
export const fechamentoCaixa = {
  data: '2026-08-26',
  entradasPorForma: [
    { forma: 'Boleto', valor: 4197.0, qtd: 28 },
    { forma: 'Pix', valor: 2098.6, qtd: 14 },
    { forma: 'Dinheiro', valor: 359.7, qtd: 3 },
    { forma: 'Cartão recorrente', valor: 899.4, qtd: 6 },
  ],
  sangrias: 200,
  conferido: true,
  responsavel: 'Ana Paula Ferraz (Financeiro)',
};

// DRE gerencial simplificado do mês (ago/2026, parcial) — RF-118
export const dreMes = {
  competencia: 'ago/2026 (parcial)',
  linhas: [
    { grupo: 'Receita bruta', conta: 'Mensalidades de planos', valor: 68400 },
    { grupo: 'Receita bruta', conta: 'Atendimentos particulares', valor: 12760 },
    { grupo: 'Receita bruta', conta: 'Venda e locação de equipamentos', valor: 9040 },
    { grupo: 'Deduções', conta: 'Impostos sobre serviços/vendas', valor: -6120 },
    { grupo: 'Deduções', conta: 'Cancelamentos e estornos', valor: -1480 },
    { grupo: 'Custos', conta: 'Repasses a parceiros', valor: -31650 },
    { grupo: 'Custos', conta: 'Custo de mercadoria vendida (equipamentos)', valor: -3120 },
    { grupo: 'Despesas', conta: 'Pessoal', valor: -41800 },
    { grupo: 'Despesas', conta: 'Ocupação e utilidades', valor: -10550 },
    { grupo: 'Despesas', conta: 'Tecnologia e administrativas', valor: -3860 },
  ],
};

export function dreResultado() {
  const t = dreMes.linhas.reduce((s, l) => s + l.valor, 0);
  return t;
}
