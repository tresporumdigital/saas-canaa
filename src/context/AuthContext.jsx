import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { initials } from '../lib/format.js';

/*
  Autenticação — MOCK (sem backend).
  Só login com e-mail e senha; qualquer combinação entra. As contas do sistema são
  criadas por um administrador — não há cadastro nem login social nesta camada.
  A sessão é persistida em localStorage apenas para sobreviver a um reload.
  Quando o backend existir, troque `login` por uma chamada de API.
*/

const AuthContext = createContext(null);
const STORAGE_KEY = 'canaa.auth';

function nameFromEmail(email) {
  return String(email || '').split('@')[0]
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Usuário Canaã';
}

function buildUser(email) {
  const name = nameFromEmail(email);
  return {
    name,
    email: String(email || '').trim().toLowerCase(),
    initials: initials(name),
    since: new Date().toISOString(),
  };
}

function readStored() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStored);

  const persist = useCallback((next) => {
    setUser(next);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* localStorage indisponível — segue só em memória */
    }
  }, []);

  // Mock: a senha é ignorada; qualquer valor autentica.
  const login = useCallback(({ email }) => {
    const u = buildUser(email);
    persist(u);
    return u;
  }, [persist]);

  const logout = useCallback(() => persist(null), [persist]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    logout,
  }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
