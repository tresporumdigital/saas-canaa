// Configuração de navegação: grupos (trilho de ícones) -> módulos (painel de labels).
// `roles`: perfis que enxergam o módulo. Ausente = todos os perfis internos (exceto 'parceiro').

export const ALL_INTERNAL = ['admin', 'atendente', 'financeiro', 'operacional'];

export const NAV = [
  {
    id: 'nucleo',
    label: 'Núcleo',
    icon: 'home',
    modules: [
      { path: '/', label: 'Painel', icon: 'grid', end: true },
      { path: '/clientes', label: 'Clientes', icon: 'users' },
      { path: '/parceiros', label: 'Parceiros', icon: 'briefcase', roles: ['admin', 'atendente', 'financeiro'] },
      { path: '/obitos', label: 'Registro de Óbito', icon: 'doc', roles: ['admin', 'atendente'] },
      { path: '/guias', label: 'Guias de Atendimento', icon: 'send', roles: ['admin', 'atendente', 'financeiro'] },
      { path: '/backups', label: 'Backups', icon: 'database', roles: ['admin'] },
    ],
  },
  {
    id: 'receita',
    label: 'Receita',
    icon: 'wallet',
    modules: [
      { path: '/planos', label: 'Planos', icon: 'shield', roles: ['admin', 'atendente', 'financeiro'] },
      { path: '/carnes', label: 'Carnês', icon: 'receipt', roles: ['admin', 'atendente', 'financeiro'] },
      { path: '/pagamentos', label: 'Pagamentos', icon: 'cash', roles: ['admin', 'financeiro'] },
      { path: '/financeiro', label: 'Controle Financeiro', icon: 'bars', roles: ['admin', 'financeiro'] },
    ],
  },
  {
    id: 'operacao',
    label: 'Operação',
    icon: 'box',
    modules: [
      { path: '/emprestimos', label: 'Empréstimo de Equipamentos', icon: 'wheelchair', roles: ['admin', 'operacional', 'atendente'] },
      { path: '/equipamentos', label: 'Vendas de Equipamentos', icon: 'box', roles: ['admin', 'operacional', 'atendente', 'financeiro'] },
      { path: '/equipamentos-cadastro', label: 'Cadastro de Equipamentos', icon: 'database', roles: ['admin', 'operacional'] },
      { path: '/notas-fiscais', label: 'Notas Fiscais', icon: 'receipt', roles: ['admin', 'financeiro'] },
    ],
  },
  {
    id: 'expansao',
    label: 'Expansão',
    icon: 'trend',
    modules: [
      { path: '/leads', label: 'Leads do Site', icon: 'flag', roles: ['admin', 'atendente'] },
      { path: '/portal-parceiro', label: 'Portal do Parceiro', icon: 'external', roles: ['admin', 'parceiro'] },
    ],
  },
  {
    id: 'config',
    label: 'Configurações',
    icon: 'gear',
    modules: [
      { path: '/configuracoes', label: 'Usuários', icon: 'users', end: true, roles: ['admin'] },
      { path: '/empresa', label: 'Empresa e Unidades', icon: 'briefcase', roles: ['admin'] },
    ],
  },
];

export function moduleAllowed(mod, roleId) {
  const roles = mod.roles || ALL_INTERNAL;
  return roles.includes(roleId);
}

export function visibleNav(roleId) {
  return NAV
    .map((g) => ({ ...g, modules: g.modules.filter((m) => moduleAllowed(m, roleId)) }))
    .filter((g) => g.modules.length > 0);
}

export function findGroupForPath(pathname, roleId) {
  const nav = visibleNav(roleId);
  const match = (mods) => mods.find((m) => (m.end ? pathname === m.path : pathname === m.path || pathname.startsWith(m.path + '/')));
  for (const g of nav) {
    if (match(g.modules)) return g;
  }
  return nav[0];
}
