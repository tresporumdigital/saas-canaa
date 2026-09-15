import { useState } from 'react';
import { PageHeader } from '../../components/index.js';
import {
  Card, Tabs, DataTable, StatusMenu, Button, StatCard, AgingBars, Bar,
} from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  apiFetch, useAging, useContasPagarCacheState, useContasReceberCacheState, useFechamentoCaixa, useFluxoCaixa,
} from '../../lib/api.js';
import { money, date } from '../../lib/format.js';
import NovaContaModal from './NovaContaModal.jsx';

const OPCOES_STATUS_CONTA = ['Em aberto', 'Pago', 'Negociado'];

const TABS = [
  { id: 'visao', label: 'Visão geral' },
  { id: 'receber', label: 'Contas a receber' },
  { id: 'pagar', label: 'Contas a pagar' },
  { id: 'fluxo', label: 'Fluxo de caixa' },
  { id: 'inadimplencia', label: 'Inadimplência' },
  { id: 'fechamento', label: 'Fechamento de caixa' },
];

export default function FinanceiroHome() {
  const { toast } = useToast();
  const [tab, setTab] = useState('visao');
  const [novaConta, setNovaConta] = useState(null);
  const { rows: receberRows, reload: reloadReceber } = useContasReceberCacheState();
  const { rows: pagarRows, reload: reloadPagar } = useContasPagarCacheState();
  const { rows: fluxoCaixa, reload: reloadFluxoCaixa } = useFluxoCaixa();
  const { rows: agingInadimplencia, reload: reloadAging } = useAging();
  const { rows: fechamentoEntradas, reload: reloadFechamento } = useFechamentoCaixa();

  const totalReceber = receberRows.filter((c) => c.status !== 'Pago').reduce((s, c) => s + c.valor, 0);
  const totalPagar = pagarRows.filter((c) => c.status !== 'Pago').reduce((s, c) => s + c.valor, 0);
  const totalInadimplencia = agingInadimplencia.reduce((s, b) => s + b.value, 0);
  const maxFluxo = Math.max(1, ...fluxoCaixa.map((f) => Math.max(f.entradas, f.saidas)));

  // Qualquer mutação em contas a pagar/receber pode mudar os relatórios computados
  // (fluxo de caixa, aging, fechamento de caixa) — esses hooks não têm cache compartilhado
  // como useXCache, então precisam ser recarregados explicitamente aqui (mesma lição das
  // fases anteriores: invalidar todo hook que lê o dado mudado, não só o "dono" da mutação).
  const reloadRelatorios = () => {
    reloadFluxoCaixa();
    reloadAging();
    reloadFechamento();
  };

  const alterarStatusReceber = async (r, next) => {
    try {
      await apiFetch(`/financeiro/contas_receber_status.php?id=${encodeURIComponent(r.id)}`, { method: 'PATCH', body: { status: next } });
      toast(`Lançamento ${r.id} definido como "${next}".`);
      reloadReceber();
      reloadRelatorios();
    } catch (err) {
      toast(err.message, { kind: 'danger' });
    }
  };

  const alterarStatusPagar = async (r, next) => {
    try {
      await apiFetch(`/financeiro/contas_pagar_status.php?id=${encodeURIComponent(r.id)}`, { method: 'PATCH', body: { status: next } });
      toast(`Lançamento ${r.id} definido como "${next}".`);
      reloadPagar();
      reloadRelatorios();
    } catch (err) {
      toast(err.message, { kind: 'danger' });
    }
  };

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Controle Financeiro' }]}
        title="Controle Financeiro"
        subtitle="Entradas, saídas e inadimplência — com trilha de auditoria de todo lançamento."
        actions={<Button variant="secondary" icon="download" onClick={() => toast('Relatório exportado em PDF/CSV (simulação).')}>Exportar</Button>}
      />

      <div className="grid cols-3">
        <StatCard label="A receber (aberto)" value={money(totalReceber)} icon="cash" tone="success" />
        <StatCard label="A pagar (aberto)" value={money(totalPagar)} icon="wallet" tone="danger" />
        <StatCard label="Inadimplência" value={money(totalInadimplencia)} icon="alert" tone="warning" />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'visao' && (
        <div className="grid cols-2">
          <Card title="Fluxo de caixa — últimos meses (realizado)">
            <div className="stack gap-sm">
              {fluxoCaixa.map((f) => (
                <div key={f.mes}>
                  <div className="row between" style={{ fontSize: 'var(--text-xs)', marginBottom: 4 }}>
                    <span>{f.mes}</span>
                    <span className="num">{money(f.entradas - f.saidas)}</span>
                  </div>
                  <Bar value={(f.entradas / maxFluxo) * 100} />
                </div>
              ))}
            </div>
          </Card>
          <Card title="Inadimplência por aging">
            <AgingBars buckets={agingInadimplencia} />
          </Card>
        </div>
      )}

      {tab === 'receber' && (
        <Card>
          <DataTable
            rows={receberRows}
            searchKeys={['clienteNome', 'categoria', 'ref']}
            toolbarExtra={<Button variant="primary" icon="plus" onClick={() => setNovaConta('receber')}>Nova conta</Button>}
            columns={[
              { key: 'id', header: 'Lançamento', sortable: true },
              { key: 'clienteNome', header: 'Cliente / origem', sortable: true },
              { key: 'categoria', header: 'Categoria' },
              { key: 'centroCusto', header: 'Centro de custo' },
              { key: 'vencimento', header: 'Vencimento', sortable: true, render: (r) => date(r.vencimento) },
              { key: 'valor', header: 'Valor', align: 'right', sortable: true, render: (r) => money(r.valor) },
              { key: 'status', header: 'Status', render: (r) => (
                <StatusMenu
                  value={r.status}
                  options={OPCOES_STATUS_CONTA}
                  onChange={(next) => alterarStatusReceber(r, next)}
                />
              ) },
            ]}
          />
        </Card>
      )}

      {tab === 'pagar' && (
        <Card>
          <DataTable
            rows={pagarRows}
            searchKeys={['favorecido', 'categoria']}
            toolbarExtra={<Button variant="primary" icon="plus" onClick={() => setNovaConta('pagar')}>Nova conta</Button>}
            columns={[
              { key: 'id', header: 'Lançamento', sortable: true },
              { key: 'favorecido', header: 'Favorecido', sortable: true },
              { key: 'origem', header: 'Origem' },
              { key: 'centroCusto', header: 'Centro de custo' },
              { key: 'vencimento', header: 'Vencimento', sortable: true, render: (r) => date(r.vencimento) },
              { key: 'valor', header: 'Valor', align: 'right', sortable: true, render: (r) => money(r.valor) },
              { key: 'status', header: 'Status', render: (r) => (
                <StatusMenu
                  value={r.status}
                  options={OPCOES_STATUS_CONTA}
                  onChange={(next) => alterarStatusPagar(r, next)}
                />
              ) },
            ]}
          />
        </Card>
      )}

      {tab === 'fluxo' && (
        <Card title="Fluxo de caixa mensal">
          <DataTable
            searchable={false}
            pageSize={12}
            rows={fluxoCaixa}
            getKey={(r) => r.mes}
            columns={[
              { key: 'mes', header: 'Competência' },
              { key: 'entradas', header: 'Entradas', align: 'right', render: (r) => money(r.entradas) },
              { key: 'saidas', header: 'Saídas', align: 'right', render: (r) => money(r.saidas) },
              { key: 'saldo', header: 'Saldo', align: 'right', render: (r) => money(r.entradas - r.saidas) },
            ]}
          />
        </Card>
      )}

      {tab === 'inadimplencia' && (
        <Card title="Inadimplência consolidada — aging">
          <div className="stack">
            {agingInadimplencia.map((b) => (
              <div key={b.label} className="row between" style={{ fontSize: 'var(--text-sm)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>
                <span>{b.label}</span>
                <span className="num">{money(b.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'fechamento' && (
        <Card title={`Fechamento de caixa — ${date(new Date().toISOString().slice(0, 10))}`}>
          <DataTable
            searchable={false}
            rows={fechamentoEntradas}
            getKey={(r) => r.forma}
            columns={[
              { key: 'forma', header: 'Forma de pagamento' },
              { key: 'qtd', header: 'Qtd', align: 'right' },
              { key: 'valor', header: 'Valor', align: 'right', render: (r) => money(r.valor) },
            ]}
          />
          <div className="row between" style={{ marginTop: 'var(--space-4)', fontWeight: 800 }}>
            <span>Total de entradas do dia</span>
            <span className="num">{money(fechamentoEntradas.reduce((s, e) => s + e.valor, 0))}</span>
          </div>
        </Card>
      )}

      {novaConta && (
        <NovaContaModal
          tipo={novaConta}
          onClose={() => setNovaConta(null)}
          onCreate={async (conta) => {
            try {
              if (novaConta === 'receber') {
                const { id } = await apiFetch('/financeiro/contas_receber.php', {
                  method: 'POST',
                  body: {
                    clienteNome: conta.clienteNome, categoria: conta.categoria, centroCusto: conta.centroCusto,
                    vencimento: conta.vencimento, valor: conta.valor, status: conta.status,
                  },
                });
                toast(`Conta ${id} lançada.`);
                reloadReceber();
                reloadRelatorios();
              } else {
                const { id, total } = await apiFetch('/financeiro/contas_pagar.php', {
                  method: 'POST',
                  body: {
                    favorecido: conta.favorecido, categoria: conta.categoria, centroCusto: conta.centroCusto,
                    vencimento: conta.vencimento, valor: conta.valor, status: conta.status,
                    recorrente: conta.recorrente, recorrencias: conta.recorrencias,
                  },
                });
                toast(total > 1 ? `${total} contas recorrentes lançadas a partir de ${id}.` : `Conta ${id} lançada.`);
                reloadPagar();
                reloadRelatorios();
              }
              setNovaConta(null);
            } catch (err) {
              toast(err.message, { kind: 'danger' });
            }
          }}
        />
      )}
    </>
  );
}
