import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/index.js';
import { Card, DataTable, StatusMenu, Button, EmptyState } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import useRowStatus from '../../hooks/useRowStatus.js';
import { apiFetch, useGuiasCache, useParceirosCacheState } from '../../lib/api.js';
import { cnpj } from '../../lib/format.js';
import { STATUS_SETS } from '../../lib/status.js';
import ParceiroFormModal from './ParceiroFormModal.jsx';

export default function ParceirosList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { rows: parceiros, loading, error, reload } = useParceirosCacheState();
  const guiasTodas = useGuiasCache();
  const base = useMemo(() => parceiros.map((p) => ({
    ...p, guias: guiasTodas.filter((g) => g.parceiroId === p.id).length,
  })), [parceiros, guiasTodas]);
  const [rows, setStatusLocal] = useRowStatus(base);
  const [showNew, setShowNew] = useState(false);

  const alterarStatus = async (r, next) => {
    setStatusLocal(r.id, next);
    try {
      await apiFetch(`/parceiros/status.php?id=${encodeURIComponent(r.id)}`, { method: 'PATCH', body: { status: next } });
      toast(`Parceiro ${r.nomeFantasia} definido como "${next}".`);
      reload();
    } catch (e) {
      setStatusLocal(r.id, r.status);
      toast(e.message, { kind: 'danger' });
    }
  };

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Parceiros' }]}
        title="Parceiros comerciais"
        subtitle="Contatos, acordos comerciais e histórico completo de atendimentos realizados por cada parceiro."
        actions={<Button variant="primary" icon="plus" onClick={() => setShowNew(true)}>Novo parceiro</Button>}
      />
      <Card>
        {error ? (
          <EmptyState icon="alert" title="Não foi possível carregar os parceiros">{error}</EmptyState>
        ) : (
          <DataTable
            rows={rows}
            emptyLabel={loading ? 'Carregando…' : undefined}
            searchKeys={['razaoSocial', 'nomeFantasia', 'cnpj', 'tipoParceria']}
            searchPlaceholder="Buscar por nome, CNPJ ou tipo…"
            onRowClick={(r) => navigate(`/parceiros/${r.id}`)}
            pageSize={10}
            columns={[
              { key: 'nomeFantasia', header: 'Parceiro', sortable: true, render: (r) => (
                <div>
                  <div style={{ fontWeight: 700 }}>{r.nomeFantasia}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{r.razaoSocial} · {cnpj(r.cnpj)}</div>
                </div>
              ) },
              { key: 'tipoParceria', header: 'Tipo', sortable: true },
              { key: 'acordo', header: 'Remuneração', render: (r) => r.acordo.tipo },
              { key: 'guias', header: 'Guias', align: 'right', sortable: true },
              { key: 'status', header: 'Status', sortable: true, render: (r) => (
                <StatusMenu
                  value={r.status}
                  options={STATUS_SETS.parceiro}
                  onChange={(next) => alterarStatus(r, next)}
                />
              ) },
            ]}
          />
        )}
      </Card>

      {showNew && <ParceiroFormModal onClose={() => setShowNew(false)} onSaved={() => { setShowNew(false); reload(); }} />}
    </>
  );
}
