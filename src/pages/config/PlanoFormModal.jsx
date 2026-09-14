import { useState } from 'react';
import { Modal, Button, Input, FieldRow } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { apiFetch } from '../../lib/api.js';
import { maskMoney, moneyToNumber, numberToMoneyInput } from '../../lib/masks.js';

const vazio = { nome: '', valorMensal: '', carenciaDias: '90', limiteDependentes: '4', reajuste: 'IPCA anual', coberturas: '' };

// Pop-up de cadastro/edição de um plano (produto) oferecido nas unidades.
export default function PlanoFormModal({ plano, onClose, onSaved }) {
  const editando = Boolean(plano);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState(() => (
    editando ? {
      nome: plano.nome,
      valorMensal: numberToMoneyInput(plano.valorMensal),
      carenciaDias: String(plano.carenciaDias),
      limiteDependentes: String(plano.limiteDependentes),
      reajuste: plano.reajuste,
      coberturas: (plano.coberturas || []).join(', '),
    } : { ...vazio }
  ));
  const { toast } = useToast();
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const pronto = form.nome.trim() && moneyToNumber(form.valorMensal) > 0;

  const submit = async (e) => {
    e.preventDefault();
    if (!pronto || salvando) return;
    setSalvando(true);
    const dados = {
      nome: form.nome.trim(),
      valorMensal: moneyToNumber(form.valorMensal),
      carenciaDias: Number(form.carenciaDias) || 0,
      limiteDependentes: Number(form.limiteDependentes) || 0,
      reajuste: form.reajuste,
      coberturas: form.coberturas.split(',').map((c) => c.trim()).filter(Boolean),
    };
    try {
      if (editando) {
        await apiFetch(`/planos/detail.php?id=${encodeURIComponent(plano.id)}`, { method: 'PUT', body: dados });
        toast(`Plano ${dados.nome} atualizado.`);
      } else {
        await apiFetch('/planos/index.php', { method: 'POST', body: dados });
        toast(`Plano ${dados.nome} cadastrado.`);
      }
      onSaved?.();
    } catch (err) {
      toast(err.message, { kind: 'danger' });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      title={editando ? `Editar ${plano.nome}` : 'Novo plano'}
      onClose={onClose}
      wide
      footer={(
        <>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="plano-form" disabled={!pronto} loading={salvando}>
            {editando ? 'Salvar alterações' : 'Cadastrar plano'}
          </Button>
        </>
      )}
    >
      <form id="plano-form" onSubmit={submit} className="stack" style={{ gap: 'var(--space-4)' }}>
        <FieldRow>
          <Input label="Nome do plano" value={form.nome} onChange={set('nome')} required />
          <Input label="Valor mensal (R$)" value={form.valorMensal} onChange={(e) => setForm((f) => ({ ...f, valorMensal: maskMoney(e.target.value) }))} placeholder="R$ 0,00" required />
          <Input label="Carência (dias)" type="number" min="0" value={form.carenciaDias} onChange={set('carenciaDias')} />
          <Input label="Limite de dependentes" type="number" min="0" value={form.limiteDependentes} onChange={set('limiteDependentes')} />
          <Input label="Reajuste" value={form.reajuste} onChange={set('reajuste')} placeholder="Ex.: IPCA anual" />
        </FieldRow>
        <Input label="Coberturas (separadas por vírgula)" value={form.coberturas} onChange={set('coberturas')} placeholder="Urna padrão, Preparação do corpo, Velório 12h…" />
      </form>
    </Modal>
  );
}
