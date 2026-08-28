import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/index.js';
import { Card, Button, Input, Select, FieldRow, Alert, Icon } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { clientes, clienteById } from '../../mock/index.js';
import { cpf as fmtCpf } from '../../lib/format.js';

export default function ClienteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const editing = Boolean(id);
  const base = editing ? clienteById(id) : null;

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
    navigate(editing ? `/clientes/${id}` : '/clientes');
  };

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Clientes', to: '/clientes' }, { label: editing ? `Editar ${base?.nome}` : 'Novo cliente' }]}
        title={editing ? 'Editar cliente' : 'Novo cliente'}
        subtitle="Cadastro do titular. Dependentes, planos e documentos são gerenciados na ficha após salvar."
      />

      <form onSubmit={submit}>
        {duplicado && (
          <Alert variant="warning" title="CPF já cadastrado">
            O CPF {fmtCpf(cpfDigits)} pertence a <strong>{duplicado.nome}</strong>.{' '}
            <a href={`#/clientes/${duplicado.id}`}>Abrir cadastro existente <Icon name="external" size={12} /></a>
          </Alert>
        )}

        <Card title="Dados pessoais">
          <FieldRow>
            <Input label="Nome completo" value={form.nome} onChange={set('nome')} required />
            <Input label="CPF" value={form.cpf} onChange={set('cpf')} required
              error={duplicado ? 'CPF já cadastrado — cadastro duplicado bloqueado.' : undefined} />
            <Input label="RG" value={form.rg} onChange={set('rg')} />
            <Input label="Data de nascimento" type="date" value={form.nascimento} onChange={set('nascimento')} />
            <Input label="Telefone" value={form.telefone} onChange={set('telefone')} required />
            <Input label="E-mail" type="email" value={form.email} onChange={set('email')} />
          </FieldRow>
        </Card>

        <Card title="Endereço" className="anim-fade-up">
          <FieldRow>
            <Input label="CEP" value={form.cep} onChange={set('cep')} />
            <Input label="Logradouro" value={form.logradouro} onChange={set('logradouro')} />
            <Input label="Número" value={form.numero} onChange={set('numero')} />
            <Input label="Bairro" value={form.bairro} onChange={set('bairro')} />
            <Input label="Cidade" value={form.cidade} onChange={set('cidade')} />
            <Select label="UF" value={form.uf} onChange={set('uf')} options={['SP', 'RJ', 'MG', 'PR', 'SC', 'RS', 'BA', 'GO']} />
          </FieldRow>
        </Card>

        <div className="row" style={{ justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
          <Button variant="secondary" type="button" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={Boolean(duplicado)}>{editing ? 'Salvar alterações' : 'Cadastrar cliente'}</Button>
        </div>
      </form>
    </>
  );
}
