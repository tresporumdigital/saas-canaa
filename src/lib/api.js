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

// Busca um único objeto (não lista) uma vez ao montar; devolve { data, loading, error, reload }.
// Mesmo padrão de useApiList, mas para endpoints singleton (empresa, backup_config) que
// respondem com um objeto (ou null) em vez de um array.
function useApiObject(path) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    apiFetch(path)
      .then((data) => { if (!cancelado) setState({ data: data ?? null, loading: false, error: null }); })
      .catch((e) => { if (!cancelado) setState({ data: null, loading: false, error: e.message }); });
    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

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

export function usePagamentosList() {
  return useApiList('/pagamentos/index.php');
}

export function useFluxoCaixa() {
  return useApiList('/financeiro/fluxo_caixa.php');
}

export function useAging() {
  return useApiList('/financeiro/aging.php');
}

export function useFechamentoCaixa(data) {
  return useApiList(`/financeiro/fechamento_caixa.php${data ? `?data=${encodeURIComponent(data)}` : ''}`, [data]);
}

export function useEmpresa() {
  const { data, loading, error, reload } = useApiObject('/config/empresa.php');
  return { empresa: data, loading, error, reload };
}

export function useBackupConfig() {
  const { data, loading, error, reload } = useApiObject('/config/backup_config.php');
  return { backupConfig: data, loading, error, reload };
}

export function useBackupExecucoes() {
  return useApiList('/config/backup_execucoes.php');
}

// Cache reativo compartilhado (useSyncExternalStore) para módulos que só precisam ler uma
// lista (seletor de cliente, junções por id etc.) sem cada lugar refazer o fetch — e a página
// "dona" de cada entidade usa o mesmo cache (via useXCacheState) para já nascer sincronizada
// com quem só lê, em vez de manter dois fetches paralelos e desatualizados entre si.
function createListCache(path) {
  let state = { rows: [], loading: true, error: null };
  let promise = null;
  const listeners = new Set();
  const notify = () => listeners.forEach((l) => l());

  const load = () => {
    state = { ...state, loading: true, error: null };
    notify();
    return apiFetch(path)
      .then((data) => { state = { rows: data || [], loading: false, error: null }; notify(); })
      .catch((e) => { state = { rows: [], loading: false, error: e.message }; notify(); });
  };

  const ensureLoaded = () => {
    if (!promise) promise = load();
    return promise;
  };

  return {
    subscribe(listener) {
      ensureLoaded();
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getRows: () => state.rows,
    getState: () => state,
    reload() {
      promise = load();
      return promise;
    },
  };
}

function useCacheRows(cache) {
  return useSyncExternalStore(cache.subscribe, cache.getRows);
}

function useCacheState(cache) {
  const state = useSyncExternalStore(cache.subscribe, cache.getState);
  return { ...state, reload: cache.reload };
}

const clientesCache = createListCache('/clientes/index.php');
const parceirosCache = createListCache('/parceiros/index.php');
const planosCache = createListCache('/planos/index.php');
const contratosCache = createListCache('/contratos/index.php');
const obitosCache = createListCache('/obitos/index.php');
const guiasCache = createListCache('/guias/index.php');
const equipamentosCache = createListCache('/equipamentos/produtos.php');
const unidadesCache = createListCache('/equipamentos/unidades.php');
const emprestimosCache = createListCache('/emprestimos/index.php');
const vendasEquipamentoCache = createListCache('/equipamentos/vendas.php');
const notasFiscaisCache = createListCache('/notas-fiscais/index.php');
const baixasParceiroCache = createListCache('/portal/baixas.php');
const carnesCache = createListCache('/carnes/index.php');
const contasReceberCache = createListCache('/financeiro/contas_receber.php');
const contasPagarCache = createListCache('/financeiro/contas_pagar.php');
const perfisPermissoesCache = createListCache('/config/perfis_permissoes.php');

export function useClientesCache() {
  return useCacheRows(clientesCache);
}

export function useParceirosCache() {
  return useCacheRows(parceirosCache);
}

export function usePlanosCache() {
  return useCacheRows(planosCache);
}

export function useContratosCache() {
  return useCacheRows(contratosCache);
}

// Para as páginas "donas" (Configurações → Planos, Planos → Contratos): loading/error/reload
// sobre o mesmo cache compartilhado, para que criar/editar já atualize quem só lê em outro lugar.
export function usePlanosCacheState() {
  return useCacheState(planosCache);
}

export function useContratosCacheState() {
  return useCacheState(contratosCache);
}

export function useObitosCache() {
  return useCacheRows(obitosCache);
}

export function useGuiasCache() {
  return useCacheRows(guiasCache);
}

export function useObitosCacheState() {
  return useCacheState(obitosCache);
}

export function useGuiasCacheState() {
  return useCacheState(guiasCache);
}

// Para código fora de componentes/hooks (ex.: depois de um POST em outra tela) que precisa
// invalidar um cache compartilhado para quem só lê em outro lugar (ClientesList, ClienteDetail...).
export function reloadContratosCache() {
  return contratosCache.reload();
}

export function reloadGuiasCache() {
  return guiasCache.reload();
}

export function useEquipamentosCache() {
  return useCacheRows(equipamentosCache);
}

export function useUnidadesCache() {
  return useCacheRows(unidadesCache);
}

export function useEmprestimosCache() {
  return useCacheRows(emprestimosCache);
}

export function useVendasEquipamentoCache() {
  return useCacheRows(vendasEquipamentoCache);
}

export function useEquipamentosCacheState() {
  return useCacheState(equipamentosCache);
}

export function useUnidadesCacheState() {
  return useCacheState(unidadesCache);
}

export function useEmprestimosCacheState() {
  return useCacheState(emprestimosCache);
}

export function useVendasEquipamentoCacheState() {
  return useCacheState(vendasEquipamentoCache);
}

export function reloadUnidadesCache() {
  return unidadesCache.reload();
}

export function reloadEmprestimosCache() {
  return emprestimosCache.reload();
}

export function reloadVendasEquipamentoCache() {
  return vendasEquipamentoCache.reload();
}

export function useNotasFiscaisCache() {
  return useCacheRows(notasFiscaisCache);
}

export function useNotasFiscaisCacheState() {
  return useCacheState(notasFiscaisCache);
}

export function reloadNotasFiscaisCache() {
  return notasFiscaisCache.reload();
}

export function useBaixasParceiroCache() {
  return useCacheRows(baixasParceiroCache);
}

export function useBaixasParceiroCacheState() {
  return useCacheState(baixasParceiroCache);
}

export function useCarnesCache() {
  return useCacheRows(carnesCache);
}

export function useCarnesCacheState() {
  return useCacheState(carnesCache);
}

export function useContasReceberCache() {
  return useCacheRows(contasReceberCache);
}

export function useContasReceberCacheState() {
  return useCacheState(contasReceberCache);
}

export function useContasPagarCache() {
  return useCacheRows(contasPagarCache);
}

export function useContasPagarCacheState() {
  return useCacheState(contasPagarCache);
}

export function usePerfisPermissoesCache() {
  return useCacheRows(perfisPermissoesCache);
}

export function usePerfisPermissoesCacheState() {
  return useCacheState(perfisPermissoesCache);
}
