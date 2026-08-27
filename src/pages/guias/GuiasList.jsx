import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader.jsx';
import { Card, DataTable, Badge, Select, StatCard } from '../../components/ui/index.js';
import { guias } from '../../mock/guias.js';
import { parceiros, parceiroById } from '../../mock/parceiros.js';
import { CICLO_GUIA } from '../../mock/guias.js';
import { date, money } from '../../lib/format.js';
import { statusVariant } from '../../lib/status.js';

export default function GuiasList() {
  const navigate = useNavigate();
  const [parceiro, setParceiro] = useState('');
  const [status, setStatus] = useState('');

  const filtered = useMemo(() => guias.filter((g) =>
    (!parceiro || g.parceiroId === parceiro) && (!status || g.status === status)
  ), [parceiro, status]);

  const totalPagar = filtered
    .filter((g) => g.status !== 'Cancelada')
    .reduce((s, g) => s + g.valorAcordado, 0);

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Guias de Atendimento' }]}
        title="Guias de Atendimento"
        subtitle="Guia gerada automaticamente para cada parceiro acionado, com rastreamento de status do ciclo Emitida → Faturada."
      />

      <div className="grid cols-3">
        <StatCard label="Guias no filtro" value={filtered.length} icon="send" />
        <StatCard label="Valor a pagar aos parceiros" value={money(totalPagar)} icon="wallet" tone="info" />
        <StatCard label="Concluídas / faturadas" value={filtered.filter((g) => g.status === 'Concluída' || g.status === 'Faturada').length} icon="check-circle" tone="success" />
      </div>

      <Card>
        <DataTable
          rows={filtered}
          searchKeys={['id', 'clienteNome', 'servico']}
          searchPlaceholder="Buscar por nº da guia, falecido ou serviço…"
          onRowClick={(r) => navigate(`/guias/${r.id}`)}
          pageSize={12}
          toolbarExtra={
            <>
              <Select value={parceiro} onChange={(e) => setParceiro(e.target.value)} aria-label="Filtrar por parceiro">
                <option value="">Todos os parceiros</option>
                {parceiros.map((p) => <option key={p.id} value={p.id}>{p.nomeFantasia}</option>)}
              </Select>
              <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filtrar por status">
                <option value="">Todos os status</option>
                {[...CICLO_GUIA, 'Cancelada'].map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </>
          }
          columns={[
            { key: 'id', header: 'Guia', sortable: true },
            { key: 'clienteNome', header: 'Falecido / cliente', sortable: true },
            { key: 'parceiroId', header: 'Parceiro', render: (r) => parceiroById(r.parceiroId)?.nomeFantasia },
            { key: 'servico', header: 'Serviço' },
            { key: 'emitidaEm', header: 'Emitida', sortable: true, render: (r) => date(r.emitidaEm) },
            { key: 'valorAcordado', header: 'Valor', align: 'right', sortable: true, render: (r) => money(r.valorAcordado) },
            { key: 'status', header: 'Status', sortable: true, render: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge> },
          ]}
        />
      </Card>
    </>
  );
}
