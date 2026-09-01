import { useState } from 'react';
import { Modal, Button, Input, Select, Checkbox, FieldRow } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';

const UF = ['SP', 'RJ', 'MG', 'PR', 'SC', 'RS', 'BA', 'GO', 'ES', 'DF'];
const TIPOS = ['Matriz', 'Filial', 'Escritório'];

const vazia = {
  nome: '', tipo: 'Filial', cnpj: '', status: 'Ativa', responsavel: '', telefone: '', email: '',
  horario: '24 horas', alvara: '', salasVelorio: '0', capela: false,
  cep: '', logradouro: '', numero: '', bairro: '', cidade: 'São Paulo', uf: 'SP',
};

// Pop-up de cadastro/edição de uma unidade da empresa.
export default function UnidadeFormModal({ unidade, onClose, onCreate }) {
  const { toast } = useToast();
  const editando = Boolean(unidade);
  const [form, setForm] = useState(() => (
    editando ? {
      nome: unidade.nome,
      tipo: unidade.tipo,
      cnpj: unidade.cnpj,
      status: unidade.status,
      responsavel: unidade.responsavel,
      telefone: unidade.telefone,
      email: unidade.email,
      horario: unidade.horario,
      alvara: unidade.alvara,
      salasVelorio: String(unidade.salasVelorio),
      capela: unidade.capela,
      cep: unidade.endereco.cep,
      logradouro: unidade.endereco.logradouro,
      numero: unidade.endereco.numero,
      bairro: unidade.endereco.bairro,
      cidade: unidade.endereco.cidade,
      uf: unidade.endereco.uf,
    } : { ...vazia }
  ));
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
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
        cidade: form.cidade,
        uf: form.uf,
        horario: form.horario,
        alvara: form.alvara || '—',
        salasVelorio: Number(form.salasVelorio) || 0,
        capela: form.capela,
        endereco: {
          logradouro: form.logradouro, numero: form.numero, bairro: form.bairro,
          cidade: form.cidade, uf: form.uf, cep: form.cep,
        },
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
          <Input label="CNPJ" value={form.cnpj} onChange={set('cnpj')} required />
          <Select label="Status" value={form.status} onChange={set('status')} options={['Ativa', 'Inativa']} />
          <Input label="Responsável" value={form.responsavel} onChange={set('responsavel')} />
          <Input label="Telefone" value={form.telefone} onChange={set('telefone')} />
          <Input label="E-mail" type="email" value={form.email} onChange={set('email')} />
          <Input label="Horário de funcionamento" value={form.horario} onChange={set('horario')} />
          <Input label="Alvará de funcionamento" value={form.alvara} onChange={set('alvara')} />
          <Input label="Salas de velório" type="number" min="0" value={form.salasVelorio} onChange={set('salasVelorio')} />
        </FieldRow>
        <Checkbox label="Possui capela" checked={form.capela} onChange={(e) => setForm((f) => ({ ...f, capela: e.target.checked }))} />

        <div>
          <div className="card-title">Endereço</div>
          <FieldRow>
            <Input label="CEP" value={form.cep} onChange={set('cep')} />
            <Input label="Logradouro" value={form.logradouro} onChange={set('logradouro')} />
            <Input label="Número" value={form.numero} onChange={set('numero')} />
            <Input label="Bairro" value={form.bairro} onChange={set('bairro')} />
            <Input label="Cidade" value={form.cidade} onChange={set('cidade')} />
            <Select label="UF" value={form.uf} onChange={set('uf')} options={UF} />
          </FieldRow>
        </div>
      </form>
    </Modal>
  );
}
