import { useState } from 'react';
import { Modal, Button, Input, Select, FieldRow, Checkbox } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { apiFetch } from '../../lib/api.js';
import { UF_LIST } from '../../lib/format.js';
import {
  maskCNPJ, maskPhone, isValidEmail, maskMoney, maskPercent, numberToMoneyInput, numberToPercentInput, moneyToNumber, percentToNumber,
} from '../../lib/masks.js';

const CATEGORIAS = [
  'Translado e transporte', 'Ornamentação e flores', 'Sepultamento e jazigos', 'Cremação',
  'Preparação e tanatopraxia', 'Buffet de velório', 'Documentação e cartório',
  'Fornecimento de urnas', 'Assistência 24h',
];
const TIPOS_DESCONTO = ['Valor fixo', 'Porcentagem (%)'];
const isPercentual = (tipo) => tipo === 'Percentual' || tipo === 'Comissão de venda';

// Pop-up de cadastro/edição de parceiro comercial.
export default function ParceiroFormModal({ parceiro, onClose, onSaved }) {
  const { toast } = useToast();
  const editing = Boolean(parceiro);
  const contato = parceiro?.contatos?.[0];
  const basePercentual = parceiro ? isPercentual(parceiro.acordo.tipo) : false;
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState(() => ({
    razaoSocial: parceiro?.razaoSocial || '',
    nomeFantasia: parceiro?.nomeFantasia || '',
    cnpj: parceiro ? maskCNPJ(parceiro.cnpj) : '',
    responsavel: parceiro?.responsavel || '',
    categoria: parceiro?.tipoParceria || CATEGORIAS[0],
    cidade: parceiro?.cidade || 'São Paulo',
    uf: parceiro?.uf || 'SP',
    tipoDesconto: parceiro?.acordo.tipo ? (basePercentual ? 'Porcentagem (%)' : 'Valor fixo') : '',
    valorDesconto: parceiro?.acordo.tipo ? (basePercentual ? numberToPercentInput(parceiro.acordo.valor * 100) : numberToMoneyInput(parceiro.acordo.valor)) : '',
    contatoNome: contato?.nome || '',
    contatoTelefone: contato ? maskPhone(contato.telefone) : '',
    contatoEmail: contato?.email || '',
    dadosBancarios: parceiro?.dadosBancarios || '',
    vigencia: parceiro?.acordo.vigencia || '',
    servicosCobertos: parceiro?.acordo.servicosCobertos || [],
  }));
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setMasked = (k, maskFn) => (e) => setForm((f) => ({ ...f, [k]: maskFn(e.target.value) }));
  const toggleServico = (servico) => setForm((f) => ({
    ...f,
    servicosCobertos: f.servicosCobertos.includes(servico)
      ? f.servicosCobertos.filter((s) => s !== servico)
      : [...f.servicosCobertos, servico],
  }));
  const emailValido = !form.contatoEmail || isValidEmail(form.contatoEmail);
  const percentual = form.tipoDesconto === 'Porcentagem (%)';

  const submit = async (e) => {
    e.preventDefault();
    if (!emailValido || salvando) return;
    setSalvando(true);
    try {
      const valorDesconto = form.tipoDesconto
        ? (percentual ? percentToNumber(form.valorDesconto) : moneyToNumber(form.valorDesconto))
        : undefined;
      const body = { ...form, cnpj: form.cnpj, valorDesconto };
      if (editing) {
        await apiFetch(`/parceiros/detail.php?id=${encodeURIComponent(parceiro.id)}`, { method: 'PUT', body });
        toast('Parceiro atualizado.');
      } else {
        await apiFetch('/parceiros/index.php', { method: 'POST', body });
        toast('Parceiro cadastrado.');
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
      title={editing ? `Editar ${parceiro?.nomeFantasia}` : 'Novo parceiro'}
      onClose={onClose}
      wide
      footer={(
        <>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="parceiro-form" loading={salvando}>
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

        <div>
          <div className="card-title">Acordo comercial</div>
          <FieldRow>
            <Input label="Vigência" value={form.vigencia} onChange={set('vigencia')} placeholder="Ex.: 12 meses, renovação automática" />
            <Input label="Dados bancários" value={form.dadosBancarios} onChange={set('dadosBancarios')} placeholder="Banco, agência, conta ou chave Pix" />
          </FieldRow>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>Serviços cobertos pelo acordo</p>
            <div className="row" style={{ flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              {CATEGORIAS.map((c) => (
                <Checkbox key={c} label={c} checked={form.servicosCobertos.includes(c)} onChange={() => toggleServico(c)} />
              ))}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
