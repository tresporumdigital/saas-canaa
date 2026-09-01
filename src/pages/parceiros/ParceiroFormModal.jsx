import { useState } from 'react';
import { Modal, Button, Input, Select, FieldRow } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { parceiroById } from '../../mock/parceiros.js';
import { money, percent, cnpj as fmtCnpj } from '../../lib/format.js';

const TIPOS_PARCERIA = [
  'Translado e transporte', 'Ornamentação e flores', 'Sepultamento e jazigos', 'Cremação',
  'Preparação e tanatopraxia', 'Buffet de velório', 'Documentação e cartório',
  'Fornecimento de urnas', 'Assistência 24h',
];

const isPercentual = (tipo) => tipo === 'Percentual' || tipo === 'Comissão de venda';

// Pop-up de cadastro/edição de parceiro comercial.
export default function ParceiroFormModal({ parceiroId, onClose }) {
  const { toast } = useToast();
  const editing = Boolean(parceiroId);
  const base = editing ? parceiroById(parceiroId) : null;
  const contato = base?.contatos?.[0];

  const [form, setForm] = useState(() => ({
    razaoSocial: base?.razaoSocial || '',
    nomeFantasia: base?.nomeFantasia || '',
    cnpj: base ? fmtCnpj(base.cnpj) : '',
    tipoParceria: base?.tipoParceria || TIPOS_PARCERIA[0],
    cidade: base?.cidade || 'São Paulo',
    uf: base?.uf || 'SP',
    dadosBancarios: base?.dadosBancarios || '',
    tipoRemuneracao: base?.acordo.tipo || 'Fixo por atendimento',
    valorRemuneracao: base ? (isPercentual(base.acordo.tipo) ? percent(base.acordo.valor) : money(base.acordo.valor)) : '',
    contatoNome: contato?.nome || '',
    contatoTelefone: contato?.telefone || '',
    contatoEmail: contato?.email || '',
  }));
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    toast(editing ? 'Parceiro atualizado (simulação — sem persistência).' : 'Parceiro cadastrado (simulação — sem persistência).');
    onClose();
  };

  return (
    <Modal
      title={editing ? `Editar ${base?.nomeFantasia}` : 'Novo parceiro'}
      onClose={onClose}
      wide
      footer={(
        <>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="parceiro-form">
            {editing ? 'Salvar alterações' : 'Cadastrar parceiro'}
          </Button>
        </>
      )}
    >
      <form id="parceiro-form" onSubmit={submit} className="stack" style={{ gap: 'var(--space-5)' }}>
        <FieldRow>
          <Input label="Razão social" value={form.razaoSocial} onChange={set('razaoSocial')} required />
          <Input label="Nome fantasia" value={form.nomeFantasia} onChange={set('nomeFantasia')} required />
          <Input label="CNPJ" value={form.cnpj} onChange={set('cnpj')} required />
          <Select label="Tipo de parceria" value={form.tipoParceria} onChange={set('tipoParceria')} options={TIPOS_PARCERIA} />
          <Input label="Cidade" value={form.cidade} onChange={set('cidade')} />
          <Select label="UF" value={form.uf} onChange={set('uf')} options={['SP', 'RJ', 'MG', 'PR', 'SC', 'RS', 'BA', 'GO']} />
          <Select label="Tipo de remuneração" value={form.tipoRemuneracao} onChange={set('tipoRemuneracao')}
            options={['Fixo por atendimento', 'Percentual', 'Comissão de venda']} />
          <Input label="Valor / percentual" value={form.valorRemuneracao} onChange={set('valorRemuneracao')} placeholder="Ex.: 480,00 ou 15%" />
          <Input label="Dados bancários" value={form.dadosBancarios} onChange={set('dadosBancarios')} placeholder="Banco · Agência · Conta" />
          <Input label="Contato — nome" value={form.contatoNome} onChange={set('contatoNome')} required />
          <Input label="Contato — telefone" value={form.contatoTelefone} onChange={set('contatoTelefone')} />
          <Input label="Contato — e-mail" type="email" value={form.contatoEmail} onChange={set('contatoEmail')} />
        </FieldRow>
      </form>
    </Modal>
  );
}
