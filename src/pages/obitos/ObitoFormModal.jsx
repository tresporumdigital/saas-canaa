import { useMemo, useRef, useState } from 'react';
import {
  Modal, Button, Input, Select, FieldRow, Alert, Icon, Card, Checkbox, EmptyState,
} from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useClientesCache } from '../../lib/api.js';
import { contratosDoCliente } from '../../mock/contratos.js';
import { planoById } from '../../mock/planos.js';
import { maskCPF, maskRG, maskMoney, moneyToNumber } from '../../lib/masks.js';
import { date as fmtDate, dateTime as fmtDateTime, money } from '../../lib/format.js';
import { gerarNotaFalecimento } from '../../lib/notaFalecimento.js';

const SERVICOS_PRESET = [
  'Translado do corpo', 'Preparação e tanatopraxia', 'Urna funerária', 'Velório',
  'Sepultamento', 'Cremação', 'Documentação e registro em cartório', 'Ornamentação floral', 'Outro',
];
const STEPS = ['Tipo e falecido', 'Dados do serviço', 'Nota de falecimento', 'Nota fiscal'];

const servicoVazio = () => ({ tipo: SERVICOS_PRESET[0], outro: '', incluido: false, valor: '' });
const falecidoVazio = { nome: '', nascimento: '', cpf: '', rg: '' };

// Pop-up de registro de óbito em 4 etapas: tipo/falecido, serviço, nota de falecimento e nota fiscal.
export default function ObitoFormModal({ onClose }) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const clientes = useClientesCache();

  // ---- Passo 1: tipo de atendimento + dados do falecido ----
  const [tipoAtendimento, setTipoAtendimento] = useState('');
  const [clienteBuscaId, setClienteBuscaId] = useState('');
  const [contrato, setContrato] = useState(null);
  const [buscou, setBuscou] = useState(false);
  const [falecidoSelId, setFalecidoSelId] = useState('');
  const [falecido, setFalecido] = useState(falecidoVazio);
  const [obitoEm, setObitoEm] = useState('2026-08-27T04:00');

  const clienteBusca = clientes.find((c) => c.id === clienteBuscaId);

  const buscarContrato = () => {
    const c = clienteBusca ? contratosDoCliente(clienteBusca.id)[0] : null;
    setContrato(c || null);
    setBuscou(true);
    setFalecidoSelId('');
    setFalecido(falecidoVazio);
  };

  const pessoasDoContrato = useMemo(() => {
    if (!clienteBusca) return [];
    const titular = { id: 'titular', nome: clienteBusca.nome, cpf: clienteBusca.cpf, rg: clienteBusca.rg, nascimento: clienteBusca.nascimento };
    const deps = (clienteBusca.dependentes || []).map((d, i) => ({ id: `dep-${i}`, nome: d.nome, cpf: d.cpf, rg: '', nascimento: d.nascimento }));
    return [titular, ...deps];
  }, [clienteBusca]);

  const selecionarFalecido = (id) => {
    setFalecidoSelId(id);
    const pessoa = pessoasDoContrato.find((p) => p.id === id);
    if (pessoa) {
      setFalecido({
        nome: pessoa.nome,
        nascimento: pessoa.nascimento || '',
        cpf: pessoa.cpf ? maskCPF(pessoa.cpf) : '',
        rg: pessoa.rg || '',
      });
    }
  };

  const setFalecidoCampo = (k, maskFn) => (e) => setFalecido((f) => ({ ...f, [k]: maskFn ? maskFn(e.target.value) : e.target.value }));

  const falecidoValido = Boolean(falecido.nome.trim());
  const passo1Valido = tipoAtendimento === 'Particular' ? falecidoValido
    : tipoAtendimento === 'Plano' ? Boolean(contrato) && falecidoValido
    : false;

  // ---- Passo 2: serviços ----
  const [servicos, setServicos] = useState([]);
  const addServico = () => setServicos((l) => [...l, servicoVazio()]);
  const removeServico = (i) => setServicos((l) => l.filter((_, idx) => idx !== i));
  const setServico = (i, k, v) => setServicos((l) => l.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)));
  const valorTotal = servicos.reduce((sum, s) => sum + (s.incluido ? 0 : moneyToNumber(s.valor)), 0);

  // ---- Passo 3: nota de falecimento ----
  const [fotoUrl, setFotoUrl] = useState(null);
  const [imagemGerada, setImagemGerada] = useState(null);
  const [gerandoImagem, setGerandoImagem] = useState(false);
  const fileInputRef = useRef(null);

  const onFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoUrl(URL.createObjectURL(file));
    setImagemGerada(null);
  };

  const gerarImagem = async () => {
    setGerandoImagem(true);
    const url = await gerarNotaFalecimento({
      nome: falecido.nome,
      nascimento: falecido.nascimento ? fmtDate(falecido.nascimento) : '',
      falecimento: obitoEm ? fmtDateTime(obitoEm) : '',
      fotoUrl,
    });
    setImagemGerada(url);
    setGerandoImagem(false);
  };

  const baixarImagem = () => {
    if (!imagemGerada) return;
    const a = document.createElement('a');
    a.href = imagemGerada;
    const slug = (falecido.nome || 'atendimento').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    a.download = `nota-falecimento-${slug || 'atendimento'}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // ---- Passo 4: finalização ----
  const finalizar = (comNotaFiscal) => {
    toast(comNotaFiscal
      ? 'Óbito registrado e nota fiscal enviada para emissão (simulação — sem persistência).'
      : 'Óbito registrado. A nota fiscal poderá ser gerada depois, em Notas Fiscais (simulação — sem persistência).');
    onClose();
  };

  const passoLabel = (
    <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-accent-strong)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)', margin: '0 0 var(--space-4)' }}>
      Passo {step} de 4 · {STEPS[step - 1]}
    </p>
  );
  const cancelarBtn = <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>;

  if (step === 1) {
    return (
      <Modal
        title="Registrar óbito"
        onClose={onClose}
        wide
        footer={(
          <>
            {cancelarBtn}
            <Button variant="primary" type="button" disabled={!passo1Valido} onClick={() => setStep(2)}>
              Próximo: Dados do serviço
            </Button>
          </>
        )}
      >
        <div className="stack" style={{ gap: 'var(--space-5)' }}>
          {passoLabel}

          <Select
            label="Tipo de atendimento"
            value={tipoAtendimento}
            onChange={(e) => { setTipoAtendimento(e.target.value); setBuscou(false); setContrato(null); setFalecidoSelId(''); setFalecido(falecidoVazio); }}
          >
            <option value="">Selecione…</option>
            <option value="Particular">Particular</option>
            <option value="Plano">Plano</option>
          </Select>

          {tipoAtendimento === 'Plano' && (
            <div>
              <div className="card-title">Contrato</div>
              <FieldRow>
                <Select label="Titular do contrato" value={clienteBuscaId} onChange={(e) => { setClienteBuscaId(e.target.value); setBuscou(false); setContrato(null); setFalecidoSelId(''); setFalecido(falecidoVazio); }}>
                  <option value="">Selecione um cliente…</option>
                  {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </Select>
              </FieldRow>
              <Button variant="secondary" icon="search" type="button" onClick={buscarContrato} disabled={!clienteBuscaId}>Buscar</Button>

              {buscou && contrato && (
                <Alert variant="info" title={`Contrato nº ${contrato.id}`}>
                  {planoById(contrato.planoId)?.nome} · situação: {contrato.situacao}
                </Alert>
              )}
              {buscou && !contrato && (
                <Alert variant="warning">Este cliente não possui contrato de plano.</Alert>
              )}
            </div>
          )}

          {(tipoAtendimento === 'Particular' || (tipoAtendimento === 'Plano' && contrato)) && (
            <div>
              <div className="card-title">Dados do falecido</div>

              {tipoAtendimento === 'Plano' && contrato && (
                <FieldRow>
                  <Select label="Pessoa falecida" value={falecidoSelId} onChange={(e) => selecionarFalecido(e.target.value)}>
                    <option value="">Selecione o titular ou um dependente…</option>
                    {pessoasDoContrato.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </Select>
                </FieldRow>
              )}

              <FieldRow>
                <Input label="Nome completo" value={falecido.nome} onChange={setFalecidoCampo('nome')} required />
                <Input label="Data de nascimento" type="date" value={falecido.nascimento} onChange={setFalecidoCampo('nascimento')} />
                <Input label="Data e horário do óbito" type="datetime-local" value={obitoEm} onChange={(e) => setObitoEm(e.target.value)} />
                <Input label="CPF" value={falecido.cpf} onChange={setFalecidoCampo('cpf', maskCPF)} placeholder="000.000.000-00" />
                <Input label="RG" value={falecido.rg} onChange={setFalecidoCampo('rg', maskRG)} placeholder="00.000.000-0" />
              </FieldRow>
            </div>
          )}
        </div>
      </Modal>
    );
  }

  if (step === 2) {
    return (
      <Modal
        title={`Registrar óbito — ${falecido.nome}`}
        onClose={onClose}
        wide
        footer={(
          <>
            {cancelarBtn}
            <Button variant="secondary" type="button" onClick={() => setStep(1)}>Voltar</Button>
            <Button variant="primary" type="button" onClick={() => setStep(3)}>Próximo: Nota de falecimento</Button>
          </>
        )}
      >
        <div className="stack" style={{ gap: 'var(--space-4)' }}>
          {passoLabel}
          <div className="row between" style={{ alignItems: 'center' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
              Serviços a serem executados neste atendimento.
            </p>
            <Button variant="secondary" size="sm" icon="plus" type="button" onClick={addServico}>Adicionar serviço</Button>
          </div>

          {servicos.length === 0 ? (
            <EmptyState icon="doc" title="Nenhum serviço adicionado">
              Use o botão acima para incluir translado, preparação, urna, velório e demais itens.
            </EmptyState>
          ) : servicos.map((s, i) => (
            <Card
              key={i}
              title={`Serviço ${i + 1}`}
              action={(
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeServico(i)} aria-label={`Remover serviço ${i + 1}`}>
                  <Icon name="trash" size={14} />
                </button>
              )}
            >
              <FieldRow>
                <Select label="Serviço" value={s.tipo} onChange={(e) => setServico(i, 'tipo', e.target.value)} options={SERVICOS_PRESET} />
                {s.tipo === 'Outro' && (
                  <Input label="Descrição do serviço" value={s.outro} onChange={(e) => setServico(i, 'outro', e.target.value)} />
                )}
                <Input
                  label="Valor (R$)"
                  value={s.incluido ? 'R$ 0,00' : s.valor}
                  onChange={(e) => setServico(i, 'valor', maskMoney(e.target.value))}
                  disabled={s.incluido}
                  placeholder="R$ 0,00"
                />
              </FieldRow>
              <Checkbox
                label="Incluído no plano (sem cobrança adicional)"
                checked={s.incluido}
                onChange={(e) => setServico(i, 'incluido', e.target.checked)}
              />
            </Card>
          ))}

          {servicos.length > 0 && (
            <Alert variant="info">Valor total do atendimento: <strong>{money(valorTotal)}</strong></Alert>
          )}
        </div>
      </Modal>
    );
  }

  if (step === 3) {
    return (
      <Modal
        title="Registrar óbito — Nota de falecimento"
        onClose={onClose}
        wide
        footer={(
          <>
            {cancelarBtn}
            <Button variant="secondary" type="button" onClick={() => setStep(2)}>Voltar</Button>
            <Button variant="primary" type="button" onClick={() => setStep(4)}>Próximo: Nota fiscal</Button>
          </>
        )}
      >
        <div className="stack" style={{ gap: 'var(--space-4)' }}>
          {passoLabel}

          <div>
            <div className="card-title">Foto do(a) falecido(a)</div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFotoChange} />
            <div className="row" style={{ gap: 'var(--space-3)', alignItems: 'center' }}>
              {fotoUrl && (
                <img src={fotoUrl} alt="Prévia da foto selecionada" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
              )}
              <Button variant="secondary" type="button" onClick={() => fileInputRef.current?.click()}>
                {fotoUrl ? 'Trocar foto' : 'Selecionar foto'}
              </Button>
            </div>
          </div>

          <div className="row" style={{ gap: 'var(--space-3)' }}>
            <Button variant="primary" type="button" loading={gerandoImagem} onClick={gerarImagem}>Gerar nota de falecimento</Button>
            <Button variant="secondary" icon="download" type="button" onClick={baixarImagem} disabled={!imagemGerada}>Baixar imagem</Button>
          </div>

          {imagemGerada && (
            <img
              src={imagemGerada}
              alt="Nota de falecimento gerada"
              style={{ display: 'block', margin: '0 auto', maxWidth: 260, borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}
            />
          )}
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title="Registrar óbito — Nota fiscal"
      onClose={onClose}
      wide
      footer={(
        <>
          {cancelarBtn}
          <Button variant="secondary" type="button" onClick={() => setStep(3)}>Voltar</Button>
        </>
      )}
    >
      {passoLabel}
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
        Deseja gerar a nota fiscal deste atendimento agora ou deixar para depois?
      </p>
      <div className="row" style={{ gap: 'var(--space-3)', justifyContent: 'center', marginTop: 'var(--space-4)' }}>
        <Button variant="primary" icon="receipt" type="button" onClick={() => finalizar(true)}>Gerar nota fiscal agora</Button>
        <Button variant="secondary" icon="clock" type="button" onClick={() => finalizar(false)}>Gerar depois</Button>
      </div>
    </Modal>
  );
}
