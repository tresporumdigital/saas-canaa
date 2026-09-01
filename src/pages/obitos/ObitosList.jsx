import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/index.js';
import { Card, DataTable, Badge, StatusMenu, Button } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import useRowStatus from '../../hooks/useRowStatus.js';
import { obitos } from '../../mock/index.js';
import { date, dateTime, money } from '../../lib/format.js';
import { STATUS_SETS } from '../../lib/status.js';
import ObitoFormModal from './ObitoFormModal.jsx';

export default function ObitosList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rows, setStatus] = useRowStatus(obitos);
  const [showNew, setShowNew] = useState(false);

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
    { key: 'responsavel', header: 'Responsável', sortable: true },
    { key: 'abertoEm', header: 'Aberto em', sortable: true, render: (r) => date(r.abertoEm) },
    { key: 'valorTotal', header: 'Valor cobrado', align: 'right', sortable: true, render: (r) => money(r.valorTotal) },
    { key: 'status', header: 'Status', sortable: true, render: (r) => (
      <StatusMenu
        value={r.status}
        options={STATUS_SETS.obito}
        onChange={(next) => { setStatus(r.id, next); toast(`Atendimento ${r.id} definido como "${next}".`); }}
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
        <DataTable
          columns={columns}
          rows={rows}
          searchKeys={['id', 'responsavel']}
          searchPlaceholder="Buscar por nº do atendimento ou responsável…"
          onRowClick={(r) => navigate(`/obitos/${r.id}`)}
          pageSize={10}
        />
      </Card>

      {showNew && <ObitoFormModal onClose={() => setShowNew(false)} />}
    </>
  );
}
