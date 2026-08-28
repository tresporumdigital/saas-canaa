import { useState } from 'react';
import { PageHeader } from '../../components/index.js';
import {
  Card, Tabs, DataTable, Badge, Button, Modal, Select, Input, Checkbox, PrintDocument, StatCard,
} from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { carnes } from '../../mock/carnes.js';
import { contratos } from '../../mock/contratos.js';
import { clienteById } from '../../mock/clientes.js';
import { money, dateTime, number } from '../../lib/format.js';

const TABS = [
  { id: 'gerar', label: 'Gerar carnê' },
  { id: 'historico', label: 'Histórico' },
];

export default function CarnesHome() {
  const { toast } = useToast();
  const [tab, setTab] = useState('gerar');
  const [preview, setPreview] = useState(null);
  const [lote, setLote] = useState(false);

  const enviados = carnes.filter((c) => c.enviadoEm).length;

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Carnês' }]}
        title="Gerador de Carnês"
        subtitle="Carnês de pagamento gerados em segundos, com identidade visual da Canaã e envio automático por e-mail."
        actions={<Button variant="secondary" icon="users" onClick={() => setLote(true)}>Gerar em lote</Button>}
      />

      <div className="grid cols-3">
        <StatCard label="Carnês gerados" value={number(carnes.length)} icon="receipt" />
        <StatCard label="Enviados por e-mail" value={number(enviados)} icon="mail" tone="success" />
        <StatCard label="Pendentes de envio" value={number(carnes.length - enviados)} icon="clock" tone="warning" />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'gerar' && (
        <Card title="Gerar carnê individual">
          <div className="field-grid">
            <Select label="Contrato" options={contratos.filter((c) => c.situacao !== 'Cancelado').map((c) => `${c.id} — ${clienteById(c.clienteId)?.nome}`)} />
            <Select label="Período" options={['Anual (12 parcelas)', 'Semestral (6 parcelas)', 'Trimestral (3 parcelas)']} />
            <Input label="Primeira competência" type="month" defaultValue="2026-09" />
          </div>
          <Checkbox label="Enviar automaticamente por e-mail ao cliente" defaultChecked />
          <div className="row" style={{ gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
            <Button variant="secondary" onClick={() => setPreview(carnes[0])}>Pré-visualizar</Button>
            <Button variant="primary" icon="receipt" onClick={() => toast('Carnê gerado em PDF e enviado por e-mail. Registro adicionado ao histórico do cliente (simulação).')}>Gerar e enviar</Button>
          </div>
        </Card>
      )}

      {tab === 'historico' && (
        <Card>
          <DataTable
            rows={carnes}
            searchKeys={['id', 'clienteNome', 'contratoId', 'lote']}
            onRowClick={(r) => setPreview(r)}
            pageSize={12}
            columns={[
              { key: 'id', header: 'Carnê', sortable: true },
              { key: 'clienteNome', header: 'Cliente', sortable: true },
              { key: 'contratoId', header: 'Contrato' },
              { key: 'parcelas', header: 'Parcelas', align: 'right' },
              { key: 'valorParcela', header: 'Valor', align: 'right', render: (r) => money(r.valorParcela) },
              { key: 'geradoEm', header: 'Gerado em', sortable: true, render: (r) => dateTime(r.geradoEm) },
              { key: 'enviadoEm', header: 'Envio', render: (r) => r.enviadoEm ? <Badge variant="success">Enviado</Badge> : <Badge variant="warning">Pendente</Badge> },
            ]}
          />
        </Card>
      )}

      {preview && (
        <Modal title={`Carnê ${preview.id} — pré-visualização`} wide onClose={() => setPreview(null)}
          footer={<>
            <Button size="sm" variant="secondary" onClick={() => setPreview(null)}>Fechar</Button>
            <Button size="sm" variant="primary" icon="print" onClick={() => window.print()}>Imprimir</Button>
          </>}>
          <PrintDocument kind="Carnê de pagamento" numero={preview.id}>
            <h2>{preview.clienteNome}</h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              Contrato {preview.contratoId} · {preview.parcelas} parcelas de {money(preview.valorParcela)} · a partir de {preview.competenciaInicial}
            </p>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ borderTop: '1px dashed var(--color-border-strong)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
                <div className="row between">
                  <strong>Parcela {i + 1}/{preview.parcelas}</strong>
                  <span className="num">{money(preview.valorParcela)}</span>
                </div>
                <div className="pd-barcode" />
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                  Linha digitável: 34191.79001 01043.510047 91020.150008 5 9911000001{(preview.valorParcela * 100).toFixed(0)}
                </div>
              </div>
            ))}
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-4)' }}>
              …demais parcelas no PDF completo. QR Code Pix disponível em cada boleto.
            </p>
          </PrintDocument>
        </Modal>
      )}

      {lote && (
        <Modal title="Gerar carnês em lote" onClose={() => setLote(false)}
          footer={<>
            <Button size="sm" variant="secondary" onClick={() => setLote(false)}>Cancelar</Button>
            <Button size="sm" variant="primary" onClick={() => { toast(`${contratos.filter((c) => c.situacao !== 'Cancelado').length} carnês gerados em lote e enfileirados para envio (simulação).`); setLote(false); }}>Gerar lote</Button>
          </>}>
          <div className="field-grid">
            <Select label="Filtro de contratos" options={['Todos os ativos', 'Plano Família', 'Plano Essencial', 'Vencimento dia 10']} />
            <Input label="Primeira competência" type="month" defaultValue="2026-09" />
          </div>
          <Checkbox label="Enviar por e-mail ao concluir a geração" defaultChecked />
        </Modal>
      )}
    </>
  );
}
