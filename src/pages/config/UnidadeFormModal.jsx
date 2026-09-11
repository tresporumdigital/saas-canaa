import { useState } from 'react';
import { Modal, Button, Input, Select, Checkbox, FieldRow, EnderecoFields } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { maskCNPJ, maskPhone, isValidEmail } from '../../lib/masks.js';

const TIPOS = ['Matriz', 'Filial', 'Escritório'];

const vazia = {
  nome: '', tipo: 'Filial', cnpj: '', status: 'Ativa', responsavel: '', telefone: '', email: '',
  horario: '24 horas', alvara: '', salasVelorio: '0', capela: false,
};
const enderecoVazio = { cep: '', logradouro: '', numero: '', bairro: '', cidade: '', uf: '' };

// Pop-up de cadastro/edição de uma unidade da empresa.
export default function UnidadeFormModal({ unidade, onClose, onCreate }) {
  const { toast } = useToast();
  const editando = Boolean(unidade);
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
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setMasked = (k, maskFn) => (e) => setForm((f) => ({ ...f, [k]: maskFn(e.target.value) }));
  const emailValido = !form.email || isValidEmail(form.email);

  const submit = (e) => {
    e.preventDefault();
    if (!emailValido) return;
    if (editando) {
      toast(`Unidade ${form.nome} atualizada (simulação — sem persistência).`);
    } else {
      onCreate?.({
        id: `UNI-9${String(Date.now()).slice(-3)}`,
        nome: form.nome.trim(),
        tipo: form.tipo,
        cnpj: form.cnpj,
        status: form.status,
        responsavel: form.responsavel || 'A definir',
        telefone: form.telefone,
        email: form.email,
        cidade: endereco.cidade,
        uf: endereco.uf,
        horario: form.horario,
        alvara: form.alvara || '—',
        salasVelorio: Number(form.salasVelorio) || 0,
        capela: form.capela,
        endereco: { ...endereco },
      });
      toast(`Unidade ${form.nome} cadastrada (simulação — sem persistência).`);
    }
    onClose();
  };

  return (
    <Modal
      title={editando ? `Editar ${unidade.nome}` : 'Nova unidade'}
      onClose={onClose}
      wide
      footer={(
        <>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="unidade-form">
            {editando ? 'Salvar alterações' : 'Cadastrar unidade'}
          </Button>
        </>
      )}
    >
      <form id="unidade-form" onSubmit={submit} className="stack" style={{ gap: 'var(--space-5)' }}>
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
