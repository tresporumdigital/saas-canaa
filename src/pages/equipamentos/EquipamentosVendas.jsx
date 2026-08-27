import { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader.jsx';
import {
  Card, Tabs, DataTable, Badge, Button, StatCard, Alert, Modal, Drawer, DefList,
} from '../../components/ui/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  equipamentosProduto, equipamentosAbaixoDoMinimo, vendasEquipamento, vendaTotais,
} from '../../mock/equipamentos.js';
import { money, date, number } from '../../lib/format.js';

const TABS = [
  { id: 'vendas', label: 'Vendas' },
  { id: 'catalogo', label: 'Catálogo e estoque' },
  { id: 'relatorio', label: 'Relatório de vendas' },
];

export default function EquipamentosVendas() {
  const { toast } = useToast();
  const [tab, setTab] = useState('vendas');
  const [venda, setVenda] = useState(null);
  const [nova, setNova] = useState(false);

  const abaixoMin = equipamentosAbaixoDoMinimo();
  const totalMes = vendasEquipamento.reduce((s, v) => s + vendaTotais(v).total, 0);
  const margemMes = vendasEquipamento.reduce((s, v) => s + vendaTotais(v).margem, 0);

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Vendas de Equipamentos' }]}
        title="Vendas de Equipamentos"
        subtitle="Controle de estoque, venda e faturamento de equipamentos de apoio à convalescência."
        actions={<Button variant="primary" icon="plus" onClick={() => setNova(true)}>Nova venda</Button>}
      />

      <div className="grid cols-3">
        <StatCard label="Vendas no período" value={number(vendasEquipamento.length)} icon="box" />
        <StatCard label="Faturamento" value={money(totalMes)} icon="cash" tone="success" />
        <StatCard label="Margem" value={money(margemMes)} icon="trend" tone="info" />
      </div>

      {abaixoMin.length > 0 && (
        <Alert variant="warning" title="Estoque no mínimo ou abaixo">
          {abaixoMin.map((p) => `${p.descricao} (${p.estoque}/${p.estoqueMinimo})`).join(' · ')}
        </Alert>
      )}

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'vendas' && (
        <Card>
          <DataTable
            rows={vendasEquipamento}
            searchKeys={['id', 'clienteNome', 'vendedor']}
            onRowClick={(r) => setVenda(r)}
            pageSize={10}
            columns={[
              { key: 'id', header: 'Venda', sortable: true },
              { key: 'data', header: 'Data', sortable: true, render: (r) => date(r.data) },
              { key: 'clienteNome', header: 'Cliente', sortable: true },
              { key: 'itens', header: 'Itens', render: (r) => r.itens.reduce((s, it) => s + it.qtd, 0) },
              { key: 'forma', header: 'Pagamento', render: (r) => r.formaPagamento },
              { key: 'total', header: 'Total', align: 'right', sortValue: (r) => vendaTotais(r).total, render: (r) => money(vendaTotais(r).total) },
              { key: 'margem', header: 'Margem', align: 'right', render: (r) => money(vendaTotais(r).margem) },
            ]}
          />
        </Card>
      )}

      {tab === 'catalogo' && (
        <Card>
          <DataTable
            searchable
            rows={equipamentosProduto}
            searchKeys={['descricao', 'categoria']}
            pageSize={12}
            columns={[
              { key: 'id', header: 'Código' },
              { key: 'descricao', header: 'Produto', sortable: true },
              { key: 'categoria', header: 'Categoria', sortable: true },
              { key: 'precoCusto', header: 'Custo', align: 'right', render: (r) => money(r.precoCusto) },
              { key: 'precoVenda', header: 'Venda', align: 'right', render: (r) => money(r.precoVenda) },
              { key: 'estoque', header: 'Estoque', align: 'right', render: (r) => (
                <span style={{ color: r.estoque <= r.estoqueMinimo ? 'var(--canaa-danger-600)' : 'inherit', fontWeight: 700 }}>{r.estoque}/{r.estoqueMinimo}</span>
              ) },
              { key: 'locavel', header: 'Locável', render: (r) => <Badge variant={r.locavel ? 'info' : 'neutral'}>{r.locavel ? 'Sim' : 'Não'}</Badge> },
            ]}
          />
        </Card>
      )}

      {tab === 'relatorio' && (
        <Card title="Vendas por produto (período)">
          <table className="data-table">
            <thead><tr><th>Produto</th><th className="num">Qtd</th><th className="num">Faturamento</th><th className="num">Margem</th></tr></thead>
            <tbody>
              {Object.values(vendasEquipamento.reduce((acc, v) => {
                v.itens.forEach((it) => {
                  acc[it.descricao] = acc[it.descricao] || { descricao: it.descricao, qtd: 0, fat: 0 };
                  acc[it.descricao].qtd += it.qtd;
                  acc[it.descricao].fat += it.qtd * it.valorUnit;
                });
                return acc;
              }, {})).map((row) => (
                <tr key={row.descricao}>
                  <td>{row.descricao}</td>
                  <td className="num">{row.qtd}</td>
                  <td className="num">{money(row.fat)}</td>
                  <td className="num">{money(row.fat * 0.45)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {venda && (
        <Drawer title={`Venda ${venda.id}`} onClose={() => setVenda(null)}
          actions={<Button size="sm" variant="secondary" icon="receipt" onClick={() => toast('NF-e acionada a partir da venda (simulação).')}>Emitir NF-e</Button>}>
          <DefList items={[
            { label: 'Cliente', value: venda.clienteNome },
            { label: 'Data', value: date(venda.data) },
            { label: 'Vendedor', value: venda.vendedor },
            { label: 'Forma de pagamento', value: venda.formaPagamento },
            { label: 'Nota fiscal', value: venda.notaFiscalId || '—' },
          ]} />
          <Card title="Itens">
            <table className="data-table">
              <thead><tr><th>Item</th><th className="num">Qtd</th><th className="num">Unit.</th><th className="num">Subtotal</th></tr></thead>
              <tbody>
                {venda.itens.map((it, i) => (
                  <tr key={i}><td>{it.descricao}</td><td className="num">{it.qtd}</td><td className="num">{money(it.valorUnit)}</td><td className="num">{money(it.qtd * it.valorUnit)}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="stack gap-sm" style={{ marginTop: 'var(--space-3)' }}>
              <div className="row between" style={{ fontSize: 'var(--text-sm)' }}><span>Desconto</span><span className="num">− {money(venda.desconto)}</span></div>
              <div className="row between" style={{ fontWeight: 800 }}><span>Total</span><span className="num">{money(vendaTotais(venda).total)}</span></div>
            </div>
          </Card>
        </Drawer>
      )}

      {nova && (
        <Modal title="Nova venda de equipamento" onClose={() => setNova(false)}
          footer={<>
            <Button size="sm" variant="secondary" onClick={() => setNova(false)}>Cancelar</Button>
            <Button size="sm" variant="primary" onClick={() => { toast('Venda registrada, estoque baixado e NF acionada (simulação).'); setNova(false); }}>Confirmar venda</Button>
          </>}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            Na confirmação, o estoque é baixado automaticamente e a emissão de nota fiscal é acionada.
          </p>
        </Modal>
      )}
    </>
  );
}
