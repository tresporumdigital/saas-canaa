import { useState } from 'react';
import { Modal, Button, Input, Select, FieldRow, Checkbox } from '../../components/index.js';
import { maskMoney, moneyToNumber } from '../../lib/masks.js';

const CATEGORIAS_RECEBER = [
  'Mensalidade de plano', 'Atendimento particular', 'Venda de equipamento',
  'Locação de equipamento', 'Serviço extra (não coberto)', 'Outras receitas',
];
const CATEGORIAS_PAGAR = [
  'Repasse — sepultamento', 'Repasse — cremação', 'Repasse — translado', 'Repasse — preparação',
  'Repasse — documentação', 'Ocupação', 'Pessoal', 'Tecnologia', 'Utilidades', 'Compra de urnas', 'Outras despesas',
];
const CENTROS_CUSTO = ['Planos', 'Atendimentos', 'Parceiros', 'Equipamentos', 'Estoque', 'Administrativo'];

// Pop-up para lançar uma nova conta a receber ou a pagar.
export default function NovaContaModal({ tipo, onClose, onCreate }) {
  const receber = tipo === 'receber';
  const categorias = receber ? CATEGORIAS_RECEBER : CATEGORIAS_PAGAR;
  const [form, setForm] = useState({
    descricao: '',
    categoria: categorias[0],
    centroCusto: receber ? 'Planos' : 'Administrativo',
    vencimento: '2026-09-10',
    valor: '',
    status: 'Em aberto',
    recorrente: false,
    recorrencias: '12',
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const pronto = form.descricao.trim() && moneyToNumber(form.valor) > 0;

  const submit = (e) => {
    e.preventDefault();
    if (!pronto) return;
    const seq = String(Date.now()).slice(-4);
    onCreate({
      id: `${receber ? 'AR' : 'AP'}-9${seq}`,
      origem: receber ? 'Lançamento manual' : 'Despesa avulsa',
      ref: null,
      [receber ? 'clienteNome' : 'favorecido']: form.descricao.trim(),
      categoria: form.categoria,
      centroCusto: form.centroCusto,
      vencimento: form.vencimento,
      valor: moneyToNumber(form.valor),
      status: form.status,
      recorrente: !receber && form.recorrente,
      recorrencias: !receber && form.recorrente ? Number(form.recorrencias) || 1 : null,
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
          <Select label="Categoria" value={form.categoria} onChange={set('categoria')} options={categorias} />
          <Select label="Centro de custo" value={form.centroCusto} onChange={set('centroCusto')} options={CENTROS_CUSTO} />
          <Input label="Vencimento" type="date" value={form.vencimento} onChange={set('vencimento')} />
          <Input label="Valor (R$)" value={form.valor} onChange={(e) => setForm((f) => ({ ...f, valor: maskMoney(e.target.value) }))} placeholder="R$ 0,00" required />
          <Select label="Status" value={form.status} onChange={set('status')} options={['Em aberto', 'Pago', 'Vencido', 'Negociado']} />
        </FieldRow>

        {!receber && (
          <div>
            <Checkbox
              label="Conta recorrente"
              checked={form.recorrente}
              onChange={(e) => setForm((f) => ({ ...f, recorrente: e.target.checked }))}
            />
            {form.recorrente && (
              <FieldRow>
                <Input
                  label="Quantas recorrências"
                  type="number" min="2" max="60"
                  value={form.recorrencias}
                  onChange={set('recorrencias')}
                />
              </FieldRow>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
}
