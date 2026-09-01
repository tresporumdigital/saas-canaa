import { useState } from 'react';
import { Modal, Button, Input, Select, FieldRow } from '../../components/index.js';

// Pop-up para lançar uma nova conta a receber ou a pagar.
export default function NovaContaModal({ tipo, onClose, onCreate }) {
  const receber = tipo === 'receber';
  const [form, setForm] = useState({
    descricao: '',
    categoria: '',
    centroCusto: receber ? 'Planos' : 'Administrativo',
    vencimento: '2026-09-10',
    valor: '',
    status: 'Em aberto',
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const pronto = form.descricao.trim() && Number(form.valor) > 0;

  const submit = (e) => {
    e.preventDefault();
    if (!pronto) return;
    const seq = String(Date.now()).slice(-4);
    onCreate({
      id: `${receber ? 'AR' : 'AP'}-9${seq}`,
      origem: receber ? 'Lançamento manual' : 'Despesa avulsa',
      ref: null,
      [receber ? 'clienteNome' : 'favorecido']: form.descricao.trim(),
      categoria: form.categoria.trim() || (receber ? 'Outras receitas' : 'Outras despesas'),
      centroCusto: form.centroCusto,
      vencimento: form.vencimento,
      valor: Number(form.valor),
      status: form.status,
    });
    onClose();
  };

  return (
    <Modal
      title={receber ? 'Nova conta a receber' : 'Nova conta a pagar'}
      onClose={onClose}
      wide
      footer={(
        <>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="nova-conta-form" disabled={!pronto}>Lançar conta</Button>
        </>
      )}
    >
      <form id="nova-conta-form" onSubmit={submit} className="stack" style={{ gap: 'var(--space-4)' }}>
        <FieldRow>
          <Input label={receber ? 'Cliente / origem' : 'Favorecido'} value={form.descricao} onChange={set('descricao')} required />
          <Input label="Categoria" value={form.categoria} onChange={set('categoria')} placeholder={receber ? 'Ex.: Mensalidade de plano' : 'Ex.: Ocupação'} />
          <Input label="Centro de custo" value={form.centroCusto} onChange={set('centroCusto')} />
          <Input label="Vencimento" type="date" value={form.vencimento} onChange={set('vencimento')} />
          <Input label="Valor (R$)" type="number" min="0" step="0.01" value={form.valor} onChange={set('valor')} required />
          <Select label="Status" value={form.status} onChange={set('status')}
            options={receber ? ['Em aberto', 'Pago', 'Vencido', 'Negociado'] : ['Em aberto', 'Pago', 'Vencido', 'Negociado']} />
        </FieldRow>
      </form>
    </Modal>
  );
}
