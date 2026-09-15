// Parâmetros e auditoria (transversal).
// Usuários e Unidades vêm do banco real (src/lib/api.js: useUsuariosList/useUnidadesList).
// Empresa, Perfis/Permissões e Backups também são reais desde a Fase 9 (server/config/).

export const parametros = [
  { chave: 'Dias de tolerância antes de "Em atraso"', valor: '5 dias' },
  { chave: 'Dias de inadimplência para suspensão do plano', valor: '45 dias' },
  { chave: 'Bloqueio de cobertura por inadimplência', valor: 'Alertar (não bloquear) até 60 dias' },
  { chave: 'Valor máximo de baixa de parceiro sem aprovação', valor: 'R$ 1.500,00' },
  { chave: 'Reajuste anual padrão dos planos', valor: 'IPCA acumulado 12 meses' },
  { chave: 'Expiração de sessão', valor: '30 minutos de inatividade' },
  { chave: '2FA obrigatório', valor: 'Perfis Administrador e Financeiro' },
  { chave: 'Retenção de backups', valor: '7 diários · 4 semanais · 12 mensais' },
];

// ---- Trilha de auditoria (RNF-06) ----
export const auditoria = [
  { quando: '2026-08-27T09:02:11', usuario: 'Sandra Duarte', acao: 'Abriu registro de óbito', entidade: 'OB-2026-0040', ip: '177.32.10.4' },
  { quando: '2026-08-27T08:41:55', usuario: 'Marcelo Tostes', acao: 'Baixa manual de pagamento', entidade: 'PG-2026-2038', ip: '187.5.44.9' },
  { quando: '2026-08-27T08:12:03', usuario: 'Portal — documenta.andre', acao: 'Registrou baixa de plano', entidade: 'BX-2026-0085', ip: '187.33.201.9' },
  { quando: '2026-08-26T22:10:40', usuario: 'Portal — boaviagem.wagner', acao: 'Atualizou status de guia', entidade: 'GA-2026-00121', ip: '201.44.90.11' },
  { quando: '2026-08-26T18:22:00', usuario: 'Renato Aguiar', acao: 'Emitiu guia', entidade: 'GA-2026-00123', ip: '177.32.10.9' },
  { quando: '2026-08-26T14:05:19', usuario: 'Ana Paula Ferraz', acao: 'Alterou parâmetro do sistema', entidade: 'Tolerância de inadimplência', ip: '187.5.44.2' },
  { quando: '2026-08-25T16:50:31', usuario: 'Bianca Correia', acao: 'Cancelou nota fiscal', entidade: 'NF-2026-0459', ip: '187.5.44.7' },
  { quando: '2026-08-24T15:35:02', usuario: 'Portal — jardimoliveiras.paulo', acao: 'Registrou baixa de plano', entidade: 'BX-2026-0088', ip: '187.62.14.203' },
  { quando: '2026-08-24T03:52:00', usuario: 'Sistema', acao: 'Backup reprocessado com sucesso', entidade: 'BKP-2026-08-24', ip: '—' },
  { quando: '2026-08-24T03:05:12', usuario: 'Sistema', acao: 'Falha de backup — alerta enviado', entidade: 'BKP-2026-08-24', ip: '—' },
];
