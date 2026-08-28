import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { initials } from '../lib/format.js';

/*
  Autenticação — MOCK (sem backend).
  Qualquer e-mail/senha entra; o login "com o Google" usa uma conta fictícia.
  A sessão é persistida em localStorage só para sobreviver a um reload.
  Quando o backend existir, troque as funções login/register/*Google por chamadas de API.
*/

const AuthContext = createContext(null);
const STORAGE_KEY = 'canaa.auth';

// Conta Google fictícia — os dados "chegam" preenchidos no cadastro com o Google.
export const GOOGLE_ACCOUNT = {
  name: 'Camila Souza Andrade',
  email: 'camila.andrade@gmail.com',
};

function nameFromEmail(email) {
  return String(email || '').split('@')[0]
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Usuário Canaã';
}

function buildUser({ name, email }, via) {
  const finalName = (name && name.trim()) || nameFromEmail(email);
  return {
    name: finalName,
    email: String(email || '').trim().toLowerCase(),
    initials: initials(finalName),
    via, // 'password' | 'google'
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
    const u = buildUser({ email }, 'password');
    persist(u);
    return u;
  }, [persist]);

  const register = useCallback(({ name, email }) => {
    const u = buildUser({ name, email }, 'password');
    persist(u);
    return u;
  }, [persist]);

  // Login/cadastro "com o Google": dados vêm da conta fictícia.
  const authWithGoogle = useCallback(() => {
    const u = buildUser(GOOGLE_ACCOUNT, 'google');
    persist(u);
    return u;
  }, [persist]);

  const logout = useCallback(() => persist(null), [persist]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loginWithGoogle: authWithGoogle,
    registerWithGoogle: authWithGoogle,
    googleAccount: GOOGLE_ACCOUNT,
  }), [user, login, register, logout, authWithGoogle]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
