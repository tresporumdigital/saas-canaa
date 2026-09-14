import { useState } from 'react';
import { PageHeader } from '../../components/index.js';
import { Card, DataTable, Tag, Button, EmptyState } from '../../components/index.js';
import { usePlanosCacheState } from '../../lib/api.js';
import { money } from '../../lib/format.js';
import PlanoFormModal from './PlanoFormModal.jsx';

export default function PlanosConfig() {
  const [novo, setNovo] = useState(false);
  const [editando, setEditando] = useState(null);
  const { rows, loading, error, reload } = usePlanosCacheState();

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Planos' }]}
        title="Planos"
        subtitle="Catálogo de planos oferecidos nas unidades — mensalidade, carência, dependentes e coberturas."
        actions={<Button variant="primary" icon="plus" onClick={() => setNovo(true)}>Novo plano</Button>}
      />

      <Card>
        {error ? (
          <EmptyState icon="alert" title="Não foi possível carregar os planos">{error}</EmptyState>
        ) : (
          <DataTable
            rows={rows}
            emptyLabel={loading ? 'Carregando…' : 'Nenhum plano cadastrado ainda.'}
            searchKeys={['nome']}
            searchPlaceholder="Buscar por nome do plano…"
            onRowClick={(r) => setEditando(r)}
            pageSize={12}
            columns={[
              { key: 'nome', header: 'Plano', sortable: true },
              { key: 'valorMensal', header: 'Mensalidade', align: 'right', sortable: true, render: (r) => money(r.valorMensal) },
              { key: 'carenciaDias', header: 'Carência', align: 'right', render: (r) => `${r.carenciaDias} dias` },
              { key: 'limiteDependentes', header: 'Dependentes', align: 'right' },
              { key: 'reajuste', header: 'Reajuste' },
              { key: 'coberturas', header: 'Coberturas', render: (r) => (
                <div className="row" style={{ gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  {(r.coberturas || []).slice(0, 3).map((c) => <Tag key={c}>{c}</Tag>)}
                  {(r.coberturas || []).length > 3 && <Tag>+{r.coberturas.length - 3}</Tag>}
                </div>
              ) },
            ]}
          />
        )}
      </Card>

      {novo && <PlanoFormModal onClose={() => setNovo(false)} onSaved={() => { setNovo(false); reload(); }} />}
      {editando && (
        <PlanoFormModal plano={editando} onClose={() => setEditando(null)} onSaved={() => { setEditando(null); reload(); }} />
      )}
    </>
  );
}
