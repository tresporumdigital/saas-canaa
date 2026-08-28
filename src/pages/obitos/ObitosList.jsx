import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/index.js';
import { Card, DataTable, Badge, Button } from '../../components/index.js';
import { obitos } from '../../mock/index.js';
import { date, dateTime, money } from '../../lib/format.js';
import { statusVariant } from '../../lib/status.js';

export default function ObitosList() {
  const navigate = useNavigate();
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
    { key: 'status', header: 'Status', sortable: true, render: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge> },
  ];

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Registro de Óbito' }]}
        title="Registro de Óbito"
        subtitle="Atendimentos funerários vinculados ao cadastro do cliente e ao plano contratado."
        actions={<Button variant="primary" icon="plus" to="/obitos/novo">Registrar óbito</Button>}
      />
      <Card>
        <DataTable
          columns={columns}
          rows={obitos}
          searchKeys={['id', 'responsavel']}
          searchPlaceholder="Buscar por nº do atendimento ou responsável…"
          onRowClick={(r) => navigate(`/obitos/${r.id}`)}
          pageSize={10}
        />
      </Card>
    </>
  );
}
