import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/index.js';
import { Card, DataTable, Badge, Button } from '../../components/index.js';
import { parceiros } from '../../mock/parceiros.js';
import { guiasDoParceiro } from '../../mock/guias.js';
import { cnpj } from '../../lib/format.js';

export default function ParceirosList() {
  const navigate = useNavigate();
  const rows = parceiros.map((p) => ({ ...p, guias: guiasDoParceiro(p.id).length }));

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Parceiros' }]}
        title="Parceiros comerciais"
        subtitle="Contatos, acordos comerciais e histórico completo de atendimentos realizados por cada parceiro."
        actions={<Button variant="primary" icon="plus" onClick={() => navigate('/parceiros')}>Novo parceiro</Button>}
      />
      <Card>
        <DataTable
          rows={rows}
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
            { key: 'status', header: 'Status', sortable: true, render: (r) => <Badge variant={r.status === 'Ativo' ? 'success' : 'neutral'}>{r.status}</Badge> },
          ]}
        />
      </Card>
    </>
  );
}
