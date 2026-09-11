import { useState } from 'react';
import { Modal, Button, Input, Select, FieldRow, Checkbox } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { isValidEmail } from '../../lib/masks.js';

const PERFIS = ['Administrador', 'Atendente', 'Financeiro', 'Operacional'];

// Pop-up de cadastro de novo usuário do sistema.
export default function UsuarioFormModal({ onClose, onCreate }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ nome: '', email: '', perfil: PERFIS[1], doisFatores: false });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const emailValido = form.email.trim() && isValidEmail(form.email);
  const pronto = form.nome.trim() && emailValido;

  const submit = (e) => {
    e.preventDefault();
    if (!pronto) return;
    onCreate({
      id: `USR-9${String(Date.now()).slice(-3)}`,
      nome: form.nome.trim(),
      email: form.email.trim(),
      perfil: form.perfil,
      status: 'Ativo',
      ultimoAcesso: null,
      doisFatores: form.doisFatores,
    });
    toast(`Usuário ${form.nome} cadastrado (simulação — sem persistência).`);
    onClose();
  };

  return (
    <Modal
      title="Novo usuário"
      onClose={onClose}
      wide
      footer={(
        <>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="usuario-form" disabled={!pronto}>Cadastrar usuário</Button>
        </>
      )}
    >
      <form id="usuario-form" onSubmit={submit} className="stack" style={{ gap: 'var(--space-4)' }}>
        <FieldRow>
          <Input label="Nome completo" value={form.nome} onChange={set('nome')} required />
          <Input label="E-mail" type="email" value={form.email} onChange={set('email')}
            error={form.email && !emailValido ? 'E-mail em formato inválido.' : undefined} />
          <Select label="Perfil" value={form.perfil} onChange={set('perfil')} options={PERFIS} />
        </FieldRow>
        <Checkbox
          label="Exigir autenticação em duas etapas (2FA)"
          checked={form.doisFatores}
          onChange={(e) => setForm((f) => ({ ...f, doisFatores: e.target.checked }))}
        />
      </form>
    </Modal>
  );
}
