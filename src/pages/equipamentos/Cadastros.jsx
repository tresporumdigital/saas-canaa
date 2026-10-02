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

export const TIPOS = ['Equipamento', 'Produto', 'Serviço'];

// Sugestões de categoria por tipo — o campo aceita qualquer texto.
const CATEGORIAS = {
  Equipamento: ['Mobilidade', 'Leito', 'Higiene', 'Respiratório'],
  Produto: ['Urna', 'Coroa de flores', 'Paramentação', 'Lembrança', 'Outros'],
  Serviço: ['Funeral', 'Velório', 'Translado', 'Preparação do corpo', 'Cremação', 'Sepultamento', 'Documentação', 'Outros'],
};

const TABS = [
  { id: 'venda', label: 'Venda' },
  { id: 'locacao', label: 'Locação' },
];

const FILTROS = [
  { id: 'Todos', label: 'Todos' },
  { id: 'Equipamento', label: 'Equipamentos' },
  { id: 'Produto', label: 'Produtos' },
  { id: 'Serviço', label: 'Serviços' },
];

const tipoVariant = { Equipamento: 'info', Produto: 'neutral', Serviço: 'success' };

const formVazio = (tipo = 'Equipamento') => ({
  tipo, modalidade: 'Venda', descricao: '', categoria: CATEGORIAS[tipo][0], precoCusto: '', precoVenda: '',
  estoque: '', estoqueMinimo: '',
});

// Pop-up "Novo cadastro": escolhe se é equipamento, produto ou serviço. Equipamento pode ser de
// venda ou de locação (este último segue para o cadastro de nºs de inventário).
function NovoCadastroModal({ tipoFixo, onClose, onSaved, onLocacao }) {
  const { toast } = useToast();
  const [form, setForm] = useState(() => formVazio(tipoFixo || 'Equipamento'));
  const [foto, setFoto] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const fileInputRef = useRef(null);
  const ehServico = form.tipo === 'Serviço';
  const ehLocacao = form.tipo === 'Equipamento' && form.modalidade === 'Locação';

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setTipo = (e) => {
    const tipo = e.target.value;
    setForm((f) => ({ ...f, tipo, modalidade: 'Venda', categoria: CATEGORIAS[tipo][0] }));
  };
  const onFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setFoto(URL.createObjectURL(file));
  };

  const pronto = ehLocacao || (form.descricao.trim() && form.categoria.trim() && moneyToNumber(form.precoVenda) > 0);

  const submit = async (e) => {
    e.preventDefault();
    if (ehLocacao) { onLocacao(); return; }
    if (!pronto || salvando) return;
    setSalvando(true);
    try {
      await apiFetch('/equipamentos/produtos.php', {
        method: 'POST',
        body: {
          tipo: form.tipo,
          descricao: form.descricao.trim(),
          categoria: form.categoria.trim(),
          precoCusto: moneyToNumber(form.precoCusto),
          precoVenda: moneyToNumber(form.precoVenda),
          estoque: ehServico ? 0 : Number(form.estoque) || 0,
          estoqueMinimo: ehServico ? 0 : Number(form.estoqueMinimo) || 0,
        },
      });
      toast(`${form.tipo} "${form.descricao.trim()}" cadastrado.`);
      onSaved();
      onClose();
    } catch (err) {
      toast(err.message, { kind: 'danger' });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      title={tipoFixo ? `Novo ${tipoFixo.toLowerCase()}` : 'Novo cadastro'}
      onClose={onClose}
      wide
      footer={(
        <>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="cadastro-form" disabled={!pronto} loading={salvando}>
            {ehLocacao ? 'Continuar' : 'Cadastrar'}
          </Button>
        </>
      )}
    >
      <form id="cadastro-form" onSubmit={submit} className="stack" style={{ gap: 'var(--space-4)' }}>
        <FieldRow>
          <Select label="Tipo de cadastro" value={form.tipo} onChange={setTipo} options={TIPOS} disabled={Boolean(tipoFixo)} />
          {form.tipo === 'Equipamento' && (
            <Select label="Modalidade" value={form.modalidade} onChange={set('modalidade')} options={['Venda', 'Locação']} />
          )}
        </FieldRow>

        {ehLocacao ? (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
            Equipamentos de locação são cadastrados com os números de inventário de cada unidade — clique em
            "Continuar" para informá-los.
          </p>
        ) : (
          <>
            {!ehServico && (
              <div>
                <div className="card-title">Foto</div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFotoChange} />
                <div className="row" style={{ gap: 'var(--space-3)', alignItems: 'center' }}>
                  <Avatar name={form.descricao || form.tipo} src={foto} size="lg" />
                  <Button variant="secondary" type="button" onClick={() => fileInputRef.current?.click()}>
                    {foto ? 'Trocar foto' : 'Selecionar foto'}
                  </Button>
                </div>
              </div>
            )}
            <FieldRow>
              <Input label="Descrição" value={form.descricao} onChange={set('descricao')} required />
              <Input label="Categoria" value={form.categoria} onChange={set('categoria')} list={`categorias-${form.tipo}`} required />
              <Input label="Preço de custo (R$)" value={form.precoCusto} onChange={(e) => setForm((f) => ({ ...f, precoCusto: maskMoney(e.target.value) }))} placeholder="R$ 0,00" />
              <Input label="Preço de venda (R$)" value={form.precoVenda} onChange={(e) => setForm((f) => ({ ...f, precoVenda: maskMoney(e.target.value) }))} placeholder="R$ 0,00" required />
              {!ehServico && (
                <>
                  <Input label="Estoque inicial" type="number" min="0" value={form.estoque} onChange={set('estoque')} />
                  <Input label="Estoque mínimo" type="number" min="0" value={form.estoqueMinimo} onChange={set('estoqueMinimo')} />
                </>
              )}
            </FieldRow>
            <datalist id={`categorias-${form.tipo}`}>
              {CATEGORIAS[form.tipo].map((c) => <option key={c} value={c} />)}
            </datalist>
          </>
        )}
      </form>
    </Modal>
  );
}

// Tela "Cadastros" (equipamentos, produtos e serviços — abas Venda e Locação) e, com
// `tipoFixo="Serviço"`, a tela própria "Serviços" do menu.
export default function Cadastros({ tipoFixo }) {
  const { toast } = useToast();
  const [tab, setTab] = useState('venda');
  const [filtro, setFiltro] = useState('Todos');
  const [novo, setNovo] = useState(false);
  const [novaLocacao, setNovaLocacao] = useState(false);
  const { rows: catalogo, reload: reloadProdutos } = useEquipamentosCacheState();
  const rowsLocacao = useUnidadesCache();
  const produtoPorId = (id) => catalogo.find((p) => p.id === id);

  const tipoAtivo = tipoFixo || filtro;
  const rowsVenda = catalogo
    .filter((p) => !p.locavel)
    .filter((p) => tipoAtivo === 'Todos' || p.tipo === tipoAtivo);

  const criarLocacao = async ({ produto, unidades }) => {
    try {
      await apiFetch('/equipamentos/produtos.php', {
        method: 'POST',
        body: {
          tipo: 'Equipamento',
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

  const servicos = tipoFixo === 'Serviço';
  const titulo = servicos ? 'Serviços' : 'Cadastros';
  const mostrarEstoque = tipoAtivo !== 'Serviço';

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: titulo }]}
        title={titulo}
        subtitle={servicos
          ? 'Todos os tipos de serviço executados pela funerária — usados nas vendas e na cobertura dos planos.'
          : 'Equipamentos, produtos e serviços — itens de venda e equipamentos de locação (com número de inventário).'}
        actions={(
          <Button variant="primary" icon="plus" onClick={() => setNovo(true)}>
            {servicos ? 'Novo serviço' : 'Novo cadastro'}
          </Button>
        )}
      />

      {!servicos && <Tabs tabs={TABS} active={tab} onChange={setTab} />}

      {(servicos || tab === 'venda') && (
        <Card>
          {!servicos && (
            <div className="row" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
              {FILTROS.map((f) => (
                <Button key={f.id} size="sm" variant={filtro === f.id ? 'primary' : 'secondary'} onClick={() => setFiltro(f.id)}>
                  {f.label}
                </Button>
              ))}
            </div>
          )}
          <DataTable
            rows={rowsVenda}
            searchKeys={['descricao', 'categoria', 'id', 'tipo']}
            searchPlaceholder={servicos ? 'Buscar por serviço, categoria ou código…' : 'Buscar por item, categoria ou código…'}
            pageSize={12}
            emptyLabel={servicos ? 'Nenhum serviço cadastrado ainda — use "Novo serviço".' : 'Nenhum item cadastrado ainda — use "Novo cadastro".'}
            columns={[
              ...(servicos ? [] : [{ key: 'foto', header: '', render: (r) => <Avatar name={r.descricao} src={r.foto} size="sm" /> }]),
              { key: 'id', header: 'Código', sortable: true },
              ...(servicos ? [] : [{ key: 'tipo', header: 'Tipo', sortable: true, render: (r) => <Badge variant={tipoVariant[r.tipo] || 'neutral'}>{r.tipo}</Badge> }]),
              { key: 'descricao', header: servicos ? 'Serviço' : 'Descrição', sortable: true },
              { key: 'categoria', header: 'Categoria', sortable: true },
              { key: 'precoCusto', header: 'Custo', align: 'right', render: (r) => money(r.precoCusto) },
              { key: 'precoVenda', header: 'Venda', align: 'right', render: (r) => money(r.precoVenda) },
              ...(mostrarEstoque ? [{ key: 'estoque', header: 'Estoque', align: 'right', render: (r) => (r.tipo === 'Serviço' ? '—' : (
                <span style={{ color: r.estoque <= r.estoqueMinimo ? 'var(--canaa-danger-600)' : 'inherit', fontWeight: 700 }}>{r.estoque}/{r.estoqueMinimo}</span>
              )) }] : []),
            ]}
          />
        </Card>
      )}

      {!servicos && tab === 'locacao' && (
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
        <NovoCadastroModal
          tipoFixo={tipoFixo}
          onClose={() => setNovo(false)}
          onSaved={reloadProdutos}
          onLocacao={() => { setNovo(false); setNovaLocacao(true); }}
        />
      )}

      {novaLocacao && (
        <LocacaoFormModal onClose={() => setNovaLocacao(false)} onCreate={criarLocacao} />
      )}
    </>
  );
}
