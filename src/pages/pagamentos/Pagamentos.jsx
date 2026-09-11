import { useState } from 'react';
import { PageHeader } from '../../components/index.js';
import {
  Card, Tabs, DataTable, StatusMenu, Button, StatCard, Alert, Modal, Textarea, Input, Select, DefList, Drawer,
} from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import useRowStatus from '../../hooks/useRowStatus.js';
import { pagamentos, filaExcecoes, logApiBancaria } from '../../mock/pagamentos.js';
import { clientes } from '../../mock/clientes.js';
import { contratosDoCliente, parcelasDoContrato } from '../../mock/contratos.js';
import { money, dateTime, date, number } from '../../lib/format.js';
import { maskMoney, moneyToNumber, numberToMoneyInput } from '../../lib/masks.js';
import { STATUS_SETS } from '../../lib/status.js';

const TABS = [
  { id: 'conciliacao', label: 'Conciliação' },
  { id: 'excecoes', label: 'Fila de exceções' },
  { id: 'log', label: 'Log da API bancária' },
];

export default function Pagamentos() {
  const { toast } = useToast();
  const [tab, setTab] = useState('conciliacao');
  const [pagamentosRows, setPagamentoStatus] = useRowStatus(pagamentos);
  const [excecao, setExcecao] = useState(null);
  const [pagamentoDetalhe, setPagamentoDetalhe] = useState(null);

  const [baixa, setBaixa] = useState(false);
  const [clienteBaixaId, setClienteBaixaId] = useState('');
  const [contratoBaixa, setContratoBaixa] = useState(null);
  const [buscouBaixa, setBuscouBaixa] = useState(false);
  const [parcelaId, setParcelaId] = useState('');
  const [valorBaixa, setValorBaixa] = useState('');
  const [dataBaixa, setDataBaixa] = useState('2026-08-27');
  const [justificativaBaixa, setJustificativaBaixa] = useState('');

  const excecoes = filaExcecoes();
  const conciliados = pagamentos.filter((p) => p.status === 'Conciliado');
  const totalConciliado = conciliados.reduce((s, p) => s + p.valor, 0);

  const clienteBaixa = clientes.find((c) => c.id === clienteBaixaId);
  const parcelas = contratoBaixa ? parcelasDoContrato(contratoBaixa) : [];
  const parcelaSelecionada = parcelas.find((p) => p.id === parcelaId);

  const fecharBaixa = () => {
    setBaixa(false);
    setClienteBaixaId(''); setContratoBaixa(null); setBuscouBaixa(false);
    setParcelaId(''); setValorBaixa(''); setDataBaixa('2026-08-27'); setJustificativaBaixa('');
  };

  const buscarContratoBaixa = () => {
    const c = clienteBaixa ? contratosDoCliente(clienteBaixa.id)[0] : null;
    setContratoBaixa(c || null);
    setBuscouBaixa(true);
    setParcelaId(''); setValorBaixa('');
  };

  const selecionarParcela = (id) => {
    setParcelaId(id);
    const p = parcelas.find((x) => x.id === id);
    if (p) setValorBaixa(numberToMoneyInput(p.valor));
  };

  const baixaValida = Boolean(parcelaSelecionada) && moneyToNumber(valorBaixa) > 0 && dataBaixa && justificativaBaixa.trim().length >= 10;

  const confirmarBaixa = () => {
    if (!baixaValida) return;
    toast(`Baixa manual da parcela ${parcelaSelecionada.competencia} registrada com usuário responsável e data/hora (RN-04).`);
    fecharBaixa();
  };

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Pagamentos' }]}
        title="Pagamento Integrado com Banco"
        subtitle="Boletos e Pix com conciliação automática pelo identificador da cobrança e atualização em tempo real da situação do plano."
        actions={<Button variant="secondary" icon="cash" onClick={() => setBaixa(true)}>Baixa manual</Button>}
      />

      <div className="grid cols-3">
        <StatCard label="Conciliados (período)" value={number(conciliados.length)} icon="check-circle" tone="success" foot={money(totalConciliado)} />
        <StatCard label="Exceções de conciliação" value={number(excecoes.length)} icon="alert" tone="danger" />
        <StatCard label="Chamadas à API hoje" value={number(logApiBancaria.filter((l) => l.quando.startsWith('2026-08-27')).length)} icon="refresh" tone="info" />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'conciliacao' && (
        <Card>
          <DataTable
            rows={pagamentosRows}
            searchKeys={['id', 'clienteNome', 'parcelaRef']}
            pageSize={12}
            onRowClick={(r) => setPagamentoDetalhe(r)}
            columns={[
              { key: 'id', header: 'Pagamento', sortable: true },
              { key: 'clienteNome', header: 'Cliente / origem', sortable: true },
              { key: 'parcelaRef', header: 'Parcela', render: (r) => r.parcelaRef || '—' },
              { key: 'meio', header: 'Meio' },
              { key: 'recebidoEm', header: 'Recebido em', sortable: true, render: (r) => dateTime(r.recebidoEm) },
              { key: 'valor', header: 'Valor', align: 'right', sortable: true, render: (r) => money(r.valor) },
              { key: 'status', header: 'Status', sortable: true, render: (r) => (
                <StatusMenu
                  value={r.status}
                  options={STATUS_SETS.pagamento}
                  onChange={(next) => { setPagamentoStatus(r.id, next); toast(`Pagamento ${r.id} definido como "${next}".`); }}
                />
              ) },
            ]}
          />
        </Card>
      )}

      {tab === 'excecoes' && (
        <>
          <Alert variant="warning" title="Regras de negócio">
            RN-04: nenhuma baixa é definitiva sem usuário responsável e data/hora. RN-05: pagamento em duplicidade gera crédito na conta do cliente, não baixa dupla.
          </Alert>
          <Card>
            <DataTable
              searchable={false}
              rows={excecoes}
              onRowClick={(r) => setExcecao(r)}
              columns={[
                { key: 'id', header: 'Pagamento' },
                { key: 'clienteNome', header: 'Origem' },
                { key: 'meio', header: 'Meio' },
                { key: 'recebidoEm', header: 'Recebido em', render: (r) => dateTime(r.recebidoEm) },
                { key: 'valor', header: 'Valor', align: 'right', render: (r) => money(r.valor) },
              ]}
            />
          </Card>
        </>
      )}

      {tab === 'log' && (
        <Card title="Log de chamadas à API bancária (auditoria)">
          <table className="data-table">
            <thead><tr><th>Quando</th><th>Endpoint</th><th>Método</th><th className="num">HTTP</th><th>Resultado</th></tr></thead>
            <tbody>
              {logApiBancaria.map((l, i) => (
                <tr key={i}>
                  <td className="num">{dateTime(l.quando)}</td>
                  <td><code>{l.endpoint}</code></td>
                  <td>{l.metodo}</td>
                  <td className="num" style={{ color: l.http >= 500 ? 'var(--canaa-danger-600)' : l.http >= 300 ? 'var(--canaa-warning-600)' : 'inherit' }}>{l.http}</td>
                  <td>{l.resultado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {pagamentoDetalhe && (
        <Drawer title={`Pagamento ${pagamentoDetalhe.id}`} onClose={() => setPagamentoDetalhe(null)}>
          <DefList items={[
            { label: 'Cliente / origem', value: pagamentoDetalhe.clienteNome },
            { label: 'Parcela', value: pagamentoDetalhe.parcelaRef || '—' },
            { label: 'Meio', value: pagamentoDetalhe.meio },
            { label: 'Valor recebido', value: money(pagamentoDetalhe.valor) },
            { label: 'Recebido em', value: dateTime(pagamentoDetalhe.recebidoEm) },
            { label: 'Identificador', value: pagamentoDetalhe.identificador },
            { label: 'Status', value: pagamentoDetalhe.status },
            { label: 'Observação', value: pagamentoDetalhe.observacao || '—' },
          ]} />
        </Drawer>
      )}

      {excecao && (
        <Drawer title={`Exceção — ${excecao.id}`} onClose={() => setExcecao(null)}
          actions={<Button size="sm" variant="primary" onClick={() => { toast('Exceção tratada e vinculada manualmente (simulação).'); setExcecao(null); }}>Tratar</Button>}>
          <Alert variant="danger" title="Pagamento sem parcela correspondente">{excecao.observacao}</Alert>
          <DefList items={[
            { label: 'Identificador', value: excecao.identificador },
            { label: 'Meio', value: excecao.meio },
            { label: 'Valor', value: money(excecao.valor) },
            { label: 'Recebido em', value: dateTime(excecao.recebidoEm) },
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
              <Button size="sm" variant="primary" disabled={!baixaValida} onClick={confirmarBaixa}>Confirmar baixa</Button>
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
                {parcelas.map((p) => (
                  <option key={p.id} value={p.id}>{p.competencia} — vence {date(p.vencimento)} — {p.status}</option>
                ))}
              </Select>
            )}

            {parcelaSelecionada && (
              <>
                <div className="field-grid">
                  <Input label="Valor recebido" value={valorBaixa} onChange={(e) => setValorBaixa(maskMoney(e.target.value))} placeholder="R$ 0,00" />
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
