import { useState } from 'react';
import { Modal, Button, Input, Select, FieldRow, EnderecoFields } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { maskCNPJ, maskPhone, isValidEmail } from '../../lib/masks.js';

const REGIMES = ['Simples Nacional', 'Lucro Presumido', 'Lucro Real'];

// Pop-up de edição dos dados cadastrais da empresa (matriz).
export default function EmpresaFormModal({ empresa, onClose }) {
  const { toast } = useToast();
  const [form, setForm] = useState(() => ({
    razaoSocial: empresa.razaoSocial,
    nomeFantasia: empresa.nomeFantasia,
    cnpj: maskCNPJ(empresa.cnpj),
    inscricaoEstadual: empresa.inscricaoEstadual,
    inscricaoMunicipal: empresa.inscricaoMunicipal,
    regimeTributario: empresa.regimeTributario,
    cnae: empresa.cnae,
    telefone: maskPhone(empresa.telefone),
    email: empresa.email,
    site: empresa.site,
    responsavelLegal: empresa.responsavelLegal,
    contador: empresa.contador,
    complemento: empresa.endereco.complemento || '',
  }));
  const [endereco, setEndereco] = useState(() => ({
    cep: empresa.endereco.cep,
    logradouro: empresa.endereco.logradouro,
    numero: empresa.endereco.numero,
    bairro: empresa.endereco.bairro,
    cidade: empresa.endereco.cidade,
    uf: empresa.endereco.uf,
  }));
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setMasked = (k, maskFn) => (e) => setForm((f) => ({ ...f, [k]: maskFn(e.target.value) }));
  const emailValido = !form.email || isValidEmail(form.email);

  const submit = (e) => {
    e.preventDefault();
    if (!emailValido) return;
    toast('Dados da empresa atualizados (simulação — sem persistência).');
    onClose();
  };

  return (
    <Modal
      title="Editar dados da empresa"
      onClose={onClose}
      wide
      footer={(
        <>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="empresa-form">Salvar alterações</Button>
        </>
      )}
    >
      <form id="empresa-form" onSubmit={submit} className="stack" style={{ gap: 'var(--space-5)' }}>
        <FieldRow>
          <Input label="Razão social" value={form.razaoSocial} onChange={set('razaoSocial')} required />
          <Input label="Nome fantasia" value={form.nomeFantasia} onChange={set('nomeFantasia')} required />
          <Input label="CNPJ" value={form.cnpj} onChange={setMasked('cnpj', maskCNPJ)} placeholder="00.000.000/0000-00" required />
          <Input label="Inscrição estadual" value={form.inscricaoEstadual} onChange={set('inscricaoEstadual')} />
          <Input label="Inscrição municipal" value={form.inscricaoMunicipal} onChange={set('inscricaoMunicipal')} />
          <Select label="Regime tributário" value={form.regimeTributario} onChange={set('regimeTributario')} options={REGIMES} />
          <Input label="CNAE principal" value={form.cnae} onChange={set('cnae')} />
          <Input label="Telefone" value={form.telefone} onChange={setMasked('telefone', maskPhone)} placeholder="(00) 00000-0000" />
          <Input label="E-mail" type="email" value={form.email} onChange={set('email')}
            error={!emailValido ? 'E-mail em formato inválido.' : undefined} />
          <Input label="Site" value={form.site} onChange={set('site')} />
          <Input label="Responsável legal" value={form.responsavelLegal} onChange={set('responsavelLegal')} />
          <Input label="Contabilidade" value={form.contador} onChange={set('contador')} />
        </FieldRow>

        <EnderecoFields value={endereco} onChange={setEndereco} />
        <FieldRow>
          <Input label="Complemento" value={form.complemento} onChange={set('complemento')} />
        </FieldRow>
      </form>
    </Modal>
  );
}
