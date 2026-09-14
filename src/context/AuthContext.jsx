import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { initials } from '../lib/format.js';
import { apiFetch, getToken, setToken } from '../lib/api.js';

/*
  Autenticação real — login/logout/sessão via API PHP (server/auth/*.php).
  O token fica em localStorage (canaa.token); os dados do usuário logado ficam
  em canaa.auth só para exibir algo instantaneamente antes de validar com /auth/me.
*/

const AuthContext = createContext(null);
const STORAGE_KEY = 'canaa.auth';

function buildUser(usuario) {
  return {
    name: usuario.nome,
    email: usuario.email,
    initials: initials(usuario.nome),
    perfil: usuario.perfil,
    since: new Date().toISOString(),
  };
}

function readStored() {
  // Um usuário salvo sem token é resquício de sessão antiga (ou storage adulterado) — inválido.
  if (!getToken()) return null;
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStored);
  const [checking, setChecking] = useState(Boolean(getToken()));

  const persist = useCallback((next) => {
    setUser(next);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* localStorage indisponível — segue só em memória */
    }
  }, []);

  // Ao montar, se houver um token salvo, valida contra a API — token expirado/inválido derruba a sessão.
  useEffect(() => {
    const token = getToken();
    if (!token) { persist(null); setChecking(false); return; }
    apiFetch('/auth/me.php')
      .then(({ usuario }) => persist(buildUser(usuario)))
      .catch(() => { setToken(null); persist(null); })
      .finally(() => setChecking(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async ({ email, senha }) => {
    const { token, usuario } = await apiFetch('/auth/login.php', { method: 'POST', body: { email, senha } });
    setToken(token);
    const u = buildUser(usuario);
    persist(u);
    return u;
  }, [persist]);

  const logout = useCallback(() => {
    apiFetch('/auth/logout.php', { method: 'POST' }).catch(() => {});
    setToken(null);
    persist(null);
  }, [persist]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    checking,
    login,
    logout,
  }), [user, checking, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
