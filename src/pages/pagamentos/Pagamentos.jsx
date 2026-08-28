import { useState } from 'react';
import { PageHeader } from '../../components/index.js';
import {
  Card, Tabs, DataTable, StatusMenu, Button, StatCard, Alert, Modal, Textarea, Input, DefList, Drawer,
} from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import useRowStatus from '../../hooks/useRowStatus.js';
import { pagamentos, filaExcecoes, logApiBancaria } from '../../mock/pagamentos.js';
import { money, dateTime, number } from '../../lib/format.js';
import { STATUS_SETS } from '../../lib/status.js';

const TABS = [
  { id: 'conciliacao', label: 'Conciliação' },
  { id: 'excecoes', label: 'Fila de exceções' },
  { id: 'log', label: 'Log da API bancária' },
];

export default function Pagamentos() {
  const { toast } = useToast();
  const [tab, setTab] = useState('conciliacao');
  const [baixa, setBaixa] = useState(false);
  const [pagamentosRows, setPagamentoStatus] = useRowStatus(pagamentos);
  const [excecao, setExcecao] = useState(null);

  const excecoes = filaExcecoes();
  const conciliados = pagamentos.filter((p) => p.status === 'Conciliado');
  const totalConciliado = conciliados.reduce((s, p) => s + p.valor, 0);

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
        <Modal title="Baixa manual de pagamento" onClose={() => setBaixa(false)}
          footer={<>
            <Button size="sm" variant="secondary" onClick={() => setBaixa(false)}>Cancelar</Button>
            <Button size="sm" variant="primary" onClick={() => { toast('Baixa manual registrada com usuário responsável e data/hora (RN-04).'); setBaixa(false); }}>Confirmar baixa</Button>
          </>}>
          <div className="field-grid">
            <Input label="Parcela / cobrança" placeholder="CTR-2026-....-P.." />
            <Input label="Valor recebido" placeholder="R$" />
            <Input label="Data do recebimento" type="date" defaultValue="2026-08-27" />
          </div>
          <Textarea label="Justificativa (obrigatória)" placeholder="Pagamento por fora — dinheiro / transferência direta…" />
        </Modal>
      )}
    </>
  );
}
