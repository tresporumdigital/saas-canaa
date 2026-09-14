import { useState } from 'react';
import { Modal, Button, Input, Select, FieldRow, Checkbox } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { apiFetch } from '../../lib/api.js';
import { isValidEmail } from '../../lib/masks.js';

const PERFIS = ['Administrador', 'Atendente', 'Financeiro', 'Operacional'];

// Pop-up de cadastro/edição de usuário do sistema. Na edição, a senha só é alterada
// se um novo valor for digitado (campo opcional).
export default function UsuarioFormModal({ usuario, onClose, onSaved }) {
  const { toast } = useToast();
  const editando = Boolean(usuario);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState(() => (editando ? {
    nome: usuario.nome, email: usuario.email, senha: '', perfil: usuario.perfil, doisFatores: usuario.doisFatores,
  } : { nome: '', email: '', senha: '', perfil: PERFIS[1], doisFatores: false }));

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const emailValido = form.email.trim() && isValidEmail(form.email);
  const senhaValida = editando ? (!form.senha || form.senha.length >= 6) : form.senha.length >= 6;
  const pronto = form.nome.trim() && emailValido && senhaValida;

  const submit = async (e) => {
    e.preventDefault();
    if (!pronto || salvando) return;
    setSalvando(true);
    try {
      if (editando) {
        await apiFetch(`/usuarios/detail.php?id=${encodeURIComponent(usuario.id)}`, {
          method: 'PUT',
          body: { nome: form.nome.trim(), perfil: form.perfil, doisFatores: form.doisFatores, senha: form.senha || undefined },
        });
        toast(`Usuário ${form.nome} atualizado.`);
      } else {
        await apiFetch('/usuarios/index.php', {
          method: 'POST',
          body: { nome: form.nome.trim(), email: form.email.trim(), senha: form.senha, perfil: form.perfil, doisFatores: form.doisFatores },
        });
        toast(`Usuário ${form.nome} cadastrado.`);
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
      title={editando ? `Editar ${usuario.nome}` : 'Novo usuário'}
      onClose={onClose}
      wide
      footer={(
        <>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="usuario-form" disabled={!pronto} loading={salvando}>
            {editando ? 'Salvar alterações' : 'Cadastrar usuário'}
          </Button>
        </>
      )}
    >
      <form id="usuario-form" onSubmit={submit} className="stack" style={{ gap: 'var(--space-4)' }}>
        <FieldRow>
          <Input label="Nome completo" value={form.nome} onChange={set('nome')} required />
          <Input label="E-mail" type="email" value={form.email} onChange={set('email')} disabled={editando}
            error={form.email && !emailValido ? 'E-mail em formato inválido.' : undefined} />
          <Select label="Perfil" value={form.perfil} onChange={set('perfil')} options={PERFIS} />
          <Input
            label={editando ? 'Nova senha (opcional)' : 'Senha'}
            type="password"
            value={form.senha}
            onChange={set('senha')}
            placeholder={editando ? 'Deixe em branco para manter a atual' : 'Mínimo 6 caracteres'}
            error={form.senha && !senhaValida ? 'Mínimo de 6 caracteres.' : undefined}
            required={!editando}
          />
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
