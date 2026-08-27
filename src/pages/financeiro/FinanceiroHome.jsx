import { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader.jsx';
import {
  Card, Tabs, DataTable, Badge, Button, StatCard, AgingBars, Bar,
} from '../../components/ui/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  contasReceber, contasPagar, fluxoCaixa, agingInadimplencia,
  fechamentoCaixa, dreMes, dreResultado,
} from '../../mock/financeiro.js';
import { money, date, number } from '../../lib/format.js';
import { statusVariant } from '../../lib/status.js';

const TABS = [
  { id: 'visao', label: 'Visão geral' },
  { id: 'receber', label: 'Contas a receber' },
  { id: 'pagar', label: 'Contas a pagar' },
  { id: 'fluxo', label: 'Fluxo de caixa' },
  { id: 'inadimplencia', label: 'Inadimplência' },
  { id: 'fechamento', label: 'Fechamento de caixa' },
  { id: 'dre', label: 'DRE gerencial' },
];

export default function FinanceiroHome() {
  const { toast } = useToast();
  const [tab, setTab] = useState('visao');

  const totalReceber = contasReceber.reduce((s, c) => s + c.valor, 0);
  const totalPagar = contasPagar.reduce((s, c) => s + c.valor, 0);
  const maxFluxo = Math.max(...fluxoCaixa.map((f) => Math.max(f.entradas, f.saidas)));

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Controle Financeiro' }]}
        title="Controle Financeiro"
        subtitle="Entradas, saídas, inadimplência e projeções — com trilha de auditoria de todo lançamento."
        actions={<Button variant="secondary" icon="download" onClick={() => toast('Relatório exportado em PDF/CSV (simulação).')}>Exportar</Button>}
      />

      <div className="grid cols-4">
        <StatCard label="A receber (aberto)" value={money(totalReceber)} icon="cash" tone="success" />
        <StatCard label="A pagar (aberto)" value={money(totalPagar)} icon="wallet" tone="danger" />
        <StatCard label="Inadimplência" value={money(agingInadimplencia.reduce((s, b) => s + b.value, 0))} icon="alert" tone="warning" />
        <StatCard label="Resultado do mês (DRE)" value={money(dreResultado())} icon="bars" tone={dreResultado() >= 0 ? 'success' : 'danger'} />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'visao' && (
        <div className="grid cols-2">
          <Card title="Fluxo de caixa — realizado x projetado">
            <div className="stack gap-sm">
              {fluxoCaixa.map((f) => (
                <div key={f.mes}>
                  <div className="row between" style={{ fontSize: 'var(--text-xs)', marginBottom: 4 }}>
                    <span>{f.mes} <Badge variant={f.tipo === 'Realizado' ? 'success' : f.tipo === 'Parcial' ? 'warning' : 'info'}>{f.tipo}</Badge></span>
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
            rows={contasReceber}
            searchKeys={['clienteNome', 'categoria', 'ref']}
            columns={[
              { key: 'id', header: 'Lançamento', sortable: true },
              { key: 'clienteNome', header: 'Cliente / origem', sortable: true },
              { key: 'categoria', header: 'Categoria' },
              { key: 'centroCusto', header: 'Centro de custo' },
              { key: 'vencimento', header: 'Vencimento', sortable: true, render: (r) => date(r.vencimento) },
              { key: 'valor', header: 'Valor', align: 'right', sortable: true, render: (r) => money(r.valor) },
              { key: 'status', header: 'Status', render: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge> },
            ]}
          />
        </Card>
      )}

      {tab === 'pagar' && (
        <Card>
          <DataTable
            rows={contasPagar}
            searchKeys={['favorecido', 'categoria']}
            columns={[
              { key: 'id', header: 'Lançamento', sortable: true },
              { key: 'favorecido', header: 'Favorecido', sortable: true },
              { key: 'origem', header: 'Origem' },
              { key: 'centroCusto', header: 'Centro de custo' },
              { key: 'vencimento', header: 'Vencimento', sortable: true, render: (r) => date(r.vencimento) },
              { key: 'valor', header: 'Valor', align: 'right', sortable: true, render: (r) => money(r.valor) },
              { key: 'status', header: 'Status', render: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge> },
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
              { key: 'tipo', header: 'Tipo', render: (r) => <Badge variant={r.tipo === 'Realizado' ? 'success' : r.tipo === 'Parcial' ? 'warning' : 'info'}>{r.tipo}</Badge> },
              { key: 'entradas', header: 'Entradas', align: 'right', render: (r) => money(r.entradas) },
              { key: 'saidas', header: 'Saídas', align: 'right', render: (r) => money(r.saidas) },
              { key: 'saldo', header: 'Saldo', align: 'right', render: (r) => money(r.entradas - r.saidas) },
            ]}
          />
        </Card>
      )}

      {tab === 'inadimplencia' && (
        <Card title="Inadimplência consolidada — aging e valor recuperável">
          <div className="stack">
            {agingInadimplencia.map((b) => (
              <div key={b.label} className="row between" style={{ fontSize: 'var(--text-sm)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>
                <span>{b.label}</span>
                <span className="num">{money(b.value)} <span style={{ color: 'var(--color-text-secondary)' }}>· recuperável ~{money(b.value * b.recuperavel)}</span></span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'fechamento' && (
        <Card title={`Fechamento de caixa — ${date(fechamentoCaixa.data)}`}>
          <DataTable
            searchable={false}
            rows={fechamentoCaixa.entradasPorForma}
            getKey={(r) => r.forma}
            columns={[
              { key: 'forma', header: 'Forma de pagamento' },
              { key: 'qtd', header: 'Qtd', align: 'right' },
              { key: 'valor', header: 'Valor', align: 'right', render: (r) => money(r.valor) },
            ]}
          />
          <div className="row between" style={{ marginTop: 'var(--space-4)', fontWeight: 800 }}>
            <span>Total de entradas − sangrias ({money(fechamentoCaixa.sangrias)})</span>
            <span className="num">{money(fechamentoCaixa.entradasPorForma.reduce((s, e) => s + e.valor, 0) - fechamentoCaixa.sangrias)}</span>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
            {fechamentoCaixa.conferido ? 'Conferido' : 'Não conferido'} por {fechamentoCaixa.responsavel}.
          </p>
        </Card>
      )}

      {tab === 'dre' && (
        <Card title={`DRE gerencial — ${dreMes.competencia}`}>
          <table className="data-table">
            <tbody>
              {dreMes.linhas.map((l, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--color-text-secondary)', width: 160 }}>{l.grupo}</td>
                  <td>{l.conta}</td>
                  <td className="num" style={{ color: l.valor < 0 ? 'var(--canaa-danger-600)' : 'inherit' }}>{money(l.valor)}</td>
                </tr>
              ))}
              <tr>
                <td />
                <td style={{ fontWeight: 800 }}>Resultado gerencial</td>
                <td className="num" style={{ fontWeight: 800 }}>{money(dreResultado())}</td>
              </tr>
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
