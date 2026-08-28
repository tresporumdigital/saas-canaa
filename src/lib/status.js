// Mapeia status de domínio -> variante visual de Badge ('success' | 'warning' | 'danger' | 'info' | 'neutral').

const MAP = {
  // Planos / contratos
  'Ativo': 'success',
  'Em atraso': 'warning',
  'Suspenso': 'danger',
  'Cancelado': 'neutral',
  'Encerrado': 'neutral',
  // Guias
  'Emitida': 'info',
  'Enviada': 'info',
  'Aceita': 'info',
  'Em execução': 'warning',
  'Concluída': 'success',
  'Faturada': 'success',
  'Cancelada': 'danger',
  // Atendimento de óbito
  'Aberto': 'info',
  'Em andamento': 'warning',
  'Concluído': 'success',
  // Leads
  'Novo': 'info',
  'Em contato': 'warning',
  'Convertido': 'success',
  'Perdido': 'danger',
  // Unidades de equipamento
  'Disponível': 'success',
  'Emprestado': 'info',
  'Em manutenção': 'warning',
  'Baixado': 'neutral',
  // Empréstimos
  'Em vigência': 'info',
  'Devolvido': 'success',
  'Atrasado': 'danger',
  // Notas fiscais
  'Pendente': 'warning',
  'Emitida NF': 'success',
  'Autorizada': 'success',
  'Rejeitada': 'danger',
  // Financeiro / parcelas
  'Pago': 'success',
  'Em aberto': 'warning',
  'Vencido': 'danger',
  'Negociado': 'info',
  // Pagamentos / conciliação
  'Conciliado': 'success',
  'Exceção': 'danger',
  'Baixa manual': 'info',
  // Backups
  'Sucesso': 'success',
  'Falha': 'danger',
  // Genéricos
  'Inativo': 'neutral',
  'Aprovado': 'success',
  'Aguardando aprovação': 'warning',
};

export function statusVariant(status) {
  return MAP[status] || 'neutral';
}

// Conjuntos de status pré-definidos por listagem — alimentam o <StatusMenu>
// (troca de status direto na tabela). Protótipo: a troca é só visual, sem persistência.
export const STATUS_SETS = {
  clienteCadastro: ['Ativo', 'Inativo'],
  clientePlano: ['Ativo', 'Em atraso', 'Suspenso', 'Sem plano'],
  parceiro: ['Ativo', 'Inativo'],
  obito: ['Aberto', 'Em andamento', 'Concluído'],
  guia: ['Emitida', 'Enviada', 'Aceita', 'Em execução', 'Concluída', 'Faturada', 'Cancelada'],
  contrato: ['Ativo', 'Em atraso', 'Suspenso', 'Cancelado', 'Encerrado'],
  lead: ['Novo', 'Em contato', 'Convertido', 'Perdido'],
  usuario: ['Ativo', 'Inativo'],
  notaFiscal: ['Pendente', 'Autorizada', 'Rejeitada', 'Cancelada'],
  pagamento: ['Conciliado', 'Exceção', 'Baixa manual'],
  emprestimo: ['Em vigência', 'Devolvido', 'Atrasado'],
  unidadeEquipamento: ['Disponível', 'Emprestado', 'Em manutenção', 'Baixado'],
  contaFinanceira: ['Pago', 'Em aberto', 'Vencido', 'Negociado'],
};
