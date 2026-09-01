import { useMemo, useState } from 'react';
import { PageHeader } from '../../components/index.js';
import {
  Card, DataTable, Badge, Button, Modal, Input, Select, Checkbox, FieldRow,
} from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { equipamentosProduto } from '../../mock/equipamentos.js';
import { money } from '../../lib/format.js';

const CATEGORIAS = ['Mobilidade', 'Leito', 'Higiene', 'Respiratório'];

export default function EquipamentosCadastro() {
  const { toast } = useToast();
  const [novo, setNovo] = useState(false);
  const [novos, setNovos] = useState([]);
  const rows = useMemo(() => [...novos, ...equipamentosProduto], [novos]);

  const [form, setForm] = useState({
    descricao: '', categoria: 'Mobilidade', precoCusto: '', precoVenda: '',
    estoque: '', estoqueMinimo: '', locavel: true,
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const pronto = form.descricao.trim() && Number(form.precoVenda) > 0;

  const criar = (e) => {
    e.preventDefault();
    if (!pronto) return;
    const sigla = form.descricao.trim().slice(0, 3).toUpperCase();
    const equip = {
      id: `EQ-${sigla}${String(Date.now()).slice(-3)}`,
      descricao: form.descricao.trim(),
      categoria: form.categoria,
      precoCusto: Number(form.precoCusto) || 0,
      precoVenda: Number(form.precoVenda),
      estoque: Number(form.estoque) || 0,
      estoqueMinimo: Number(form.estoqueMinimo) || 0,
      locavel: form.locavel,
    };
    setNovos((l) => [equip, ...l]);
    toast(`Equipamento ${equip.descricao} cadastrado (simulação — sem persistência).`);
    setForm({ descricao: '', categoria: 'Mobilidade', precoCusto: '', precoVenda: '', estoque: '', estoqueMinimo: '', locavel: true });
    setNovo(false);
  };

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Cadastro de Equipamentos' }]}
        title="Cadastro de Equipamentos"
        subtitle="Catálogo de equipamentos de convalescência disponíveis para venda e para empréstimo."
        actions={<Button variant="primary" icon="plus" onClick={() => setNovo(true)}>Novo equipamento</Button>}
      />

      <Card>
        <DataTable
          rows={rows}
          searchKeys={['descricao', 'categoria', 'id']}
          searchPlaceholder="Buscar por equipamento, categoria ou código…"
          pageSize={12}
          columns={[
            { key: 'id', header: 'Código', sortable: true },
            { key: 'descricao', header: 'Equipamento', sortable: true },
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

      {novo && (
        <Modal
          title="Novo equipamento"
          onClose={() => setNovo(false)}
          wide
          footer={(
            <>
              <Button variant="secondary" type="button" onClick={() => setNovo(false)}>Cancelar</Button>
              <Button variant="primary" type="submit" form="equip-form" disabled={!pronto}>Cadastrar equipamento</Button>
            </>
          )}
        >
          <form id="equip-form" onSubmit={criar} className="stack" style={{ gap: 'var(--space-4)' }}>
            <FieldRow>
              <Input label="Descrição" value={form.descricao} onChange={set('descricao')} required />
              <Select label="Categoria" value={form.categoria} onChange={set('categoria')} options={CATEGORIAS} />
              <Input label="Preço de custo (R$)" type="number" min="0" step="0.01" value={form.precoCusto} onChange={set('precoCusto')} />
              <Input label="Preço de venda (R$)" type="number" min="0" step="0.01" value={form.precoVenda} onChange={set('precoVenda')} required />
              <Input label="Estoque inicial" type="number" min="0" value={form.estoque} onChange={set('estoque')} />
              <Input label="Estoque mínimo" type="number" min="0" value={form.estoqueMinimo} onChange={set('estoqueMinimo')} />
            </FieldRow>
            <Checkbox label="Disponível para empréstimo (locável)" checked={form.locavel} onChange={(e) => setForm((f) => ({ ...f, locavel: e.target.checked }))} />
          </form>
        </Modal>
      )}
    </>
  );
}
