import { useState } from 'react';
import { PageHeader } from '../../components/index.js';
import {
  Card, Tabs, DataTable, Badge, Button, StatCard, Drawer, DefList, Alert, Modal, Textarea,
} from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { notasFiscais } from '../../mock/notasFiscais.js';
import { money, dateTime, number } from '../../lib/format.js';
import { statusVariant } from '../../lib/status.js';

const TABS = [
  { id: 'todas', label: 'Todas' },
  { id: 'pendentes', label: 'Fila de emissão' },
  { id: 'rejeitadas', label: 'Rejeitadas' },
];

export default function NotasFiscais() {
  const { toast } = useToast();
  const [tab, setTab] = useState('todas');
  const [nota, setNota] = useState(null);
  const [correcao, setCorrecao] = useState(false);

  const pendentes = notasFiscais.filter((n) => n.status === 'Pendente');
  const rejeitadas = notasFiscais.filter((n) => n.status === 'Rejeitada');
  const autorizadas = notasFiscais.filter((n) => n.status === 'Autorizada');
  const rows = tab === 'pendentes' ? pendentes : tab === 'rejeitadas' ? rejeitadas : notasFiscais;

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Notas Fiscais' }]}
        title="Emissão de Nota Fiscal"
        subtitle="NFS-e para serviços e planos, NF-e para venda de equipamentos — pré-preenchidas a partir da venda ou atendimento."
        actions={<Button variant="secondary" icon="download" onClick={() => toast('Relatório para o contador exportado em XML/CSV (simulação).')}>Exportar p/ contador</Button>}
      />

      <div className="grid cols-3">
        <StatCard label="Pendentes de emissão" value={number(pendentes.length)} icon="clock" tone="warning" />
        <StatCard label="Rejeitadas" value={number(rejeitadas.length)} icon="alert" tone="danger" />
        <StatCard label="Autorizadas" value={number(autorizadas.length)} icon="check-circle" tone="success" />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <Card>
        <DataTable
          rows={rows}
          searchKeys={['id', 'clienteNome', 'origemRef']}
          onRowClick={(r) => setNota(r)}
          pageSize={12}
          columns={[
            { key: 'id', header: 'Nota', sortable: true },
            { key: 'tipo', header: 'Tipo', render: (r) => <Badge variant="neutral">{r.tipo}</Badge> },
            { key: 'clienteNome', header: 'Cliente', sortable: true },
            { key: 'origemTipo', header: 'Origem', render: (r) => `${r.origemTipo} ${r.origemRef}` },
            { key: 'valor', header: 'Valor', align: 'right', sortable: true, render: (r) => money(r.valor) },
            { key: 'status', header: 'Status', sortable: true, render: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge> },
            { key: 'emitidaEm', header: 'Emissão', render: (r) => (r.emitidaEm ? dateTime(r.emitidaEm) : '—') },
          ]}
        />
      </Card>

      {nota && (
        <Drawer title={`Nota ${nota.id}`} onClose={() => setNota(null)}
          actions={
            nota.status === 'Autorizada' ? (
              <Button size="sm" variant="secondary" onClick={() => setCorrecao(true)}>Carta de correção</Button>
            ) : (
              <Button size="sm" variant="primary" onClick={() => { toast('Nota reenviada para autorização (simulação).'); setNota(null); }}>
                {nota.status === 'Rejeitada' ? 'Corrigir e reenviar' : 'Emitir agora'}
              </Button>
            )
          }>
          {nota.status === 'Rejeitada' && (
            <Alert variant="danger" title="Rejeitada pela SEFAZ / prefeitura">{nota.motivoRejeicao}</Alert>
          )}
          <DefList items={[
            { label: 'Tipo', value: nota.tipo },
            { label: 'Cliente', value: nota.clienteNome },
            { label: 'Origem', value: `${nota.origemTipo} — ${nota.origemRef}` },
            { label: 'Valor dos serviços/produtos', value: money(nota.valor) },
            { label: 'Impostos', value: money(nota.impostos) },
            { label: 'Nº da nota', value: nota.numero || '—' },
            { label: 'Emissão', value: nota.emitidaEm ? dateTime(nota.emitidaEm) : 'Não emitida' },
            { label: 'Status', value: nota.status },
          ]} />
          {nota.status === 'Autorizada' && (
            <Card title="Documentos">
              <div className="row" style={{ gap: 'var(--space-3)' }}>
                <Button size="sm" variant="secondary" icon="download" onClick={() => toast('XML baixado (simulação).')}>XML</Button>
                <Button size="sm" variant="secondary" icon="download" onClick={() => toast('DANFE/PDF baixado (simulação).')}>DANFE/PDF</Button>
                <Button size="sm" variant="ghost" icon="mail" onClick={() => toast('Nota enviada ao cliente por e-mail (simulação).')}>Enviar ao cliente</Button>
              </div>
            </Card>
          )}
        </Drawer>
      )}

      {correcao && (
        <Modal title="Carta de correção" onClose={() => setCorrecao(false)}
          footer={<>
            <Button size="sm" variant="secondary" onClick={() => setCorrecao(false)}>Cancelar</Button>
            <Button size="sm" variant="primary" onClick={() => { toast('Carta de correção registrada dentro do prazo legal (simulação).'); setCorrecao(false); }}>Emitir correção</Button>
          </>}>
          <Textarea label="Descrição da correção" placeholder="Ex.: correção do endereço do tomador…" />
        </Modal>
      )}
    </>
  );
}
