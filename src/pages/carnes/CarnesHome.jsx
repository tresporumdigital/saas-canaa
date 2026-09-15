import { useState } from 'react';
import { PageHeader } from '../../components/index.js';
import {
  Card, Tabs, DataTable, Badge, Button, Modal, Select, Input, Checkbox, PrintDocument, StatCard,
} from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { apiFetch, useCarnesCacheState, useClientesCache, useContratosCache, usePlanosCache } from '../../lib/api.js';
import { money, dateTime, number } from '../../lib/format.js';

const TABS = [
  { id: 'gerar', label: 'Gerar carnê' },
  { id: 'historico', label: 'Histórico' },
];

const PERIODOS = [
  { label: 'Anual (12 parcelas)', parcelas: 12 },
  { label: 'Semestral (6 parcelas)', parcelas: 6 },
  { label: 'Trimestral (3 parcelas)', parcelas: 3 },
];

export default function CarnesHome() {
  const { toast } = useToast();
  const [tab, setTab] = useState('gerar');
  const [preview, setPreview] = useState(null);
  const [lote, setLote] = useState(false);
  const clientes = useClientesCache();
  const clienteById = (id) => clientes.find((c) => c.id === id);
  const contratos = useContratosCache();
  const planos = usePlanosCache();
  const { rows: carnes, reload: reloadCarnes } = useCarnesCacheState();

  const contratosAtivos = contratos.filter((c) => c.situacao !== 'Cancelado');
  const enviados = carnes.filter((c) => c.enviadoEm).length;

  const [contratoId, setContratoId] = useState('');
  const [periodo, setPeriodo] = useState(PERIODOS[0].label);
  const [competencia, setCompetencia] = useState('2026-09');
  const [salvando, setSalvando] = useState(false);

  const parcelasSelecionadas = PERIODOS.find((p) => p.label === periodo)?.parcelas || 12;
  const pronto = Boolean(contratoId && competencia);

  const gerarCarne = async () => {
    if (!pronto || salvando) return;
    setSalvando(true);
    try {
      const { id } = await apiFetch('/carnes/index.php', {
        method: 'POST',
        body: { contratoId, competenciaInicial: competencia, parcelas: parcelasSelecionadas },
      });
      toast(`Carnê ${id} gerado. Registro adicionado ao histórico do cliente.`);
      reloadCarnes();
      setContratoId('');
    } catch (err) {
      toast(err.message, { kind: 'danger' });
    } finally {
      setSalvando(false);
    }
  };

  const [planoLote, setPlanoLote] = useState('');
  const [competenciaLote, setCompetenciaLote] = useState('2026-09');
  const [gerandoLote, setGerandoLote] = useState(false);

  const gerarLote = async () => {
    if (gerandoLote) return;
    setGerandoLote(true);
    try {
      const { total } = await apiFetch('/carnes/lote.php', {
        method: 'POST',
        body: { competenciaInicial: competenciaLote, parcelas: 12, planoId: planoLote || null },
      });
      toast(`${total} carnês gerados em lote e adicionados ao histórico.`);
      reloadCarnes();
      setLote(false);
    } catch (err) {
      toast(err.message, { kind: 'danger' });
    } finally {
      setGerandoLote(false);
    }
  };

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
            <Select label="Contrato" value={contratoId} onChange={(e) => setContratoId(e.target.value)}>
              <option value="">Selecione um contrato…</option>
              {contratosAtivos.map((c) => <option key={c.id} value={c.id}>{c.id} — {clienteById(c.clienteId)?.nome}</option>)}
            </Select>
            <Select label="Período" value={periodo} onChange={(e) => setPeriodo(e.target.value)} options={PERIODOS.map((p) => p.label)} />
            <Input label="Primeira competência" type="month" value={competencia} onChange={(e) => setCompetencia(e.target.value)} />
          </div>
          <Checkbox label="Enviar automaticamente por e-mail ao cliente" defaultChecked />
          <div className="row" style={{ gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
            <Button variant="secondary" disabled={!contratoId} onClick={() => setPreview({
              id: 'Pré-visualização', clienteNome: clienteById(contratos.find((c) => c.id === contratoId)?.clienteId)?.nome,
              contratoId, parcelas: parcelasSelecionadas, valorParcela: planos.find((p) => p.id === contratos.find((c) => c.id === contratoId)?.planoId)?.valorMensal || 0,
              competenciaInicial: periodo,
            })}>Pré-visualizar</Button>
            <Button variant="primary" icon="receipt" disabled={!pronto} loading={salvando} onClick={gerarCarne}>Gerar e enviar</Button>
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
            <Button size="sm" variant="primary" loading={gerandoLote} onClick={gerarLote}>Gerar lote</Button>
          </>}>
          <div className="field-grid">
            <Select label="Filtro de contratos" value={planoLote} onChange={(e) => setPlanoLote(e.target.value)}>
              <option value="">Todos os ativos</option>
              {planos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </Select>
            <Input label="Primeira competência" type="month" value={competenciaLote} onChange={(e) => setCompetenciaLote(e.target.value)} />
          </div>
          <Checkbox label="Enviar por e-mail ao concluir a geração" defaultChecked />
        </Modal>
      )}
    </>
  );
}
