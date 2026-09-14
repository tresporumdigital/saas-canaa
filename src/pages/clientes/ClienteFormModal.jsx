import { useState } from 'react';
import { Modal, Button, Input, FieldRow, EnderecoFields } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { apiFetch } from '../../lib/api.js';
import { maskCPF, maskRG, maskPhone, isValidEmail } from '../../lib/masks.js';

// Pop-up de edição de um cliente já cadastrado — dados pessoais e endereço.
// Cadastro de cliente novo agora é feito em 3 etapas por NovoClienteWizard.jsx.
export default function ClienteFormModal({ cliente, onClose, onSaved }) {
  const { toast } = useToast();
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState(() => ({
    nome: cliente?.nome || '',
    cpf: cliente ? maskCPF(cliente.cpf) : '',
    rg: cliente?.rg || '',
    nascimento: cliente?.nascimento || '',
    telefone: cliente ? maskPhone(cliente.telefone) : '',
    email: cliente?.email || '',
  }));
  const [endereco, setEndereco] = useState(() => ({
    cep: cliente?.endereco.cep || '',
    logradouro: cliente?.endereco.logradouro || '',
    numero: cliente?.endereco.numero || '',
    bairro: cliente?.endereco.bairro || '',
    cidade: cliente?.endereco.cidade || '',
    uf: cliente?.endereco.uf || '',
  }));

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setMasked = (k, maskFn) => (e) => setForm((f) => ({ ...f, [k]: maskFn(e.target.value) }));
  const emailValido = !form.email || isValidEmail(form.email);

  const submit = async (e) => {
    e.preventDefault();
    if (!emailValido || salvando) return;
    setSalvando(true);
    try {
      await apiFetch(`/clientes/detail.php?id=${encodeURIComponent(cliente.id)}`, {
        method: 'PUT',
        body: { ...form, endereco },
      });
      toast('Cliente atualizado.');
      onSaved?.();
    } catch (err) {
      toast(err.message, { kind: 'danger' });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      title={`Editar ${cliente?.nome}`}
      onClose={onClose}
      wide
      footer={(
        <>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="cliente-form" loading={salvando}>Salvar alterações</Button>
        </>
      )}
    >
      <form id="cliente-form" onSubmit={submit} className="stack" style={{ gap: 'var(--space-5)' }}>
        <FieldRow>
          <Input label="Nome completo" value={form.nome} onChange={set('nome')} required />
          <Input label="CPF" value={form.cpf} onChange={setMasked('cpf', maskCPF)} placeholder="000.000.000-00" required disabled />
          <Input label="RG" value={form.rg} onChange={setMasked('rg', maskRG)} placeholder="00.000.000-0" />
          <Input label="Data de nascimento" type="date" value={form.nascimento} onChange={set('nascimento')} />
          <Input label="Telefone" value={form.telefone} onChange={setMasked('telefone', maskPhone)} placeholder="(00) 00000-0000" required />
          <Input label="E-mail" type="email" value={form.email} onChange={set('email')}
            error={!emailValido ? 'E-mail em formato inválido.' : undefined} />
        </FieldRow>

        <EnderecoFields value={endereco} onChange={setEndereco} />
      </form>
    </Modal>
  );
}
