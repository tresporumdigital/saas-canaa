import { useState } from 'react';
import { Modal, Button, Input, Select, FieldRow } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { parceiroById } from '../../mock/parceiros.js';
import { UF_LIST } from '../../lib/format.js';
import {
  maskCNPJ, maskPhone, isValidEmail, maskMoney, maskPercent, numberToMoneyInput, numberToPercentInput,
} from '../../lib/masks.js';

const CATEGORIAS = [
  'Translado e transporte', 'Ornamentação e flores', 'Sepultamento e jazigos', 'Cremação',
  'Preparação e tanatopraxia', 'Buffet de velório', 'Documentação e cartório',
  'Fornecimento de urnas', 'Assistência 24h',
];
const TIPOS_DESCONTO = ['Valor fixo', 'Porcentagem (%)'];
const isPercentual = (tipo) => tipo === 'Percentual' || tipo === 'Comissão de venda';

// Pop-up de cadastro/edição de parceiro comercial.
export default function ParceiroFormModal({ parceiroId, onClose }) {
  const { toast } = useToast();
  const editing = Boolean(parceiroId);
  const base = editing ? parceiroById(parceiroId) : null;
  const contato = base?.contatos?.[0];
  const basePercentual = base ? isPercentual(base.acordo.tipo) : false;

  const [form, setForm] = useState(() => ({
    razaoSocial: base?.razaoSocial || '',
    nomeFantasia: base?.nomeFantasia || '',
    cnpj: base ? maskCNPJ(base.cnpj) : '',
    responsavel: base?.responsavel || '',
    categoria: base?.tipoParceria || CATEGORIAS[0],
    cidade: base?.cidade || 'São Paulo',
    uf: base?.uf || 'SP',
    tipoDesconto: base ? (basePercentual ? 'Porcentagem (%)' : 'Valor fixo') : '',
    valorDesconto: base ? (basePercentual ? numberToPercentInput(base.acordo.valor * 100) : numberToMoneyInput(base.acordo.valor)) : '',
    contatoNome: contato?.nome || '',
    contatoTelefone: contato ? maskPhone(contato.telefone) : '',
    contatoEmail: contato?.email || '',
  }));
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setMasked = (k, maskFn) => (e) => setForm((f) => ({ ...f, [k]: maskFn(e.target.value) }));
  const emailValido = !form.contatoEmail || isValidEmail(form.contatoEmail);
  const percentual = form.tipoDesconto === 'Porcentagem (%)';

  const submit = (e) => {
    e.preventDefault();
    if (!emailValido) return;
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
          <Input label="CNPJ" value={form.cnpj} onChange={setMasked('cnpj', maskCNPJ)} placeholder="00.000.000/0000-00" required />
          <Input label="Responsável" value={form.responsavel} onChange={set('responsavel')} />
          <Select label="Categoria" value={form.categoria} onChange={set('categoria')} options={CATEGORIAS} />
          <Input label="Cidade" value={form.cidade} onChange={set('cidade')} />
          <Select label="UF" value={form.uf} onChange={set('uf')} options={UF_LIST} />
          <Select label="Desconto fixado" value={form.tipoDesconto} onChange={(e) => setForm((f) => ({ ...f, tipoDesconto: e.target.value, valorDesconto: '' }))}>
            <option value="">Selecione…</option>
            {TIPOS_DESCONTO.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          {form.tipoDesconto && (
            <Input
              label="Valor"
              value={form.valorDesconto}
              onChange={setMasked('valorDesconto', percentual ? maskPercent : maskMoney)}
              placeholder={percentual ? '0,00%' : 'R$ 0,00'}
            />
          )}
        </FieldRow>

        <div>
          <div className="card-title">Contato</div>
          <FieldRow>
            <Input label="Nome" value={form.contatoNome} onChange={set('contatoNome')} required />
            <Input label="Telefone" value={form.contatoTelefone} onChange={setMasked('contatoTelefone', maskPhone)} placeholder="(00) 00000-0000" />
            <Input label="E-mail" type="email" value={form.contatoEmail} onChange={set('contatoEmail')}
              error={!emailValido ? 'E-mail em formato inválido.' : undefined} />
          </FieldRow>
        </div>
      </form>
    </Modal>
  );
}
