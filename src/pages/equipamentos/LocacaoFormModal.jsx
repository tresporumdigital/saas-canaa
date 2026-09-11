import { useRef, useState } from 'react';
import { Modal, Button, Input, Select, FieldRow, Card, Icon, Avatar } from '../../components/index.js';
import { maskMoney, moneyToNumber } from '../../lib/masks.js';

const CATEGORIAS = ['Mobilidade', 'Leito', 'Higiene', 'Respiratório'];
const ESTADOS = ['Ótimo', 'Bom', 'Regular'];

const unidadeVazia = () => ({ patrimonio: '', estadoConservacao: 'Ótimo', aquisicao: '2026-09-01' });

// Pop-up de cadastro de equipamento para locação — registra o produto e todos os
// números de inventário (unidades) que entram no acervo de empréstimo.
export default function LocacaoFormModal({ onClose, onCreate }) {
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [custo, setCusto] = useState('');
  const [foto, setFoto] = useState(null);
  const [unidades, setUnidades] = useState([unidadeVazia()]);
  const fileInputRef = useRef(null);

  const onFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFoto(URL.createObjectURL(file));
  };

  const addUnidade = () => setUnidades((l) => [...l, unidadeVazia()]);
  const removeUnidade = (i) => setUnidades((l) => l.filter((_, idx) => idx !== i));
  const setUnidade = (i, k, v) => setUnidades((l) => l.map((u, idx) => (idx === i ? { ...u, [k]: v } : u)));

  const patrimoniosValidos = unidades.every((u) => u.patrimonio.trim());
  const pronto = descricao.trim() && unidades.length > 0 && patrimoniosValidos;

  const submit = (e) => {
    e.preventDefault();
    if (!pronto) return;
    const sigla = descricao.trim().slice(0, 3).toUpperCase();
    const produtoId = `EQ-${sigla}${String(Date.now()).slice(-3)}`;
    onCreate({
      produto: {
        id: produtoId,
        descricao: descricao.trim(),
        categoria,
        precoCusto: moneyToNumber(custo),
        precoVenda: 0,
        estoque: unidades.length,
        estoqueMinimo: 0,
        locavel: true,
        foto,
      },
      unidades: unidades.map((u) => ({
        id: u.patrimonio.trim(),
        patrimonio: u.patrimonio.trim(),
        produtoId,
        descricao: descricao.trim(),
        status: 'Disponível',
        estadoConservacao: u.estadoConservacao,
        aquisicao: u.aquisicao,
      })),
    });
    onClose();
  };

  return (
    <Modal
      title="Novo equipamento para locação"
      onClose={onClose}
      wide
      footer={(
        <>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="locacao-form" disabled={!pronto}>Cadastrar equipamento</Button>
        </>
      )}
    >
      <form id="locacao-form" onSubmit={submit} className="stack" style={{ gap: 'var(--space-4)' }}>
        <div>
          <div className="card-title">Foto do produto</div>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFotoChange} />
          <div className="row" style={{ gap: 'var(--space-3)', alignItems: 'center' }}>
            <Avatar name={descricao || 'Equipamento'} src={foto} size="lg" />
            <Button variant="secondary" type="button" onClick={() => fileInputRef.current?.click()}>
              {foto ? 'Trocar foto' : 'Selecionar foto'}
            </Button>
          </div>
        </div>

        <FieldRow>
          <Input label="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
          <Select label="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} options={CATEGORIAS} />
          <Input label="Custo unitário (R$)" value={custo} onChange={(e) => setCusto(maskMoney(e.target.value))} placeholder="R$ 0,00" />
        </FieldRow>

        <div className="row between" style={{ alignItems: 'center' }}>
          <div className="card-title" style={{ margin: 0 }}>Números de inventário</div>
          <Button variant="secondary" size="sm" icon="plus" type="button" onClick={addUnidade}>Adicionar unidade</Button>
        </div>

        {unidades.map((u, i) => (
          <Card
            key={i}
            title={`Unidade ${i + 1}`}
            action={unidades.length > 1 ? (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeUnidade(i)} aria-label={`Remover unidade ${i + 1}`}>
                <Icon name="trash" size={14} />
              </button>
            ) : null}
          >
            <FieldRow>
              <Input label="Nº de inventário" value={u.patrimonio} onChange={(e) => setUnidade(i, 'patrimonio', e.target.value)} placeholder="Ex.: CDR-015" required />
              <Select label="Estado de conservação" value={u.estadoConservacao} onChange={(e) => setUnidade(i, 'estadoConservacao', e.target.value)} options={ESTADOS} />
              <Input label="Data de aquisição" type="date" value={u.aquisicao} onChange={(e) => setUnidade(i, 'aquisicao', e.target.value)} />
            </FieldRow>
          </Card>
        ))}
      </form>
    </Modal>
  );
}
