import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/index.js';
import { Card, DataTable, Badge, StatusMenu, Button, EmptyState } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { apiFetch, useObitosCacheState } from '../../lib/api.js';
import { date, dateTime, money } from '../../lib/format.js';
import { STATUS_SETS } from '../../lib/status.js';
import ObitoFormModal from './ObitoFormModal.jsx';

export default function ObitosList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { rows, loading, error, reload } = useObitosCacheState();
  const [showNew, setShowNew] = useState(false);

  const alterarStatus = async (r, next) => {
    try {
      await apiFetch(`/obitos/status.php?id=${encodeURIComponent(r.id)}`, { method: 'PATCH', body: { status: next } });
      toast(`Atendimento ${r.id} definido como "${next}".`);
      reload();
    } catch (e) {
      toast(e.message, { kind: 'danger' });
    }
  };

  const columns = [
    { key: 'id', header: 'Atendimento', sortable: true },
    { key: 'falecido', header: 'Falecido', sortable: true, sortValue: (r) => r.falecido.nome, render: (r) => (
      <div>
        <div style={{ fontWeight: 700 }}>{r.falecido.nome}</div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>Óbito em {dateTime(r.falecido.obitoEm)}</div>
      </div>
    ) },
    { key: 'vinculo', header: 'Vínculo', render: (r) => (
      <Badge variant={r.vinculo.tipo === 'Particular' ? 'warning' : 'info'}>{r.vinculo.tipo}</Badge>
    ) },
    { key: 'responsavel', header: 'Responsável', sortable: true, render: (r) => r.responsavel || '—' },
    { key: 'abertoEm', header: 'Aberto em', sortable: true, render: (r) => date(r.abertoEm) },
    { key: 'valorTotal', header: 'Valor cobrado', align: 'right', sortable: true, render: (r) => money(r.valorTotal) },
    { key: 'status', header: 'Status', sortable: true, render: (r) => (
      <StatusMenu
        value={r.status}
        options={STATUS_SETS.obito}
        onChange={(next) => alterarStatus(r, next)}
      />
    ) },
  ];

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Registro de Óbito' }]}
        title="Registro de Óbito"
        subtitle="Atendimentos funerários vinculados ao cadastro do cliente e ao plano contratado."
        actions={<Button variant="primary" icon="plus" onClick={() => setShowNew(true)}>Registrar óbito</Button>}
      />
      <Card>
        {error ? (
          <EmptyState icon="alert" title="Não foi possível carregar os atendimentos">{error}</EmptyState>
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            emptyLabel={loading ? 'Carregando…' : undefined}
            searchKeys={['id', 'responsavel']}
            searchPlaceholder="Buscar por nº do atendimento ou responsável…"
            onRowClick={(r) => navigate(`/obitos/${r.id}`)}
            pageSize={10}
          />
        )}
      </Card>

      {showNew && <ObitoFormModal onClose={() => setShowNew(false)} onCreated={reload} />}
    </>
  );
}
