import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/index.js';
import {
  Card, Badge, Button, DefList, Timeline, EmptyState, Alert, Modal, Textarea, PrintDocument,
} from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { guiaById, CICLO_GUIA } from '../../mock/guias.js';
import { obitoById } from '../../mock/obitos.js';
import { parceiroById } from '../../mock/parceiros.js';
import { dateTime, money, date } from '../../lib/format.js';
import { statusVariant } from '../../lib/status.js';

export default function GuiaDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [showPrint, setShowPrint] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [justificativa, setJustificativa] = useState('');

  const g = guiaById(id);
  if (!g) return <EmptyState icon="send" title="Guia não encontrada" action={<Button to="/guias">Voltar</Button>} />;

  const parceiro = parceiroById(g.parceiroId);
  const obito = obitoById(g.obitoId);
  const idxAtual = CICLO_GUIA.indexOf(g.status);

  const steps = CICLO_GUIA.map((label, i) => {
    const evt = g.historico.find((h) => h.status === label);
    return {
      label,
      at: evt ? dateTime(evt.quando) : null,
      by: evt ? evt.quem : null,
      state: g.status === 'Cancelada' ? (i <= 1 ? 'done' : 'todo') : i < idxAtual ? 'done' : i === idxAtual ? 'current' : 'todo',
    };
  });

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Guias', to: '/guias' }, { label: g.id }]}
        title={`Guia ${g.id}`}
        subtitle={`${g.servico} · ${parceiro?.nomeFantasia}`}
        actions={
          <>
            <Badge variant={statusVariant(g.status)}>{g.status}</Badge>
            <Button variant="secondary" icon="print" onClick={() => setShowPrint(true)}>Visualizar PDF</Button>
            {g.status !== 'Cancelada' && g.status !== 'Faturada' && (
              <Button variant="ghost" onClick={() => setShowCancel(true)}>Cancelar guia</Button>
            )}
          </>
        }
      />

      {!g.coberto && (
        <Alert variant="warning" title="Serviço fora da cobertura do plano">
          A validação automática indicou que este serviço não está integralmente coberto pelo plano do cliente. Confirme a cobrança à parte antes de faturar.
        </Alert>
      )}

      <div className="grid cols-2">
        <Card title="Dados da guia">
          <DefList items={[
            { label: 'Cliente', value: g.clienteNome },
            { label: 'Vínculo', value: g.clienteVinculo },
            { label: 'Atendimento', value: obito ? <Link to={`/obitos/${obito.id}`}>{obito.id}</Link> : '—' },
            { label: 'Parceiro acionado', value: <Link to={`/parceiros/${g.parceiroId}`}>{parceiro?.nomeFantasia}</Link> },
            { label: 'Serviço solicitado', value: g.servico },
            { label: 'Valor acordado', value: money(g.valorAcordado) },
            { label: 'Emitida em', value: dateTime(g.emitidaEm) },
            { label: 'Responsável pela emissão', value: g.emitidaPor },
            { label: 'Cobertura do plano', value: g.coberto ? 'Coberto' : 'Não coberto — cobrança à parte' },
          ]} />
        </Card>
        <Card title="Ciclo de status">
          {g.status === 'Cancelada' && g.canceladaJustificativa && (
            <Alert variant="danger" title="Guia cancelada">{g.canceladaJustificativa}</Alert>
          )}
          <Timeline steps={steps} />
        </Card>
      </div>

      {showPrint && (
        <Modal title="Guia de atendimento — PDF" wide onClose={() => setShowPrint(false)}
          footer={<>
            <Button size="sm" variant="secondary" onClick={() => setShowPrint(false)}>Fechar</Button>
            <Button size="sm" variant="primary" icon="print" onClick={() => window.print()}>Imprimir</Button>
          </>}>
          <PrintDocument kind="Guia de Atendimento" numero={g.pdfNumero}>
            <table>
              <tbody>
                <tr><th>Cliente</th><td>{g.clienteNome}</td><th>Vínculo</th><td>{g.clienteVinculo}</td></tr>
                <tr><th>Atendimento</th><td>{g.obitoId}</td><th>Emissão</th><td>{dateTime(g.emitidaEm)}</td></tr>
                <tr><th>Parceiro</th><td>{parceiro?.razaoSocial}</td><th>CNPJ</th><td>{parceiro?.cnpj}</td></tr>
                <tr><th>Serviço solicitado</th><td colSpan={3}>{g.servico}</td></tr>
                <tr><th>Plano / cobertura</th><td>{g.coberto ? 'Coberto pelo plano' : 'Cobrança à parte'}</td><th>Valor acordado</th><td>{money(g.valorAcordado)}</td></tr>
                <tr><th>Responsável pela emissão</th><td colSpan={3}>{g.emitidaPor}</td></tr>
              </tbody>
            </table>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
              Documento gerado pelo Sistema de Gestão Funerária Canaã. Válido mediante aceite do parceiro no portal.
            </p>
            <div className="pd-sign">
              <div>Emitente — Funerária Canaã</div>
              <div>Aceite do parceiro — {parceiro?.nomeFantasia}</div>
            </div>
          </PrintDocument>
        </Modal>
      )}

      {showCancel && (
        <Modal title="Cancelar guia" onClose={() => setShowCancel(false)}
          footer={<>
            <Button size="sm" variant="secondary" onClick={() => setShowCancel(false)}>Voltar</Button>
            <Button size="sm" variant="danger" disabled={justificativa.trim().length < 10}
              onClick={() => { toast('Guia cancelada e registrada em log (simulação).', { kind: 'warning' }); setShowCancel(false); }}>
              Confirmar cancelamento
            </Button>
          </>}>
          <p style={{ marginBottom: 'var(--space-4)' }}>A justificativa é obrigatória e fica registrada em log de auditoria.</p>
          <Textarea label="Justificativa" value={justificativa} onChange={(e) => setJustificativa(e.target.value)}
            hint={justificativa.trim().length < 10 ? 'Mínimo de 10 caracteres.' : ' '} />
        </Modal>
      )}
    </>
  );
}
