import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader.jsx';
import {
  Card, Tabs, DataTable, Badge, Button, StatCard, Drawer, DefList, Select, Alert,
} from '../../components/ui/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { leads } from '../../mock/leads.js';
import { dateTime, phone, percent, number } from '../../lib/format.js';
import { statusVariant } from '../../lib/status.js';

const TABS = [
  { id: 'fila', label: 'Fila de leads' },
  { id: 'conversao', label: 'Relatório de conversão' },
];

export default function LeadsHome() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState('fila');
  const [lead, setLead] = useState(null);
  const [origem, setOrigem] = useState('');

  const filtered = useMemo(() => leads.filter((l) => !origem || l.origem === origem), [origem]);
  const novos = leads.filter((l) => l.status === 'Novo').length;
  const convertidos = leads.filter((l) => l.status === 'Convertido').length;
  const taxa = convertidos / leads.length;

  const porOrigem = Object.values(leads.reduce((acc, l) => {
    acc[l.origem] = acc[l.origem] || { origem: l.origem, total: 0, conv: 0 };
    acc[l.origem].total += 1;
    if (l.status === 'Convertido') acc[l.origem].conv += 1;
    return acc;
  }, {}));

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Leads do Site' }]}
        title="Integração com o Site — Leads"
        subtitle="Submissões dos formulários do site institucional viram leads rastreáveis, com origem, página e consentimento LGPD."
      />

      <div className="grid cols-3">
        <StatCard label="Leads novos" value={number(novos)} icon="flag" tone="info" />
        <StatCard label="Convertidos" value={number(convertidos)} icon="check-circle" tone="success" />
        <StatCard label="Taxa de conversão" value={percent(taxa)} icon="trend" />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'fila' && (
        <Card>
          <DataTable
            rows={filtered}
            searchKeys={['nome', 'email', 'origem', 'paginaOrigem']}
            onRowClick={(r) => setLead(r)}
            pageSize={12}
            toolbarExtra={
              <Select value={origem} onChange={(e) => setOrigem(e.target.value)} aria-label="Filtrar por origem">
                <option value="">Todas as origens</option>
                {['Formulário de contato', 'Simulação de plano', 'Interesse em equipamento'].map((o) => <option key={o}>{o}</option>)}
              </Select>
            }
            columns={[
              { key: 'id', header: 'Lead', sortable: true },
              { key: 'nome', header: 'Nome', sortable: true },
              { key: 'origem', header: 'Origem' },
              { key: 'paginaOrigem', header: 'Página' },
              { key: 'recebidoEm', header: 'Recebido em', sortable: true, render: (r) => dateTime(r.recebidoEm) },
              { key: 'status', header: 'Status', sortable: true, render: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge> },
            ]}
          />
        </Card>
      )}

      {tab === 'conversao' && (
        <Card title="Conversão por origem">
          <table className="data-table">
            <thead><tr><th>Origem</th><th className="num">Leads</th><th className="num">Convertidos</th><th className="num">Taxa</th></tr></thead>
            <tbody>
              {porOrigem.map((r) => (
                <tr key={r.origem}>
                  <td>{r.origem}</td>
                  <td className="num">{r.total}</td>
                  <td className="num">{r.conv}</td>
                  <td className="num">{percent(r.conv / r.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {lead && (
        <Drawer title={`Lead ${lead.id}`} onClose={() => setLead(null)}
          actions={
            lead.status === 'Convertido' ? (
              <Button size="sm" variant="secondary" onClick={() => navigate(`/clientes/${lead.clienteId}`)}>Abrir cliente</Button>
            ) : (
              <Button size="sm" variant="primary" onClick={() => { toast('Lead convertido em cliente sem redigitação dos dados (simulação).'); setLead(null); }}>Converter em cliente</Button>
            )
          }>
          {!lead.consentimentoLGPD && (
            <Alert variant="warning" title="Sem consentimento LGPD">O lead não registrou consentimento no formulário. Contato apenas para responder à solicitação.</Alert>
          )}
          <DefList items={[
            { label: 'Nome', value: lead.nome },
            { label: 'Telefone', value: phone(lead.telefone) },
            { label: 'E-mail', value: lead.email },
            { label: 'Origem', value: lead.origem },
            { label: 'Página de origem', value: lead.paginaOrigem },
            { label: 'Recebido em', value: dateTime(lead.recebidoEm) },
            { label: 'Consentimento LGPD', value: lead.consentimentoLGPD ? 'Registrado' : 'Não registrado' },
            { label: 'Status', value: lead.status + (lead.motivoPerda ? ` — ${lead.motivoPerda}` : '') },
          ]} />
          <Card title="Mensagem"><p style={{ fontSize: 'var(--text-sm)' }}>{lead.mensagem}</p></Card>
        </Drawer>
      )}
    </>
  );
}
