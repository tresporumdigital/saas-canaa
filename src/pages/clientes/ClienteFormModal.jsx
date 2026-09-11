import { useState } from 'react';
import { Modal, Button, Input, FieldRow, EnderecoFields } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { clienteById } from '../../mock/index.js';
import { maskCPF, maskRG, maskPhone, isValidEmail } from '../../lib/masks.js';

// Pop-up de edição de um cliente já cadastrado — dados pessoais e endereço.
// Cadastro de cliente novo agora é feito em 3 etapas por NovoClienteWizard.jsx.
export default function ClienteFormModal({ clienteId, onClose }) {
  const { toast } = useToast();
  const base = clienteById(clienteId);

  const [form, setForm] = useState(() => ({
    nome: base?.nome || '',
    cpf: base ? maskCPF(base.cpf) : '',
    rg: base?.rg || '',
    nascimento: base?.nascimento || '',
    telefone: base ? maskPhone(base.telefone) : '',
    email: base?.email || '',
  }));
  const [endereco, setEndereco] = useState(() => ({
    cep: base?.endereco.cep || '',
    logradouro: base?.endereco.logradouro || '',
    numero: base?.endereco.numero || '',
    bairro: base?.endereco.bairro || '',
    cidade: base?.endereco.cidade || '',
    uf: base?.endereco.uf || '',
  }));

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setMasked = (k, maskFn) => (e) => setForm((f) => ({ ...f, [k]: maskFn(e.target.value) }));
  const emailValido = !form.email || isValidEmail(form.email);

  const submit = (e) => {
    e.preventDefault();
    if (!emailValido) return;
    toast('Cliente atualizado (simulação — sem persistência).');
    onClose();
  };

  return (
    <Modal
      title={`Editar ${base?.nome}`}
      onClose={onClose}
      wide
      footer={(
        <>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="cliente-form">Salvar alterações</Button>
        </>
      )}
    >
      <form id="cliente-form" onSubmit={submit} className="stack" style={{ gap: 'var(--space-5)' }}>
        <FieldRow>
          <Input label="Nome completo" value={form.nome} onChange={set('nome')} required />
          <Input label="CPF" value={form.cpf} onChange={setMasked('cpf', maskCPF)} placeholder="000.000.000-00" required />
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
