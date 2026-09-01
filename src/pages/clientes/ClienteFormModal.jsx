import { useState } from 'react';
import { Modal, Button, Input, Select, FieldRow, Alert, Icon } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { clientes, clienteById } from '../../mock/index.js';
import { cpf as fmtCpf } from '../../lib/format.js';

// Pop-up de cadastro/edição de cliente — dados pessoais e endereço em uma única seção.
export default function ClienteFormModal({ clienteId, onClose }) {
  const { toast } = useToast();
  const editing = Boolean(clienteId);
  const base = editing ? clienteById(clienteId) : null;

  const [form, setForm] = useState(() => ({
    nome: base?.nome || '',
    cpf: base ? fmtCpf(base.cpf) : '',
    rg: base?.rg || '',
    nascimento: base?.nascimento || '',
    telefone: base?.telefone || '',
    email: base?.email || '',
    cep: base?.endereco.cep || '',
    logradouro: base?.endereco.logradouro || '',
    numero: base?.endereco.numero || '',
    bairro: base?.endereco.bairro || '',
    cidade: base?.endereco.cidade || 'São Paulo',
    uf: base?.endereco.uf || 'SP',
  }));

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const cpfDigits = form.cpf.replace(/\D/g, '');
  const duplicado = !editing && cpfDigits.length === 11 && clientes.find((c) => c.cpf === cpfDigits);

  const submit = (e) => {
    e.preventDefault();
    if (duplicado) return;
    toast(editing ? 'Cliente atualizado (simulação — sem persistência).' : 'Cliente cadastrado (simulação — sem persistência).');
    onClose();
  };

  return (
    <Modal
      title={editing ? `Editar ${base?.nome}` : 'Novo cliente'}
      onClose={onClose}
      wide
      footer={(
        <>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="cliente-form" disabled={Boolean(duplicado)}>
            {editing ? 'Salvar alterações' : 'Cadastrar cliente'}
          </Button>
        </>
      )}
    >
      <form id="cliente-form" onSubmit={submit} className="stack" style={{ gap: 'var(--space-5)' }}>
        {duplicado && (
          <Alert variant="warning" title="CPF já cadastrado">
            O CPF {fmtCpf(cpfDigits)} pertence a <strong>{duplicado.nome}</strong>.{' '}
            <a href={`#/clientes/${duplicado.id}`}>Abrir cadastro existente <Icon name="external" size={12} /></a>
          </Alert>
        )}

        <FieldRow>
          <Input label="Nome completo" value={form.nome} onChange={set('nome')} required />
          <Input label="CPF" value={form.cpf} onChange={set('cpf')} required
            error={duplicado ? 'CPF já cadastrado — cadastro duplicado bloqueado.' : undefined} />
          <Input label="RG" value={form.rg} onChange={set('rg')} />
          <Input label="Data de nascimento" type="date" value={form.nascimento} onChange={set('nascimento')} />
          <Input label="Telefone" value={form.telefone} onChange={set('telefone')} required />
          <Input label="E-mail" type="email" value={form.email} onChange={set('email')} />
          <Input label="CEP" value={form.cep} onChange={set('cep')} />
          <Input label="Logradouro" value={form.logradouro} onChange={set('logradouro')} />
          <Input label="Número" value={form.numero} onChange={set('numero')} />
          <Input label="Bairro" value={form.bairro} onChange={set('bairro')} />
          <Input label="Cidade" value={form.cidade} onChange={set('cidade')} />
          <Select label="UF" value={form.uf} onChange={set('uf')} options={['SP', 'RJ', 'MG', 'PR', 'SC', 'RS', 'BA', 'GO']} />
        </FieldRow>
      </form>
    </Modal>
  );
}
