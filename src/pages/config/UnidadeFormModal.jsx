import { useRef, useState } from 'react';
import { Modal, Button, Input, Select, Checkbox, FieldRow, EnderecoFields, Avatar } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { apiFetch } from '../../lib/api.js';
import { maskCNPJ, maskPhone, isValidEmail } from '../../lib/masks.js';

const TIPOS = ['Matriz', 'Filial', 'Escritório'];

const vazia = {
  nome: '', tipo: 'Filial', cnpj: '', status: 'Ativa', responsavel: '', telefone: '', email: '',
  horario: '24 horas', alvara: '', salasVelorio: '0', capela: false,
};
const enderecoVazio = { cep: '', logradouro: '', numero: '', bairro: '', cidade: '', uf: '' };

// Pop-up de cadastro/edição de uma unidade da empresa.
export default function UnidadeFormModal({ unidade, onClose, onSaved }) {
  const { toast } = useToast();
  const editando = Boolean(unidade);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState(() => (
    editando ? {
      nome: unidade.nome,
      tipo: unidade.tipo,
      cnpj: maskCNPJ(unidade.cnpj),
      status: unidade.status,
      responsavel: unidade.responsavel,
      telefone: maskPhone(unidade.telefone),
      email: unidade.email,
      horario: unidade.horario,
      alvara: unidade.alvara,
      salasVelorio: String(unidade.salasVelorio),
      capela: unidade.capela,
    } : { ...vazia }
  ));
  const [endereco, setEndereco] = useState(() => (
    editando ? { ...unidade.endereco } : { ...enderecoVazio }
  ));
  const [foto, setFoto] = useState(editando ? (unidade.foto || null) : null);
  const fileInputRef = useRef(null);
  const onFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFoto(URL.createObjectURL(file));
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setMasked = (k, maskFn) => (e) => setForm((f) => ({ ...f, [k]: maskFn(e.target.value) }));
  const emailValido = !form.email || isValidEmail(form.email);

  const submit = async (e) => {
    e.preventDefault();
    if (!emailValido || salvando) return;
    setSalvando(true);
    try {
      const body = { ...form, nome: form.nome.trim(), endereco, foto };
      if (editando) {
        await apiFetch(`/unidades/detail.php?id=${encodeURIComponent(unidade.id)}`, { method: 'PUT', body });
        toast(`Unidade ${form.nome} atualizada.`);
      } else {
        await apiFetch('/unidades/index.php', { method: 'POST', body });
        toast(`Unidade ${form.nome} cadastrada.`);
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
      title={editando ? `Editar ${unidade.nome}` : 'Nova unidade'}
      onClose={onClose}
      wide
      footer={(
        <>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="unidade-form" loading={salvando}>
            {editando ? 'Salvar alterações' : 'Cadastrar unidade'}
          </Button>
        </>
      )}
    >
      <form id="unidade-form" onSubmit={submit} className="stack" style={{ gap: 'var(--space-5)' }}>
        <div>
          <div className="card-title">Foto da unidade</div>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFotoChange} />
          <div className="row" style={{ gap: 'var(--space-3)', alignItems: 'center' }}>
            <Avatar name={form.nome || 'Unidade'} src={foto} size="lg" />
            <Button variant="secondary" type="button" onClick={() => fileInputRef.current?.click()}>
              {foto ? 'Trocar foto' : 'Selecionar foto'}
            </Button>
          </div>
        </div>

        <FieldRow>
          <Input label="Nome da unidade" value={form.nome} onChange={set('nome')} required />
          <Select label="Tipo" value={form.tipo} onChange={set('tipo')} options={TIPOS} />
          <Input label="CNPJ" value={form.cnpj} onChange={setMasked('cnpj', maskCNPJ)} placeholder="00.000.000/0000-00" required />
          <Select label="Status" value={form.status} onChange={set('status')} options={['Ativa', 'Inativa']} />
          <Input label="Responsável" value={form.responsavel} onChange={set('responsavel')} />
          <Input label="Telefone" value={form.telefone} onChange={setMasked('telefone', maskPhone)} placeholder="(00) 00000-0000" />
          <Input label="E-mail" type="email" value={form.email} onChange={set('email')}
            error={!emailValido ? 'E-mail em formato inválido.' : undefined} />
          <Input label="Horário de funcionamento" value={form.horario} onChange={set('horario')} />
          <Input label="Alvará de funcionamento" value={form.alvara} onChange={set('alvara')} />
          <Input label="Salas de velório" type="number" min="0" value={form.salasVelorio} onChange={set('salasVelorio')} />
        </FieldRow>
        <Checkbox label="Possui capela" checked={form.capela} onChange={(e) => setForm((f) => ({ ...f, capela: e.target.checked }))} />

        <EnderecoFields value={endereco} onChange={setEndereco} />
      </form>
    </Modal>
  );
}
