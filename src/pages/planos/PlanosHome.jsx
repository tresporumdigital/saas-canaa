import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/index.js';
import {
  Card, Tabs, DataTable, Badge, Button, Tag, AgingBars, StatCard,
} from '../../components/index.js';
import { planosProduto } from '../../mock/planos.js';
import { contratos } from '../../mock/contratos.js';
import { clienteById } from '../../mock/clientes.js';
import { planoById } from '../../mock/planos.js';
import { contratoValor } from '../../mock/contratos.js';
import { agingInadimplencia } from '../../mock/financeiro.js';
import { money, date, number } from '../../lib/format.js';
import { statusVariant } from '../../lib/status.js';

const TABS = [
  { id: 'contratos', label: 'Contratos' },
  { id: 'produtos', label: 'Produtos de plano' },
  { id: 'inadimplencia', label: 'Inadimplência' },
];

export default function PlanosHome() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('contratos');

  const ativos = contratos.filter((c) => c.situacao === 'Ativo').length;
  const emAtraso = contratos.filter((c) => c.situacao === 'Em atraso' || c.situacao === 'Suspenso').length;
  const mrr = contratos.filter((c) => c.situacao !== 'Cancelado').reduce((s, c) => s + contratoValor(c), 0);

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Planos' }]}
        title="Planos"
        subtitle="Venda, cobrança recorrente, renovação automática e controle de inadimplência dos planos."
        actions={<Button variant="primary" icon="plus" to="/planos/contratar">Contratar plano</Button>}
      />

      <div className="grid cols-3">
        <StatCard label="Contratos ativos" value={number(ativos)} icon="shield" tone="success" />
        <StatCard label="Em atraso / suspensos" value={number(emAtraso)} icon="alert" tone="danger" />
        <StatCard label="Receita recorrente mensal" value={money(mrr)} icon="wallet" />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'contratos' && (
        <Card>
          <DataTable
            rows={contratos}
            searchKeys={['id']}
            searchPlaceholder="Buscar por nº do contrato…"
            onRowClick={(r) => navigate(`/planos/contratos/${r.id}`)}
            pageSize={12}
            columns={[
              { key: 'id', header: 'Contrato', sortable: true },
              { key: 'cliente', header: 'Cliente', render: (r) => clienteById(r.clienteId)?.nome, sortValue: (r) => clienteById(r.clienteId)?.nome },
              { key: 'plano', header: 'Plano', render: (r) => planoById(r.planoId)?.nome },
              { key: 'inicio', header: 'Início', sortable: true, render: (r) => date(r.inicio) },
              { key: 'valor', header: 'Mensalidade', align: 'right', render: (r) => money(contratoValor(r)) },
              { key: 'situacao', header: 'Situação', sortable: true, render: (r) => <Badge variant={statusVariant(r.situacao)}>{r.situacao}</Badge> },
            ]}
          />
        </Card>
      )}

      {tab === 'produtos' && (
        <div className="grid cols-2">
          {planosProduto.map((p) => (
            <Card key={p.id} title={p.nome}>
              <div className="row between">
                <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{money(p.valorMensal)}<span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>/mês</span></span>
                <Badge variant="info">{p.limiteDependentes} dependentes</Badge>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 'var(--space-2) 0 var(--space-3)' }}>
                Carência {p.carenciaDias} dias · Reajuste: {p.reajuste}
              </p>
              <div className="row" style={{ gap: 'var(--space-2)' }}>
                {p.coberturas.map((c) => <Tag key={c}>{c}</Tag>)}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'inadimplencia' && (
        <>
          <Card title="Aging da inadimplência">
            <AgingBars buckets={agingInadimplencia} />
            <div className="row between" style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)', fontWeight: 800 }}>
              <span>Total em atraso</span>
              <span className="num">{money(agingInadimplencia.reduce((s, b) => s + b.value, 0))}</span>
            </div>
          </Card>
          <Card title="Contratos em atraso, suspensos ou negociados">
            <DataTable
              searchable={false}
              onRowClick={(r) => navigate(`/planos/contratos/${r.id}`)}
              rows={contratos.filter((c) => c.situacao === 'Em atraso' || c.situacao === 'Suspenso')}
              columns={[
                { key: 'id', header: 'Contrato' },
                { key: 'cliente', header: 'Cliente', render: (r) => clienteById(r.clienteId)?.nome },
                { key: 'situacao', header: 'Situação', render: (r) => <Badge variant={statusVariant(r.situacao)}>{r.situacao}</Badge> },
                { key: 'parcelasEmAberto', header: 'Parcelas em aberto', align: 'right' },
                { key: 'divida', header: 'Dívida estimada', align: 'right', render: (r) => money(r.parcelasEmAberto * contratoValor(r)) },
              ]}
            />
          </Card>
        </>
      )}
    </>
  );
}
