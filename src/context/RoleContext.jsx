import { createContext, useContext, useMemo, useState } from 'react';

// Perfis de acesso do PRD (seção 2).
export const ROLES = [
  { id: 'admin', name: 'Administrador', desc: 'Acesso total, configurações e relatórios financeiros', avatar: 'Ad' },
  { id: 'atendente', name: 'Atendente', desc: 'Cadastros, vendas, carnês, registro de óbito', avatar: 'At' },
  { id: 'financeiro', name: 'Financeiro', desc: 'Conciliação, inadimplência, emissão de NF', avatar: 'Fi' },
  { id: 'operacional', name: 'Operacional', desc: 'Empréstimo, devolução e conferência de equipamentos', avatar: 'Op' },
  { id: 'parceiro', name: 'Parceiro comercial', desc: 'Portal restrito: consulta de plano e baixa de atendimento', avatar: 'Pc' },
];

const RoleContext = createContext(null);

export function RoleProvider({ children }) {
  const [roleId, setRoleId] = useState('admin');
  const value = useMemo(() => {
    const role = ROLES.find((r) => r.id === roleId) || ROLES[0];
    return { role, roleId, setRoleId, roles: ROLES };
  }, [roleId]);
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole deve ser usado dentro de RoleProvider');
  return ctx;
}
