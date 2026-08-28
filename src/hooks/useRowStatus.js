import { useCallback, useMemo, useState } from 'react';

/**
 * Guarda trocas de status feitas na tabela (protótipo: só em memória, sem persistência).
 * Recebe as linhas de origem e devolve as linhas já com os overrides aplicados + um setter.
 *
 *   const [rows, setStatus] = useRowStatus(origem, { key: 'situacao' });
 *   ...
 *   onChange={(next) => setStatus(row.id, next)}
 */
export default function useRowStatus(sourceRows, { key = 'status', getId = (r) => r.id } = {}) {
  const [overrides, setOverrides] = useState({});

  const rows = useMemo(() => {
    if (!Object.keys(overrides).length) return sourceRows;
    return sourceRows.map((r) => {
      const next = overrides[getId(r)];
      return next == null ? r : { ...r, [key]: next };
    });
  }, [sourceRows, overrides, key, getId]);

  const setStatus = useCallback((id, value) => {
    setOverrides((o) => ({ ...o, [id]: value }));
  }, []);

  return [rows, setStatus];
}
