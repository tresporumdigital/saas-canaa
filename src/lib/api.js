import { useEffect, useState, useSyncExternalStore } from 'react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_KEY = 'canaa.token';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* localStorage indisponível — segue só em memória */
  }
}

// Wrapper de fetch para a API própria: injeta o Bearer token, serializa o body
// em JSON e normaliza erros num Error(mensagem) pronto para usar com useToast().
export async function apiFetch(path, { method = 'GET', body, ...rest } = {}) {
  const token = getToken();
  const headers = { ...(rest.headers || {}) };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...rest,
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new Error(payload?.error || `Erro inesperado (${res.status}).`);
  }
  return payload?.data;
}

// Busca uma lista uma vez ao montar; devolve { rows, loading, error, reload }.
function useApiList(path, deps = []) {
  const [state, setState] = useState({ rows: [], loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    apiFetch(path)
      .then((rows) => { if (!cancelado) setState({ rows: rows || [], loading: false, error: null }); })
      .catch((e) => { if (!cancelado) setState({ rows: [], loading: false, error: e.message }); });
    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey, ...deps]);

  return { ...state, reload: () => setReloadKey((k) => k + 1) };
}

export function useClientesList() {
  return useApiList('/clientes/index.php');
}

export function useParceirosList() {
  return useApiList('/parceiros/index.php');
}

export function useUnidadesList() {
  return useApiList('/unidades/index.php');
}

export function useUsuariosList() {
  return useApiList('/usuarios/index.php');
}

// Cache reativo compartilhado (useSyncExternalStore) para módulos ainda mockados que só
// precisam ler a lista de clientes/parceiros (seletor de cliente, junções por id etc.) —
// evita cada um desses lugares refazer o fetch, e cada um lê ficando "atualizado sozinho".
function createListCache(path) {
  let rows = [];
  let promise = null;
  const listeners = new Set();
  const notify = () => listeners.forEach((l) => l());

  const ensureLoaded = () => {
    if (!promise) {
      promise = apiFetch(path)
        .then((data) => { rows = data || []; notify(); })
        .catch(() => { rows = []; notify(); });
    }
    return promise;
  };

  return {
    subscribe(listener) {
      ensureLoaded();
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => rows,
    reload() {
      promise = null;
      return ensureLoaded();
    },
  };
}

const clientesCache = createListCache('/clientes/index.php');
const parceirosCache = createListCache('/parceiros/index.php');

export function useClientesCache() {
  return useSyncExternalStore(clientesCache.subscribe, clientesCache.getSnapshot);
}

export function useParceirosCache() {
  return useSyncExternalStore(parceirosCache.subscribe, parceirosCache.getSnapshot);
}
