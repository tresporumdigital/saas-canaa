import { useState } from 'react';
import {
  Modal, Button, Input, Select, FieldRow, Alert, Icon, Card, EmptyState, EnderecoFields,
} from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { apiFetch, reloadContratosCache, usePlanosCache } from '../../lib/api.js';
import { money } from '../../lib/format.js';
import { maskCPF, maskRG, maskPhone, isValidEmail } from '../../lib/masks.js';

const PARENTESCOS = ['Cônjuge', 'Filho(a)', 'Mãe', 'Pai', 'Irmão(ã)', 'Neto(a)', 'Outro'];
const STEPS = ['Dados do titular', 'Dependentes', 'Contrato'];

const dependenteVazio = () => ({ nome: '', cpf: '', rg: '', telefone: '', parentesco: PARENTESCOS[0] });

// Pop-up de cadastro de novo cliente em 3 etapas: titular, dependentes e contrato.
export default function NovoClienteWizard({ existentes = [], initial, onClose, onCreated }) {
  const { toast } = useToast();
  const planosProduto = usePlanosCache();
  const [step, setStep] = useState(1);
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState({
    nome: '', cpf: '', rg: '', nascimento: '', telefone: '', email: '',
    planoId: '', planoInicio: '2026-09-01', planoVencimento: '10',
    ...initial,
  });
  const [endereco, setEndereco] = useState({ cep: '', logradouro: '', numero: '', bairro: '', cidade: '', uf: '' });
  const [dependentes, setDependentes] = useState([]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setMasked = (k, maskFn) => (e) => setForm((f) => ({ ...f, [k]: maskFn(e.target.value) }));

  const cpfDigits = form.cpf.replace(/\D/g, '');
  const duplicado = cpfDigits.length === 11 && existentes.find((c) => c.cpf === cpfDigits);
  const emailValido = !form.email || isValidEmail(form.email);
  const planoEscolhido = planosProduto.find((p) => p.id === form.planoId);

  const titularValido = Boolean(
    form.nome.trim() && cpfDigits.length === 11 && !duplicado
    && form.telefone.replace(/\D/g, '').length >= 10 && emailValido,
  );

  const addDependente = () => setDependentes((l) => [...l, dependenteVazio()]);
  const removeDependente = (i) => setDependentes((l) => l.filter((_, idx) => idx !== i));
  const setDependente = (i, k, v) => setDependentes((l) => l.map((d, idx) => (idx === i ? { ...d, [k]: v } : d)));

  const finalizar = async () => {
    if (salvando) return;
    setSalvando(true);
    try {
      const { id: clienteId } = await apiFetch('/clientes/index.php', {
        method: 'POST',
        body: { ...form, cpf: cpfDigits, endereco, dependentes },
      });

      if (planoEscolhido) {
        try {
          await apiFetch('/contratos/index.php', {
            method: 'POST',
            body: {
              clienteId, planoId: form.planoId, inicio: form.planoInicio,
              diaVencimento: form.planoVencimento, formaPagamento: 'Boleto',
            },
          });
          reloadContratosCache();
          toast(`Cliente cadastrado e ${planoEscolhido.nome} contratado.`);
        } catch (erroContrato) {
          // Cliente já foi criado — não deixa o cadastro "preso" por causa do contrato.
          toast(`Cliente cadastrado, mas houve um erro ao contratar o plano: ${erroContrato.message}`, { kind: 'warning' });
        }
      } else {
        toast('Cliente cadastrado com sucesso.');
      }
      onCreated?.(clienteId);
    } catch (e) {
      toast(e.message, { kind: 'danger' });
    } finally {
      setSalvando(false);
    }
  };

  const passo = <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-accent-strong)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)', margin: '0 0 var(--space-4)' }}>
    Passo {step} de 3 · {STEPS[step - 1]}
  </p>;

  const cancelarBtn = <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>;

  if (step === 1) {
    return (
      <Modal
        title="Novo cliente"
        onClose={onClose}
        wide
        footer={(
          <>
            {cancelarBtn}
            <Button variant="primary" type="submit" form="titular-form" disabled={!titularValido}>
              Próximo: Dependentes
            </Button>
          </>
        )}
      >
        <form id="titular-form" onSubmit={(e) => { e.preventDefault(); if (titularValido) setStep(2); }} className="stack" style={{ gap: 'var(--space-5)' }}>
          {passo}
          {duplicado && (
            <Alert variant="warning" title="CPF já cadastrado">
              O CPF {maskCPF(cpfDigits)} pertence a <strong>{duplicado.nome}</strong>.{' '}
              <a href={`#/clientes/${duplicado.id}`}>Abrir cadastro existente <Icon name="external" size={12} /></a>
            </Alert>
          )}

          <FieldRow>
            <Input label="Nome completo" value={form.nome} onChange={set('nome')} required />
            <Input label="CPF" value={form.cpf} onChange={setMasked('cpf', maskCPF)} placeholder="000.000.000-00" required
              error={duplicado ? 'CPF já cadastrado — cadastro duplicado bloqueado.' : undefined} />
            <Input label="RG" value={form.rg} onChange={setMasked('rg', maskRG)} placeholder="00.000.000-0" />
            <Input label="Data de nascimento" type="date" value={form.nascimento} onChange={set('nascimento')} />
            <Input label="Telefone" value={form.telefone} onChange={setMasked('telefone', maskPhone)} placeholder="(00) 00000-0000" required />
            <Input label="E-mail" type="email" value={form.email} onChange={set('email')}
              error={!emailValido ? 'E-mail em formato inválido.' : undefined} />
          </FieldRow>

          <EnderecoFields value={endereco} onChange={setEndereco} />

          <div>
            <div className="card-title">Plano (opcional)</div>
            <FieldRow>
              <Select label="Contratar plano" value={form.planoId} onChange={set('planoId')}>
                <option value="">Não contratar agora</option>
                {planosProduto.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome} — {money(p.valorMensal)}/mês</option>
                ))}
              </Select>
              {planoEscolhido && (
                <>
                  <Input label="Início do plano" type="date" value={form.planoInicio} onChange={set('planoInicio')} />
                  <Select label="Dia de vencimento" value={form.planoVencimento} onChange={set('planoVencimento')}
                    options={['1', '5', '10', '15', '20', '25']} />
                </>
              )}
            </FieldRow>
            {planoEscolhido && (
              <Alert variant="info">
                {planoEscolhido.nome} · {money(planoEscolhido.valorMensal)}/mês · carência {planoEscolhido.carenciaDias} dias ·
                até {planoEscolhido.limiteDependentes} dependentes. As 12 parcelas são geradas ao salvar.
              </Alert>
            )}
          </div>
        </form>
      </Modal>
    );
  }

  if (step === 2) {
    return (
      <Modal
        title={`Novo cliente — ${form.nome}`}
        onClose={onClose}
        wide
        footer={(
          <>
            {cancelarBtn}
            <Button variant="secondary" type="button" onClick={() => setStep(1)}>Voltar</Button>
            <Button variant="primary" type="button" onClick={() => setStep(3)}>Próximo: Contrato</Button>
          </>
        )}
      >
        <div className="stack" style={{ gap: 'var(--space-4)' }}>
          {passo}
          <div className="row between" style={{ alignItems: 'center' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
              Dependentes incluídos na cobertura do plano do titular.
            </p>
            <Button variant="secondary" size="sm" icon="plus" type="button" onClick={addDependente}>Adicionar dependente</Button>
          </div>

          {dependentes.length === 0 ? (
            <EmptyState icon="users" title="Nenhum dependente adicionado">
              Use o botão acima para incluir cônjuge, filhos ou outros dependentes.
            </EmptyState>
          ) : dependentes.map((d, i) => (
            <Card
              key={i}
              title={`Dependente ${i + 1}`}
              action={(
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeDependente(i)} aria-label={`Remover dependente ${i + 1}`}>
                  <Icon name="trash" size={14} />
                </button>
              )}
            >
              <FieldRow>
                <Input label="Nome completo" value={d.nome} onChange={(e) => setDependente(i, 'nome', e.target.value)} required />
                <Input label="CPF" value={d.cpf} onChange={(e) => setDependente(i, 'cpf', maskCPF(e.target.value))} placeholder="000.000.000-00" />
                <Input label="RG" value={d.rg} onChange={(e) => setDependente(i, 'rg', maskRG(e.target.value))} placeholder="00.000.000-0" />
                <Input label="Telefone" value={d.telefone} onChange={(e) => setDependente(i, 'telefone', maskPhone(e.target.value))} placeholder="(00) 00000-0000" />
                <Select label="Parentesco" value={d.parentesco} onChange={(e) => setDependente(i, 'parentesco', e.target.value)} options={PARENTESCOS} />
              </FieldRow>
            </Card>
          ))}
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={`Novo cliente — ${form.nome}`}
      onClose={onClose}
      wide
      footer={(
        <>
          {cancelarBtn}
          <Button variant="secondary" type="button" onClick={() => setStep(2)}>Voltar</Button>
          <Button variant="primary" type="button" onClick={finalizar} loading={salvando}>Concluir cadastro</Button>
        </>
      )}
    >
      {passo}
      <EmptyState icon="doc" title="Modelo de contrato ainda não cadastrado">
        Quando o modelo oficial for definido, ele aparecerá aqui para conferência antes da emissão —
        pronto para impressão ou para envio ao {form.nome || 'titular'} para assinatura digital.
      </EmptyState>
      <div className="row" style={{ gap: 'var(--space-3)', justifyContent: 'center', marginTop: 'var(--space-4)' }}>
        <Button variant="secondary" icon="print" disabled>Imprimir</Button>
        <Button variant="secondary" icon="mail" disabled>Enviar para assinatura</Button>
      </div>
    </Modal>
  );
}
