import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/index.js';
import { Card, DataTable, StatusMenu, Select, StatCard, Button } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import useRowStatus from '../../hooks/useRowStatus.js';
import { guias } from '../../mock/guias.js';
import { parceiros, parceiroById } from '../../mock/parceiros.js';
import { CICLO_GUIA } from '../../mock/guias.js';
import { date, money } from '../../lib/format.js';
import { STATUS_SETS } from '../../lib/status.js';
import GerarGuiaModal from './GerarGuiaModal.jsx';

export default function GuiasList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [parceiro, setParceiro] = useState('');
  const [status, setStatus] = useState('');
  const [gerando, setGerando] = useState(false);
  const [novasGuias, setNovasGuias] = useState([]);
  const fonte = useMemo(() => [...novasGuias, ...guias], [novasGuias]);
  const [allGuias, setGuiaStatus] = useRowStatus(fonte);

  const filtered = useMemo(() => allGuias.filter((g) =>
    (!parceiro || g.parceiroId === parceiro) && (!status || g.status === status)
  ), [allGuias, parceiro, status]);

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
          searchPlaceholder="Buscar por nº da guia, cliente ou serviço…"
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
              <Button variant="primary" icon="plus" onClick={() => setGerando(true)}>Gerar guia</Button>
            </>
          }
          columns={[
            { key: 'id', header: 'Guia', sortable: true },
            { key: 'clienteNome', header: 'Cliente', sortable: true },
            { key: 'parceiroId', header: 'Parceiro', render: (r) => parceiroById(r.parceiroId)?.nomeFantasia },
            { key: 'servico', header: 'Serviço' },
            { key: 'emitidaEm', header: 'Emitida', sortable: true, render: (r) => date(r.emitidaEm) },
            { key: 'valorAcordado', header: 'Valor', align: 'right', sortable: true, render: (r) => money(r.valorAcordado) },
            { key: 'status', header: 'Status', sortable: true, render: (r) => (
              <StatusMenu
                value={r.status}
                options={STATUS_SETS.guia}
                onChange={(next) => { setGuiaStatus(r.id, next); toast(`Guia ${r.id} definida como "${next}".`); }}
              />
            ) },
          ]}
        />
      </Card>

      {gerando && (
        <GerarGuiaModal
          onClose={() => setGerando(false)}
          onGenerate={(guia) => {
            setNovasGuias((list) => [guia, ...list]);
            toast(`Guia ${guia.id} gerada para ${guia.clienteNome} (simulação — sem persistência).`);
          }}
        />
      )}
    </>
  );
}
