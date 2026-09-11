import { useMemo, useState } from 'react';
import { PageHeader } from '../../components/index.js';
import { Card, DataTable, Tag, Button } from '../../components/index.js';
import { planosProduto } from '../../mock/planos.js';
import { money } from '../../lib/format.js';
import PlanoFormModal from './PlanoFormModal.jsx';

export default function PlanosConfig() {
  const [novo, setNovo] = useState(false);
  const [editando, setEditando] = useState(null);
  const [novos, setNovos] = useState([]);
  const [alterados, setAlterados] = useState({});

  const rows = useMemo(() => (
    [...novos, ...planosProduto].map((p) => alterados[p.id] ? { ...p, ...alterados[p.id] } : p)
  ), [novos, alterados]);

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Planos' }]}
        title="Planos"
        subtitle="Catálogo de planos oferecidos nas unidades — mensalidade, carência, dependentes e coberturas."
        actions={<Button variant="primary" icon="plus" onClick={() => setNovo(true)}>Novo plano</Button>}
      />

      <Card>
        <DataTable
          rows={rows}
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
      </Card>

      {novo && (
        <PlanoFormModal onClose={() => setNovo(false)} onCreate={(p) => setNovos((l) => [p, ...l])} />
      )}
      {editando && (
        <PlanoFormModal
          plano={editando}
          onClose={() => setEditando(null)}
          onUpdate={(p) => setAlterados((a) => ({ ...a, [p.id]: p }))}
        />
      )}
    </>
  );
}
