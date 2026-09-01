import { useState } from 'react';
import { Modal, Button, Input, Select, FieldRow } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';

const UF = ['SP', 'RJ', 'MG', 'PR', 'SC', 'RS', 'BA', 'GO', 'ES', 'DF'];
const REGIMES = ['Simples Nacional', 'Lucro Presumido', 'Lucro Real'];

// Pop-up de edição dos dados cadastrais da empresa (matriz).
export default function EmpresaFormModal({ empresa, onClose }) {
  const { toast } = useToast();
  const [form, setForm] = useState(() => ({
    razaoSocial: empresa.razaoSocial,
    nomeFantasia: empresa.nomeFantasia,
    cnpj: empresa.cnpj,
    inscricaoEstadual: empresa.inscricaoEstadual,
    inscricaoMunicipal: empresa.inscricaoMunicipal,
    regimeTributario: empresa.regimeTributario,
    cnae: empresa.cnae,
    telefone: empresa.telefone,
    email: empresa.email,
    site: empresa.site,
    responsavelLegal: empresa.responsavelLegal,
    contador: empresa.contador,
    cep: empresa.endereco.cep,
    logradouro: empresa.endereco.logradouro,
    numero: empresa.endereco.numero,
    complemento: empresa.endereco.complemento || '',
    bairro: empresa.endereco.bairro,
    cidade: empresa.endereco.cidade,
    uf: empresa.endereco.uf,
  }));
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
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
          <Input label="CNPJ" value={form.cnpj} onChange={set('cnpj')} required />
          <Input label="Inscrição estadual" value={form.inscricaoEstadual} onChange={set('inscricaoEstadual')} />
          <Input label="Inscrição municipal" value={form.inscricaoMunicipal} onChange={set('inscricaoMunicipal')} />
          <Select label="Regime tributário" value={form.regimeTributario} onChange={set('regimeTributario')} options={REGIMES} />
          <Input label="CNAE principal" value={form.cnae} onChange={set('cnae')} />
          <Input label="Telefone" value={form.telefone} onChange={set('telefone')} />
          <Input label="E-mail" type="email" value={form.email} onChange={set('email')} />
          <Input label="Site" value={form.site} onChange={set('site')} />
          <Input label="Responsável legal" value={form.responsavelLegal} onChange={set('responsavelLegal')} />
          <Input label="Contabilidade" value={form.contador} onChange={set('contador')} />
        </FieldRow>

        <div>
          <div className="card-title">Endereço</div>
          <FieldRow>
            <Input label="CEP" value={form.cep} onChange={set('cep')} />
            <Input label="Logradouro" value={form.logradouro} onChange={set('logradouro')} />
            <Input label="Número" value={form.numero} onChange={set('numero')} />
            <Input label="Complemento" value={form.complemento} onChange={set('complemento')} />
            <Input label="Bairro" value={form.bairro} onChange={set('bairro')} />
            <Input label="Cidade" value={form.cidade} onChange={set('cidade')} />
            <Select label="UF" value={form.uf} onChange={set('uf')} options={UF} />
          </FieldRow>
        </div>
      </form>
    </Modal>
  );
}
