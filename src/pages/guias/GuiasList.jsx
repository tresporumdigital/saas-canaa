import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/index.js';
import { Card, DataTable, StatusMenu, Select, StatCard, Button, EmptyState } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { apiFetch, useGuiasCacheState, useParceirosCache } from '../../lib/api.js';
import { date, money } from '../../lib/format.js';
import { CICLO_GUIA, STATUS_SETS } from '../../lib/status.js';
import GerarGuiaModal from './GerarGuiaModal.jsx';

export default function GuiasList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const parceiros = useParceirosCache();
  const parceiroById = (id) => parceiros.find((p) => p.id === id);
  const [parceiro, setParceiro] = useState('');
  const [status, setStatus] = useState('');
  const [gerando, setGerando] = useState(false);
  const { rows: allGuias, loading, error, reload } = useGuiasCacheState();

  const filtered = useMemo(() => allGuias.filter((g) =>
    (!parceiro || g.parceiroId === parceiro) && (!status || g.status === status)
  ), [allGuias, parceiro, status]);

  const totalPagar = filtered
    .filter((g) => g.status !== 'Cancelada')
    .reduce((s, g) => s + g.valorAcordado, 0);

  const alterarStatus = async (g, next) => {
    if (next === 'Cancelada') {
      navigate(`/guias/${g.id}`);
      return;
    }
    try {
      await apiFetch(`/guias/status.php?id=${encodeURIComponent(g.id)}`, { method: 'PATCH', body: { status: next } });
      toast(`Guia ${g.id} definida como "${next}".`);
      reload();
    } catch (e) {
      toast(e.message, { kind: 'danger' });
    }
  };

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
        {error ? (
          <EmptyState icon="alert" title="Não foi possível carregar as guias">{error}</EmptyState>
        ) : (
          <DataTable
            rows={filtered}
            emptyLabel={loading ? 'Carregando…' : undefined}
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
                  onChange={(next) => alterarStatus(r, next)}
                />
              ) },
            ]}
          />
        )}
      </Card>

      {gerando && (
        <GerarGuiaModal
          onClose={() => setGerando(false)}
          onGenerate={(guia) => {
            reload();
            toast(`Guia ${guia.id} gerada para ${guia.clienteNome}.`);
          }}
        />
      )}
    </>
  );
}
