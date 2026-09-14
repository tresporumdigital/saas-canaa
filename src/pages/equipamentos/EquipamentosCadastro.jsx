import { useRef, useState } from 'react';
import { PageHeader } from '../../components/index.js';
import {
  Card, Tabs, DataTable, Badge, Button, Modal, Input, Select, FieldRow, Avatar,
} from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { apiFetch, useEquipamentosCacheState, useUnidadesCache, reloadUnidadesCache } from '../../lib/api.js';
import { money, date } from '../../lib/format.js';
import { maskMoney, moneyToNumber } from '../../lib/masks.js';
import LocacaoFormModal from './LocacaoFormModal.jsx';

const CATEGORIAS = ['Mobilidade', 'Leito', 'Higiene', 'Respiratório'];
const TABS = [
  { id: 'venda', label: 'Venda' },
  { id: 'locacao', label: 'Locação' },
];

export default function EquipamentosCadastro() {
  const { toast } = useToast();
  const [tab, setTab] = useState('venda');

  // ---- Venda ----
  const [novo, setNovo] = useState(false);
  const { rows: rowsVenda, reload: reloadProdutos } = useEquipamentosCacheState();

  const [form, setForm] = useState({
    descricao: '', categoria: 'Mobilidade', precoCusto: '', precoVenda: '',
    estoque: '', estoqueMinimo: '',
  });
  const [foto, setFoto] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const fileInputRef = useRef(null);
  const onFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFoto(URL.createObjectURL(file));
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const pronto = form.descricao.trim() && moneyToNumber(form.precoVenda) > 0;

  const criar = async (e) => {
    e.preventDefault();
    if (!pronto || salvando) return;
    setSalvando(true);
    try {
      await apiFetch('/equipamentos/produtos.php', {
        method: 'POST',
        body: {
          descricao: form.descricao.trim(),
          categoria: form.categoria,
          precoCusto: moneyToNumber(form.precoCusto),
          precoVenda: moneyToNumber(form.precoVenda),
          estoque: Number(form.estoque) || 0,
          estoqueMinimo: Number(form.estoqueMinimo) || 0,
        },
      });
      toast(`Equipamento ${form.descricao.trim()} cadastrado para venda.`);
      reloadProdutos();
      setForm({ descricao: '', categoria: 'Mobilidade', precoCusto: '', precoVenda: '', estoque: '', estoqueMinimo: '' });
      setFoto(null);
      setNovo(false);
    } catch (err) {
      toast(err.message, { kind: 'danger' });
    } finally {
      setSalvando(false);
    }
  };

  // ---- Locação ----
  const [novaLocacao, setNovaLocacao] = useState(false);
  const rowsLocacao = useUnidadesCache();
  const produtoPorId = (id) => rowsVenda.find((p) => p.id === id);

  const criarLocacao = async ({ produto, unidades }) => {
    try {
      await apiFetch('/equipamentos/produtos.php', {
        method: 'POST',
        body: {
          descricao: produto.descricao,
          categoria: produto.categoria,
          precoCusto: produto.precoCusto,
          unidades: unidades.map((u) => ({
            patrimonio: u.patrimonio, estadoConservacao: u.estadoConservacao, aquisicao: u.aquisicao,
          })),
        },
      });
      toast(`Equipamento ${produto.descricao} cadastrado para locação com ${unidades.length} nº(s) de inventário.`);
      reloadProdutos();
      reloadUnidadesCache();
    } catch (err) {
      toast(err.message, { kind: 'danger' });
    }
  };

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Cadastro de Equipamentos' }]}
        title="Cadastro de Equipamentos"
        subtitle="Cadastros separados para equipamentos de venda e para equipamentos de locação (com número de inventário)."
        actions={tab === 'venda' ? (
          <Button variant="primary" icon="plus" onClick={() => setNovo(true)}>Novo equipamento (venda)</Button>
        ) : (
          <Button variant="primary" icon="plus" onClick={() => setNovaLocacao(true)}>Novo equipamento (locação)</Button>
        )}
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'venda' && (
        <Card>
          <DataTable
            rows={rowsVenda}
            searchKeys={['descricao', 'categoria', 'id']}
            searchPlaceholder="Buscar por equipamento, categoria ou código…"
            pageSize={12}
            columns={[
              { key: 'foto', header: '', render: (r) => <Avatar name={r.descricao} src={r.foto} size="sm" /> },
              { key: 'id', header: 'Código', sortable: true },
              { key: 'descricao', header: 'Equipamento', sortable: true },
              { key: 'categoria', header: 'Categoria', sortable: true },
              { key: 'precoCusto', header: 'Custo', align: 'right', render: (r) => money(r.precoCusto) },
              { key: 'precoVenda', header: 'Venda', align: 'right', render: (r) => money(r.precoVenda) },
              { key: 'estoque', header: 'Estoque', align: 'right', render: (r) => (
                <span style={{ color: r.estoque <= r.estoqueMinimo ? 'var(--canaa-danger-600)' : 'inherit', fontWeight: 700 }}>{r.estoque}/{r.estoqueMinimo}</span>
              ) },
            ]}
          />
        </Card>
      )}

      {tab === 'locacao' && (
        <Card title={`Números de inventário (${rowsLocacao.length})`}>
          <DataTable
            rows={rowsLocacao}
            searchKeys={['patrimonio', 'descricao', 'status']}
            searchPlaceholder="Buscar por nº de inventário, equipamento ou status…"
            pageSize={14}
            getKey={(r) => r.patrimonio}
            columns={[
              { key: 'foto', header: '', render: (r) => <Avatar name={r.descricao} src={r.foto} size="sm" /> },
              { key: 'patrimonio', header: 'Nº de inventário', sortable: true },
              { key: 'descricao', header: 'Equipamento', sortable: true },
              { key: 'categoria', header: 'Categoria', render: (r) => produtoPorId(r.produtoId)?.categoria || '—' },
              { key: 'estadoConservacao', header: 'Conservação' },
              { key: 'aquisicao', header: 'Aquisição', render: (r) => date(r.aquisicao) },
              { key: 'status', header: 'Status', render: (r) => <Badge variant={r.status === 'Disponível' ? 'success' : 'neutral'}>{r.status}</Badge> },
            ]}
          />
        </Card>
      )}

      {novo && (
        <Modal
          title="Novo equipamento (venda)"
          onClose={() => setNovo(false)}
          wide
          footer={(
            <>
              <Button variant="secondary" type="button" onClick={() => setNovo(false)}>Cancelar</Button>
              <Button variant="primary" type="submit" form="equip-form" disabled={!pronto} loading={salvando}>Cadastrar equipamento</Button>
            </>
          )}
        >
          <form id="equip-form" onSubmit={criar} className="stack" style={{ gap: 'var(--space-4)' }}>
            <div>
              <div className="card-title">Foto do produto</div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFotoChange} />
              <div className="row" style={{ gap: 'var(--space-3)', alignItems: 'center' }}>
                <Avatar name={form.descricao || 'Equipamento'} src={foto} size="lg" />
                <Button variant="secondary" type="button" onClick={() => fileInputRef.current?.click()}>
                  {foto ? 'Trocar foto' : 'Selecionar foto'}
                </Button>
              </div>
            </div>
            <FieldRow>
              <Input label="Descrição" value={form.descricao} onChange={set('descricao')} required />
              <Select label="Categoria" value={form.categoria} onChange={set('categoria')} options={CATEGORIAS} />
              <Input label="Preço de custo (R$)" value={form.precoCusto} onChange={(e) => setForm((f) => ({ ...f, precoCusto: maskMoney(e.target.value) }))} placeholder="R$ 0,00" />
              <Input label="Preço de venda (R$)" value={form.precoVenda} onChange={(e) => setForm((f) => ({ ...f, precoVenda: maskMoney(e.target.value) }))} placeholder="R$ 0,00" required />
              <Input label="Estoque inicial" type="number" min="0" value={form.estoque} onChange={set('estoque')} />
              <Input label="Estoque mínimo" type="number" min="0" value={form.estoqueMinimo} onChange={set('estoqueMinimo')} />
            </FieldRow>
          </form>
        </Modal>
      )}

      {novaLocacao && (
        <LocacaoFormModal onClose={() => setNovaLocacao(false)} onCreate={criarLocacao} />
      )}
    </>
  );
}
