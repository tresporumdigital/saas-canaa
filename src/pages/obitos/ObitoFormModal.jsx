import { useMemo, useState } from 'react';
import { Modal, Button, Input, Select, Textarea, FieldRow, CoverageBanner, Alert, Checkbox, Card } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { clientes } from '../../mock/clientes.js';
import { contratosDoCliente } from '../../mock/contratos.js';
import { planoById } from '../../mock/planos.js';
import { parceiros } from '../../mock/parceiros.js';

// Pop-up de registro de novo atendimento de óbito.
export default function ObitoFormModal({ onClose }) {
  const { toast } = useToast();

  const [tipo, setTipo] = useState('Titular');
  const [clienteId, setClienteId] = useState('');
  const [form, setForm] = useState({
    falecido: '', obitoEm: '2026-08-27T04:00', local: '', causa: '', numeroDO: '',
    solicitante: '', parentesco: '', telefone: '',
  });
  const [parceirosSel, setParceirosSel] = useState([]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const cliente = clientes.find((c) => c.id === clienteId);
  const contrato = cliente ? contratosDoCliente(cliente.id)[0] : null;

  const checks = useMemo(() => {
    if (tipo === 'Particular') return null;
    if (!contrato) return null;
    const plano = planoById(contrato.planoId);
    const ativo = contrato.situacao === 'Ativo' || contrato.situacao === 'Em atraso';
    const adimplente = contrato.situacao === 'Ativo';
    return [
      { label: 'Plano ativo', state: ativo ? 'ok' : 'bad', detail: ativo ? `${plano?.nome} — contrato ${contrato.id}` : 'contrato suspenso ou cancelado' },
      { label: 'Carência cumprida', state: 'ok', detail: `carência de ${plano?.carenciaDias} dias — contrato desde ${contrato.inicio}` },
      { label: 'Beneficiário incluído', state: tipo === 'Titular' ? 'ok' : 'warn', detail: tipo === 'Titular' ? 'titular do plano' : 'confirmar se o dependente consta no contrato' },
      { label: 'Adimplência', state: adimplente ? 'ok' : 'bad', detail: adimplente ? 'sem parcelas em atraso' : `${contrato.parcelasEmAberto} parcela(s) em atraso — cobrança à parte` },
    ];
  }, [tipo, contrato]);

  const toggleParceiro = (id) => setParceirosSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const submit = (e) => {
    e.preventDefault();
    toast(`Óbito registrado e ${parceirosSel.length} guia(s) emitida(s) sem redigitação (simulação).`);
    onClose();
  };

  return (
    <Modal
      title="Registrar óbito"
      onClose={onClose}
      wide
      footer={(
        <>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="obito-form">Registrar e emitir guias</Button>
        </>
      )}
    >
      <form id="obito-form" onSubmit={submit} className="stack" style={{ gap: 'var(--space-5)' }}>
        <div>
          <FieldRow>
            <Select label="Tipo de atendimento" value={tipo} onChange={(e) => setTipo(e.target.value)}
              options={['Titular', 'Dependente', 'Particular']} />
            {tipo !== 'Particular' && (
              <Select label="Cliente titular" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                <option value="">Selecione…</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </Select>
            )}
          </FieldRow>

          {tipo === 'Particular' ? (
            <Alert variant="warning" title="Atendimento particular">Todos os serviços serão cobrados à parte. Nenhuma validação de cobertura se aplica.</Alert>
          ) : checks ? (
            <Card className="anim-fade-up" style={{ background: 'var(--color-bg-sunken)', marginTop: 'var(--space-4)' }}>
              <div className="card-title">Cobertura em tempo real</div>
              <CoverageBanner checks={checks} />
            </Card>
          ) : clienteId ? (
            <Alert variant="info">Cliente sem contrato de plano — o atendimento seguirá como particular.</Alert>
          ) : null}
        </div>

        <div>
          <div className="card-title">Dados do falecido</div>
          <FieldRow>
            <Input label="Nome do falecido" value={form.falecido} onChange={set('falecido')} required />
            <Input label="Data/hora do óbito" type="datetime-local" value={form.obitoEm} onChange={set('obitoEm')} />
            <Input label="Local do óbito" value={form.local} onChange={set('local')} />
            <Input label="Causa declarada" value={form.causa} onChange={set('causa')} />
            <Input label="Nº da declaração de óbito" value={form.numeroDO} onChange={set('numeroDO')} />
          </FieldRow>
        </div>

        <div>
          <div className="card-title">Solicitante</div>
          <FieldRow>
            <Input label="Nome do responsável" value={form.solicitante} onChange={set('solicitante')} required />
            <Input label="Parentesco" value={form.parentesco} onChange={set('parentesco')} />
            <Input label="Telefone" value={form.telefone} onChange={set('telefone')} />
          </FieldRow>
        </div>

        <div>
          <div className="card-title">Acionar parceiros</div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
            Os parceiros selecionados recebem uma guia gerada automaticamente com os dados deste atendimento.
          </p>
          <div className="grid cols-2" style={{ gap: 0 }}>
            {parceiros.filter((p) => p.status === 'Ativo').map((p) => (
              <Checkbox key={p.id} label={`${p.nomeFantasia} — ${p.tipoParceria}`} checked={parceirosSel.includes(p.id)} onChange={() => toggleParceiro(p.id)} />
            ))}
          </div>
        </div>

        <Textarea label="Observações do atendimento" placeholder="Detalhes adicionais…" />
      </form>
    </Modal>
  );
}
