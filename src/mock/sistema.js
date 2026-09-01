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

// ---- Dados cadastrais da empresa (matriz) ----
export const empresa = {
  razaoSocial: 'Funerária Canaã Serviços Póstumos Ltda',
  nomeFantasia: 'Funerária Canaã',
  cnpj: '12.345.678/0001-90',
  inscricaoEstadual: '111.222.333.444',
  inscricaoMunicipal: '9.876.543-2',
  regimeTributario: 'Lucro Presumido',
  cnae: '9603-3/01 — Gestão e manutenção de cemitérios',
  endereco: { logradouro: 'Avenida das Nações', numero: '1200', complemento: 'Bloco A', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP', cep: '01010-000' },
  telefone: '(11) 3000-1000',
  email: 'contato@funerariacanaa.com',
  site: 'www.funerariacanaa.com',
  responsavelLegal: 'Ana Paula Ferraz',
  contador: 'Contabilidade Nova Era — CRC-SP 1SP-045123',
};

export const unidades = [
  {
    id: 'UNI-01', nome: 'Matriz — Centro', tipo: 'Matriz', cnpj: '12.345.678/0001-90',
    responsavel: 'Ana Paula Ferraz', telefone: '(11) 3000-1000', email: 'centro@funerariacanaa.com',
    cidade: 'São Paulo', uf: 'SP', status: 'Ativa',
    endereco: { logradouro: 'Avenida das Nações', numero: '1200', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP', cep: '01010-000' },
    horario: '24 horas', alvara: 'ALV-2024-000145', salasVelorio: 3, capela: true,
  },
  {
    id: 'UNI-02', nome: 'Filial Zona Sul', tipo: 'Filial', cnpj: '12.345.678/0002-70',
    responsavel: 'Sandra Regina Duarte', telefone: '(11) 3555-2020', email: 'zonasul@funerariacanaa.com',
    cidade: 'São Paulo', uf: 'SP', status: 'Ativa',
    endereco: { logradouro: 'Rua Vergueiro', numero: '4500', bairro: 'Saúde', cidade: 'São Paulo', uf: 'SP', cep: '04101-300' },
    horario: '24 horas', alvara: 'ALV-2024-000212', salasVelorio: 2, capela: true,
  },
  {
    id: 'UNI-03', nome: 'Filial Guarulhos', tipo: 'Filial', cnpj: '12.345.678/0003-50',
    responsavel: 'Renato Aguiar', telefone: '(11) 2400-3030', email: 'guarulhos@funerariacanaa.com',
    cidade: 'Guarulhos', uf: 'SP', status: 'Ativa',
    endereco: { logradouro: 'Av. Tiradentes', numero: '820', bairro: 'Vila Augusta', cidade: 'Guarulhos', uf: 'SP', cep: '07023-000' },
    horario: '07:00 às 22:00', alvara: 'ALV-2023-000988', salasVelorio: 2, capela: false,
  },
  {
    id: 'UNI-04', nome: 'Unidade Administrativa', tipo: 'Escritório', cnpj: '12.345.678/0004-31',
    responsavel: 'Marcelo Tostes', telefone: '(11) 3000-1044', email: 'adm@funerariacanaa.com',
    cidade: 'São Paulo', uf: 'SP', status: 'Ativa',
    endereco: { logradouro: 'Avenida das Nações', numero: '1200', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP', cep: '01010-000' },
    horario: '08:00 às 18:00', alvara: '—', salasVelorio: 0, capela: false,
  },
  {
    id: 'UNI-05', nome: 'Filial ABC (em implantação)', tipo: 'Filial', cnpj: '12.345.678/0005-12',
    responsavel: 'A definir', telefone: '(11) 4000-5050', email: 'abc@funerariacanaa.com',
    cidade: 'Santo André', uf: 'SP', status: 'Inativa',
    endereco: { logradouro: 'Av. Industrial', numero: '2100', bairro: 'Jardim', cidade: 'Santo André', uf: 'SP', cep: '09080-500' },
    horario: '—', alvara: 'Em análise', salasVelorio: 2, capela: true,
  },
];

export const unidadeById = (id) => unidades.find((u) => u.id === id);

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
