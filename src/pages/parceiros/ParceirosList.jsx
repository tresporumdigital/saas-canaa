import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/index.js';
import { Card, DataTable, StatusMenu, Button } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import useRowStatus from '../../hooks/useRowStatus.js';
import { parceiros } from '../../mock/parceiros.js';
import { guiasDoParceiro } from '../../mock/guias.js';
import { cnpj } from '../../lib/format.js';
import { STATUS_SETS } from '../../lib/status.js';

export default function ParceirosList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const base = useMemo(() => parceiros.map((p) => ({ ...p, guias: guiasDoParceiro(p.id).length })), []);
  const [rows, setStatus] = useRowStatus(base);

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
            { key: 'status', header: 'Status', sortable: true, render: (r) => (
              <StatusMenu
                value={r.status}
                options={STATUS_SETS.parceiro}
                onChange={(next) => { setStatus(r.id, next); toast(`Parceiro ${r.nomeFantasia} definido como "${next}".`); }}
              />
            ) },
          ]}
        />
      </Card>
    </>
  );
}
