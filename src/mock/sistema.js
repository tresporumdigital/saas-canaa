// Usuários, perfis, backups e auditoria (transversal).

export const usuarios = [
  { id: 'USR-01', nome: 'Ana Paula Ferraz', email: 'ana.ferraz@funerariacanaa.com', perfil: 'Administrador', status: 'Ativo', ultimoAcesso: '2026-08-27T08:40:00', doisFatores: true },
  { id: 'USR-02', nome: 'Sandra Regina Duarte', email: 'sandra.duarte@funerariacanaa.com', perfil: 'Atendente', status: 'Ativo', ultimoAcesso: '2026-08-27T09:02:00', doisFatores: false },
  { id: 'USR-03', nome: 'Renato Aguiar', email: 'renato.aguiar@funerariacanaa.com', perfil: 'Atendente', status: 'Ativo', ultimoAcesso: '2026-08-26T18:20:00', doisFatores: false },
  { id: 'USR-04', nome: 'Marcelo Tostes', email: 'marcelo.tostes@funerariacanaa.com', perfil: 'Financeiro', status: 'Ativo', ultimoAcesso: '2026-08-27T07:15:00', doisFatores: true },
  { id: 'USR-05', nome: 'Bianca Correia', email: 'bianca.correia@funerariacanaa.com', perfil: 'Financeiro', status: 'Ativo', ultimoAcesso: '2026-08-25T16:50:00', doisFatores: true },
  { id: 'USR-06', nome: 'Jorge Peçanha', email: 'jorge.pecanha@funerariacanaa.com', perfil: 'Operacional', status: 'Ativo', ultimoAcesso: '2026-08-27T06:30:00', doisFatores: false },
  { id: 'USR-07', nome: 'Lílian Baptista', email: 'lilian.baptista@funerariacanaa.com', perfil: 'Operacional', status: 'Inativo', ultimoAcesso: '2026-05-11T10:00:00', doisFatores: false },
  { id: 'USR-08', nome: 'Diretoria Canaã', email: 'diretoria@funerariacanaa.com', perfil: 'Administrador', status: 'Ativo', ultimoAcesso: '2026-08-20T21:10:00', doisFatores: true },
];

export const perfisPermissoes = [
  { modulo: 'Dashboard', admin: 'Total', atendente: 'Sem financeiro global', financeiro: 'Total', operacional: 'Equipamentos e atendimentos', parceiro: '—' },
  { modulo: 'Clientes', admin: 'Total', atendente: 'Total', financeiro: 'Leitura + situação financeira', operacional: 'Leitura', parceiro: '—' },
  { modulo: 'Parceiros', admin: 'Total', atendente: 'Leitura', financeiro: 'Leitura + repasses', operacional: '—', parceiro: '—' },
  { modulo: 'Registro de óbito', admin: 'Total', atendente: 'Total', financeiro: 'Leitura', operacional: 'Leitura', parceiro: '—' },
  { modulo: 'Guias', admin: 'Total', atendente: 'Emitir e acompanhar', financeiro: 'Faturar', operacional: '—', parceiro: 'Aceitar e atualizar (portal)' },
  { modulo: 'Planos e contratos', admin: 'Total', atendente: 'Contratar', financeiro: 'Cobrança e acordos', operacional: '—', parceiro: '—' },
  { modulo: 'Financeiro', admin: 'Total', atendente: '—', financeiro: 'Total', operacional: '—', parceiro: '—' },
  { modulo: 'Equipamentos', admin: 'Total', atendente: 'Vender', financeiro: 'Leitura', operacional: 'Empréstimo e devolução', parceiro: '—' },
  { modulo: 'Notas fiscais', admin: 'Total', atendente: '—', financeiro: 'Emitir e cancelar', operacional: '—', parceiro: '—' },
  { modulo: 'Portal do parceiro', admin: 'Configurar', atendente: '—', financeiro: 'Conferir extratos', operacional: '—', parceiro: 'Consulta e baixa própria' },
  { modulo: 'Configurações', admin: 'Total', atendente: '—', financeiro: '—', operacional: '—', parceiro: '—' },
];

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

// ---- Backups automáticos (RF-89..RF-95) ----
const pad = (n) => String(n).padStart(2, '0');
export const backupConfig = {
  destino: 'Object Storage externo (região secundária) — criptografia AES-256',
  retencao: { diarios: 7, semanais: 4, mensais: 12 },
  janela: '03:00 (horário de Brasília)',
  rpo: '≤ 24h',
  rto: '≤ 4h',
  ultimoTesteRestauracao: '2026-08-01',
};

export const backupExecucoes = (() => {
  const out = [];
  for (let i = 0; i < 20; i++) {
    const dia = 27 - i;
    const semanal = i % 7 === 0;
    const falha = i === 3; // 24/08 falhou
    out.push({
      id: `BKP-2026-08-${pad(dia)}`,
      quando: `2026-08-${pad(dia)}T03:0${i % 6}:00`,
      tipo: semanal ? 'Semanal' : 'Diário',
      status: falha ? 'Falha' : 'Sucesso',
      tamanho: falha ? '—' : `${(4.1 + i * 0.03).toFixed(2)} GB`,
      duracao: falha ? '—' : `${8 + (i % 5)} min`,
      mensagem: falha ? 'Timeout ao enviar para o storage externo. Alerta enviado ao administrador; reprocessado com sucesso às 03:52.' : null,
    });
  }
  return out;
})();

export const ultimoBackup = backupExecucoes[0];

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
