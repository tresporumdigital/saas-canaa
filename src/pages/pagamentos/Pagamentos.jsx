import { useState } from 'react';
import { PageHeader } from '../../components/index.js';
import {
  Card, DataTable, Badge, Button, StatCard, Alert, Modal, Textarea, Input, Select, DefList, Drawer,
} from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { apiFetch, reloadContratosCache, useClientesCache, useContratosCache, usePagamentosList } from '../../lib/api.js';
import { parcelasEmAbertoTotal, inPeriodo } from '../../mock/index.js';
import { money, dateTime, date, number } from '../../lib/format.js';
import { maskMoney, moneyToNumber, numberToMoneyInput } from '../../lib/masks.js';
import { statusVariant } from '../../lib/status.js';

const MEIOS = ['Boleto', 'Pix', 'Dinheiro', 'Transferência', 'Cartão recorrente'];

export default function Pagamentos() {
  const { toast } = useToast();
  const clientes = useClientesCache();
  const contratos = useContratosCache();
  const { rows: pagamentosReais, reload: reloadPagamentos } = usePagamentosList();
  const [pagamentoDetalhe, setPagamentoDetalhe] = useState(null);

  const [baixa, setBaixa] = useState(false);
  const [clienteBaixaId, setClienteBaixaId] = useState('');
  const [contratoBaixa, setContratoBaixa] = useState(null);
  const [buscouBaixa, setBuscouBaixa] = useState(false);
  const [parcelas, setParcelas] = useState([]);
  const [parcelaId, setParcelaId] = useState('');
  const [valorBaixa, setValorBaixa] = useState('');
  const [meioBaixa, setMeioBaixa] = useState('Boleto');
  const [dataBaixa, setDataBaixa] = useState('2026-08-27');
  const [justificativaBaixa, setJustificativaBaixa] = useState('');
  const [salvandoBaixa, setSalvandoBaixa] = useState(false);

  const recebidoNoMes = pagamentosReais
    .filter((p) => inPeriodo(p.recebidoEm, 'mes'))
    .reduce((s, p) => s + p.valor, 0);
  const baixasNoMes = pagamentosReais.filter((p) => inPeriodo(p.recebidoEm, 'mes')).length;

  const clienteBaixa = clientes.find((c) => c.id === clienteBaixaId);
  const parcelaSelecionada = parcelas.find((p) => p.id === parcelaId);

  const fecharBaixa = () => {
    setBaixa(false);
    setClienteBaixaId(''); setContratoBaixa(null); setBuscouBaixa(false);
    setParcelas([]); setParcelaId(''); setValorBaixa(''); setMeioBaixa('Boleto');
    setDataBaixa('2026-08-27'); setJustificativaBaixa('');
  };

  const buscarContratoBaixa = async () => {
    const c = clienteBaixa ? contratos.find((ct) => ct.clienteId === clienteBaixa.id) : null;
    setContratoBaixa(c || null);
    setBuscouBaixa(true);
    setParcelas([]); setParcelaId(''); setValorBaixa('');
    if (c) {
      try {
        const full = await apiFetch(`/contratos/detail.php?id=${encodeURIComponent(c.id)}`);
        setParcelas(full.parcelas);
      } catch {
        setParcelas([]);
      }
    }
  };

  const selecionarParcela = (id) => {
    setParcelaId(id);
    const p = parcelas.find((x) => x.id === id);
    if (p) {
      setValorBaixa(numberToMoneyInput(p.valor));
      if (p.forma) setMeioBaixa(p.forma);
    }
  };

  const baixaValida = Boolean(parcelaSelecionada) && moneyToNumber(valorBaixa) > 0 && dataBaixa && justificativaBaixa.trim().length >= 10;

  const confirmarBaixa = async () => {
    if (!baixaValida || salvandoBaixa) return;
    setSalvandoBaixa(true);
    try {
      await apiFetch('/pagamentos/index.php', {
        method: 'POST',
        body: {
          parcelaId: parcelaSelecionada.id, valor: moneyToNumber(valorBaixa),
          meio: meioBaixa, data: dataBaixa, justificativa: justificativaBaixa,
        },
      });
      toast(`Baixa manual da parcela ${parcelaSelecionada.competencia} registrada com usuário responsável e data/hora (RN-04).`);
      reloadPagamentos();
      reloadContratosCache();
      fecharBaixa();
    } catch (e) {
      toast(e.message, { kind: 'danger' });
    } finally {
      setSalvandoBaixa(false);
    }
  };

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Pagamentos' }]}
        title="Pagamentos"
        subtitle="Histórico de baixas registradas manualmente pela equipe, com usuário responsável e data/hora de cada uma (RN-04)."
        actions={<Button variant="secondary" icon="cash" onClick={() => setBaixa(true)}>Baixa manual</Button>}
      />

      <div className="grid cols-3">
        <StatCard label="Recebido no mês" value={money(recebidoNoMes)} icon="cash" tone="success" />
        <StatCard label="Baixas registradas no mês" value={number(baixasNoMes)} icon="check-circle" tone="info" />
        <StatCard label="Parcelas em aberto" value={number(parcelasEmAbertoTotal(contratos))} icon="receipt" tone="warning" />
      </div>

      <Card>
        <DataTable
          rows={pagamentosReais}
          searchKeys={['id', 'clienteNome', 'parcelaRef']}
          pageSize={12}
          onRowClick={(r) => setPagamentoDetalhe(r)}
          columns={[
            { key: 'id', header: 'Pagamento', sortable: true },
            { key: 'clienteNome', header: 'Cliente', sortable: true },
            { key: 'parcelaRef', header: 'Parcela', render: (r) => r.parcelaRef || '—' },
            { key: 'meio', header: 'Meio' },
            { key: 'recebidoEm', header: 'Recebido em', sortable: true, render: (r) => dateTime(r.recebidoEm) },
            { key: 'valor', header: 'Valor', align: 'right', sortable: true, render: (r) => money(r.valor) },
            { key: 'status', header: 'Status', render: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge> },
          ]}
        />
      </Card>

      {pagamentoDetalhe && (
        <Drawer title={`Pagamento ${pagamentoDetalhe.id}`} onClose={() => setPagamentoDetalhe(null)}>
          <DefList items={[
            { label: 'Cliente', value: pagamentoDetalhe.clienteNome },
            { label: 'Parcela', value: pagamentoDetalhe.parcelaRef || '—' },
            { label: 'Meio', value: pagamentoDetalhe.meio },
            { label: 'Valor recebido', value: money(pagamentoDetalhe.valor) },
            { label: 'Recebido em', value: dateTime(pagamentoDetalhe.recebidoEm) },
            { label: 'Status', value: pagamentoDetalhe.status },
            { label: 'Registrado por', value: pagamentoDetalhe.registradoPor || '—' },
            { label: 'Observação', value: pagamentoDetalhe.observacao || '—' },
          ]} />
        </Drawer>
      )}

      {baixa && (
        <Modal
          title="Baixa manual de pagamento"
          onClose={fecharBaixa}
          wide
          footer={(
            <>
              <Button size="sm" variant="secondary" onClick={fecharBaixa}>Cancelar</Button>
              <Button size="sm" variant="primary" disabled={!baixaValida} loading={salvandoBaixa} onClick={confirmarBaixa}>Confirmar baixa</Button>
            </>
          )}
        >
          <div className="stack" style={{ gap: 'var(--space-4)' }}>
            <div>
              <div className="card-title">Contrato</div>
              <Select
                label="Titular do contrato"
                value={clienteBaixaId}
                onChange={(e) => { setClienteBaixaId(e.target.value); setBuscouBaixa(false); setContratoBaixa(null); setParcelaId(''); setValorBaixa(''); }}
              >
                <option value="">Selecione um cliente…</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </Select>
              <div style={{ marginTop: 'var(--space-3)' }}>
                <Button variant="secondary" icon="search" type="button" onClick={buscarContratoBaixa} disabled={!clienteBaixaId}>Buscar</Button>
              </div>
              {buscouBaixa && contratoBaixa && (
                <Alert variant="info" title={`Contrato nº ${contratoBaixa.id}`}>Situação: {contratoBaixa.situacao}</Alert>
              )}
              {buscouBaixa && !contratoBaixa && (
                <Alert variant="warning">Este cliente não possui contrato de plano.</Alert>
              )}
            </div>

            {contratoBaixa && (
              <Select label="Parcela" value={parcelaId} onChange={(e) => selecionarParcela(e.target.value)}>
                <option value="">Selecione a parcela…</option>
                {parcelas.filter((p) => p.status !== 'Pago').map((p) => (
                  <option key={p.id} value={p.id}>{p.competencia} — vence {date(p.vencimento)} — {p.status}</option>
                ))}
              </Select>
            )}

            {parcelaSelecionada && (
              <>
                <div className="field-grid">
                  <Input label="Valor recebido" value={valorBaixa} onChange={(e) => setValorBaixa(maskMoney(e.target.value))} placeholder="R$ 0,00" />
                  <Select label="Meio de pagamento" value={meioBaixa} onChange={(e) => setMeioBaixa(e.target.value)} options={MEIOS} />
                  <Input label="Data do recebimento" type="date" value={dataBaixa} onChange={(e) => setDataBaixa(e.target.value)} />
                </div>
                <Textarea
                  label="Justificativa (obrigatória)"
                  value={justificativaBaixa}
                  onChange={(e) => setJustificativaBaixa(e.target.value)}
                  placeholder="Pagamento por fora — dinheiro / transferência direta…"
                  hint={justificativaBaixa.trim().length < 10 ? 'Mínimo de 10 caracteres.' : ' '}
                />
              </>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
