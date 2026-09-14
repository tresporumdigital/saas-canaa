import { useMemo, useState } from 'react';
import { PageHeader } from '../../components/index.js';
import {
  Card, Tabs, DataTable, Badge, Button, StatCard, Alert, Modal, Drawer, DefList,
  Input, Select, FieldRow, EnderecoFields, Avatar,
} from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  equipamentosProduto, equipamentosAbaixoDoMinimo, vendasEquipamento, vendaTotais,
} from '../../mock/equipamentos.js';
import { useClientesCache } from '../../lib/api.js';
import { money, date, number } from '../../lib/format.js';
import { maskMoney, moneyToNumber, numberToMoneyInput, maskCPF, maskPhone } from '../../lib/masks.js';

const TABS = [
  { id: 'vendas', label: 'Vendas' },
  { id: 'catalogo', label: 'Catálogo e estoque' },
  { id: 'relatorio', label: 'Relatório de vendas' },
];

const FORMAS_PAGAMENTO = ['Pix', 'Dinheiro', 'Boleto', 'Cartão 2x', 'Cartão 3x', 'Boleto 3x'];
const enderecoVazio = { cep: '', logradouro: '', numero: '', bairro: '', cidade: '', uf: '' };
const compradorVazio = { nome: '', cpf: '', telefone: '' };

export default function EquipamentosVendas() {
  const { toast } = useToast();
  const [tab, setTab] = useState('vendas');
  const clientes = useClientesCache();
  const [venda, setVenda] = useState(null);
  const [novasVendas, setNovasVendas] = useState([]);

  // Fluxo de "Nova venda": 0 fechado · 1 catálogo · 2 dados · 3 nota fiscal
  const [passo, setPasso] = useState(0);
  const [equipSel, setEquipSel] = useState(null);
  const [ehCliente, setEhCliente] = useState('Sim');
  const [clienteId, setClienteId] = useState('');
  const [comprador, setComprador] = useState(compradorVazio);
  const [enderecoVenda, setEnderecoVenda] = useState(enderecoVazio);
  const [formaPagamento, setFormaPagamento] = useState('Pix');
  const [valor, setValor] = useState('');
  const [ultimaVenda, setUltimaVenda] = useState(null);

  const rowsVendas = useMemo(() => [...novasVendas, ...vendasEquipamento], [novasVendas]);
  const abaixoMin = equipamentosAbaixoDoMinimo();
  const totalMes = rowsVendas.reduce((s, v) => s + vendaTotais(v).total, 0);
  const margemMes = rowsVendas.reduce((s, v) => s + vendaTotais(v).margem, 0);

  const fecharVenda = () => {
    setPasso(0);
    setEquipSel(null);
    setEhCliente('Sim');
    setClienteId('');
    setComprador(compradorVazio);
    setEnderecoVenda(enderecoVazio);
    setFormaPagamento('Pix');
    setValor('');
  };

  const escolherEquip = (p) => {
    setEquipSel(p);
    setValor(numberToMoneyInput(p.precoVenda));
    setPasso(2);
  };

  const escolherCliente = (id) => {
    setClienteId(id);
    const c = clientes.find((x) => x.id === id);
    if (c) {
      setComprador({ nome: c.nome, cpf: maskCPF(c.cpf), telefone: maskPhone(c.telefone) });
      setEnderecoVenda({ ...c.endereco });
    }
  };

  const mudarEhCliente = (v) => {
    setEhCliente(v);
    setClienteId('');
    setComprador(compradorVazio);
    setEnderecoVenda(enderecoVazio);
  };

  const vendaPronta = Boolean(
    equipSel && comprador.nome.trim() && comprador.cpf.replace(/\D/g, '').length === 11
    && comprador.telefone.replace(/\D/g, '').length >= 10 && moneyToNumber(valor) > 0
    && (ehCliente !== 'Sim' || clienteId),
  );

  const registrarVenda = (e) => {
    e.preventDefault();
    if (!vendaPronta) return;
    const nv = {
      id: `VEQ-2026-9${String(Date.now()).slice(-3)}`,
      data: '2026-09-01',
      clienteId: ehCliente === 'Sim' ? clienteId : null,
      clienteNome: comprador.nome.trim(),
      vendedor: 'Balcão',
      formaPagamento,
      itens: [{ descricao: equipSel.descricao, qtd: 1, valorUnit: moneyToNumber(valor) }],
      desconto: 0,
      custo: equipSel.precoCusto,
      notaFiscalId: null,
    };
    setNovasVendas((l) => [nv, ...l]);
    toast(`Venda ${nv.id} registrada para ${nv.clienteNome} (simulação — sem persistência).`);
    setUltimaVenda(nv);
    setPasso(3);
  };

  const finalizarComNota = (emitir) => {
    toast(emitir
      ? `Nota fiscal da venda ${ultimaVenda.id} gerada e enviada para o Financeiro (fila de Notas Fiscais — simulação).`
      : `Venda ${ultimaVenda.id} registrada. A nota fiscal poderá ser emitida depois, em Notas Fiscais (simulação).`);
    setUltimaVenda(null);
    fecharVenda();
  };

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Vendas de Equipamentos' }]}
        title="Vendas de Equipamentos"
        subtitle="Controle de estoque, venda e faturamento de equipamentos de apoio à convalescência."
        actions={<Button variant="primary" icon="plus" onClick={() => setPasso(1)}>Nova venda</Button>}
      />

      <div className="grid cols-3">
        <StatCard label="Vendas no período" value={number(rowsVendas.length)} icon="box" />
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
            rows={rowsVendas}
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
              {Object.values(rowsVendas.reduce((acc, v) => {
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

      {passo === 1 && (
        <Modal title="Selecione o equipamento" onClose={fecharVenda} wide footer={<Button variant="secondary" onClick={fecharVenda}>Cancelar</Button>}>
          <div className="grid cols-3">
            {equipamentosProduto.map((p) => (
              <button key={p.id} type="button" className="equip-card" onClick={() => escolherEquip(p)}>
                <Avatar name={p.descricao} src={p.foto} size="lg" />
                <span className="equip-card-nome">{p.descricao}</span>
                <span className="equip-card-patrimonio">{money(p.precoVenda)}</span>
              </button>
            ))}
          </div>
        </Modal>
      )}

      {passo === 2 && equipSel && (
        <Modal
          title={`Nova venda — ${equipSel.descricao}`}
          onClose={fecharVenda}
          wide
          footer={(
            <>
              <Button variant="secondary" type="button" onClick={() => setPasso(1)}>Trocar equipamento</Button>
              <Button variant="secondary" type="button" onClick={fecharVenda}>Cancelar</Button>
              <Button variant="primary" type="submit" form="venda-form" disabled={!vendaPronta}>Confirmar venda</Button>
            </>
          )}
        >
          <form id="venda-form" onSubmit={registrarVenda} className="stack" style={{ gap: 'var(--space-4)' }}>
            <div className="row" style={{ gap: 'var(--space-3)', alignItems: 'center' }}>
              <Avatar name={equipSel.descricao} src={equipSel.foto} size="md" />
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{money(equipSel.precoVenda)} de tabela</div>
            </div>

            <Select label="É um cliente cadastrado?" value={ehCliente} onChange={(e) => mudarEhCliente(e.target.value)} options={['Sim', 'Não']} />

            {ehCliente === 'Sim' && (
              <Select label="Cliente (titular do plano)" value={clienteId} onChange={(e) => escolherCliente(e.target.value)}>
                <option value="">Selecione um cliente…</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </Select>
            )}

            <FieldRow>
              <Input label="Nome do comprador" value={comprador.nome} onChange={(e) => setComprador((c) => ({ ...c, nome: e.target.value }))} required />
              <Input label="CPF" value={comprador.cpf} onChange={(e) => setComprador((c) => ({ ...c, cpf: maskCPF(e.target.value) }))} placeholder="000.000.000-00" required />
              <Input label="Telefone" value={comprador.telefone} onChange={(e) => setComprador((c) => ({ ...c, telefone: maskPhone(e.target.value) }))} placeholder="(00) 00000-0000" required />
              <Input label="Valor (R$)" value={valor} onChange={(e) => setValor(maskMoney(e.target.value))} placeholder="R$ 0,00" required />
              <Select label="Forma de pagamento" value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} options={FORMAS_PAGAMENTO} />
            </FieldRow>

            <EnderecoFields title="Endereço (para a nota fiscal)" value={enderecoVenda} onChange={setEnderecoVenda} />
          </form>
        </Modal>
      )}

      {passo === 3 && ultimaVenda && (
        <Modal title="Venda registrada" onClose={() => finalizarComNota(false)} wide footer={null}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
            Emitir nota fiscal desta venda agora?
          </p>
          <div className="row" style={{ gap: 'var(--space-3)', justifyContent: 'center', marginTop: 'var(--space-4)' }}>
            <Button variant="primary" icon="receipt" type="button" onClick={() => finalizarComNota(true)}>Emitir agora</Button>
            <Button variant="secondary" icon="clock" type="button" onClick={() => finalizarComNota(false)}>Emitir depois</Button>
          </div>
        </Modal>
      )}
    </>
  );
}
