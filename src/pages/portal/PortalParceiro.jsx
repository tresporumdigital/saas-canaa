import { useState } from 'react';
import { PageHeader } from '../../components/index.js';
import {
  Card, Tabs, DataTable, Badge, Button, StatCard, Alert, Input, Select, Textarea, Checkbox, DefList, CoverageBanner,
} from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useRole } from '../../context/RoleContext.jsx';
import { parceiroById } from '../../mock/parceiros.js';
import { baixasDoParceiro, extratoParceiro } from '../../mock/portal.js';
import { clientes } from '../../mock/clientes.js';
import { contratosDoCliente } from '../../mock/contratos.js';
import { planoById } from '../../mock/planos.js';
import { money, dateTime, cpf } from '../../lib/format.js';
import { statusVariant } from '../../lib/status.js';

// Persona de parceiro do protótipo
const PARCEIRO_DEMO = 'PAR-003';

const TABS = [
  { id: 'consulta', label: 'Consultar plano' },
  { id: 'baixa', label: 'Registrar baixa' },
  { id: 'extrato', label: 'Meu extrato' },
  { id: 'auditoria', label: 'Log de auditoria' },
];

export default function PortalParceiro() {
  const { toast } = useToast();
  const { role } = useRole();
  const [tab, setTab] = useState('consulta');
  const [busca, setBusca] = useState('');
  const [resultado, setResultado] = useState(null);

  const parceiro = parceiroById(PARCEIRO_DEMO);
  const baixas = baixasDoParceiro(parceiro.id);
  const extrato = extratoParceiro(parceiro.id);

  const consultar = (e) => {
    e.preventDefault();
    const termo = busca.replace(/\D/g, '');
    const cli = clientes.find((c) => c.cpf.includes(termo) || c.nome.toLowerCase().includes(busca.toLowerCase()));
    if (!cli) { setResultado({ erro: true }); return; }
    const ct = contratosDoCliente(cli.id)[0];
    setResultado({
      nome: cli.nome,
      cpf: cli.cpf,
      plano: ct ? planoById(ct.planoId) : null,
      contrato: ct,
    });
  };

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Portal do Parceiro' }]}
        title="Portal do Parceiro"
        subtitle={`Acesso de ${parceiro.nomeFantasia} — consulta de planos, baixa de atendimentos e extrato de valores a receber.`}
        actions={<Badge variant="info">{role.id === 'parceiro' ? 'Sessão de parceiro' : 'Pré-visualização (interno)'}</Badge>}
      />

      <Alert variant="info" title="Visão restrita (RN-06)">
        O parceiro vê apenas o necessário para o atendimento — cobertura e situação do plano. Não há acesso a dados financeiros internos nem a outros parceiros.
      </Alert>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'consulta' && (
        <>
          <Card title="Consultar situação do plano">
            <form className="row" style={{ alignItems: 'flex-end', gap: 'var(--space-3)' }} onSubmit={consultar}>
              <div style={{ flex: 1 }}>
                <Input label="CPF do titular ou número do contrato" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="000.000.000-00 ou CTR-2026-...." />
              </div>
              <Button variant="primary" type="submit">Consultar</Button>
            </form>
          </Card>

          {resultado?.erro && <Alert variant="warning" title="Nenhum plano encontrado">Confira o CPF ou o número do contrato informado.</Alert>}

          {resultado && !resultado.erro && (
            <Card title="Resultado da consulta" className="anim-fade-up">
              <DefList items={[
                { label: 'Titular', value: resultado.nome },
                { label: 'CPF', value: cpf(resultado.cpf) },
                { label: 'Plano', value: resultado.plano?.nome || 'Sem plano' },
                { label: 'Contrato', value: resultado.contrato?.id || '—' },
                { label: 'Situação', value: resultado.contrato ? <Badge variant={statusVariant(resultado.contrato.situacao)}>{resultado.contrato.situacao}</Badge> : '—' },
              ]} />
              {resultado.contrato && (
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <CoverageBanner checks={[
                    { label: 'Plano ativo', state: resultado.contrato.situacao === 'Ativo' || resultado.contrato.situacao === 'Em atraso' ? 'ok' : 'bad' },
                    { label: 'Serviços cobertos', state: 'ok', detail: parceiro.acordo.servicosCobertos.join(', ') },
                    { label: 'Adimplência', state: resultado.contrato.situacao === 'Ativo' ? 'ok' : 'warn', detail: resultado.contrato.situacao === 'Ativo' ? 'em dia' : 'consultar central antes de executar' },
                  ]} />
                </div>
              )}
            </Card>
          )}
        </>
      )}

      {tab === 'baixa' && (
        <Card title="Registrar baixa de atendimento">
          <div className="field-grid">
            <Input label="CPF do titular / contrato" placeholder="000.000.000-00" />
            <Select label="Serviço prestado" options={parceiro.acordo.servicosCobertos} />
            <Input label="Data/hora do atendimento" type="datetime-local" defaultValue="2026-08-27T10:00" />
            <Input label="Valor" placeholder="R$" />
          </div>
          <Checkbox label="Anexar comprovante" />
          <Textarea label="Observações" />
          <Alert variant="warning" title="Aprovação interna">
            Baixas acima de {money(1500)} ou fora da cobertura exigem aprovação interna antes de entrar no extrato. Baixa registrada não pode ser excluída — apenas estornada por usuário interno (RN-07).
          </Alert>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="primary" onClick={() => toast('Baixa registrada. Reflete imediatamente no histórico do cliente e no seu fechamento (simulação).')}>Registrar baixa</Button>
          </div>
        </Card>
      )}

      {tab === 'extrato' && (
        <>
          <div className="grid cols-2">
            <StatCard label="Total a receber (aprovado)" value={money(extrato.total)} icon="wallet" tone="success" />
            <StatCard label="Atendimentos no período" value={extrato.itens.length} icon="doc" />
          </div>
          <Card title="Extrato de atendimentos">
            <DataTable
              searchable={false}
              rows={baixas}
              columns={[
                { key: 'id', header: 'Baixa' },
                { key: 'clienteNome', header: 'Cliente' },
                { key: 'servicoPrestado', header: 'Serviço' },
                { key: 'dataHora', header: 'Data/hora', render: (r) => dateTime(r.dataHora) },
                { key: 'valor', header: 'Valor', align: 'right', render: (r) => money(r.valor) },
                { key: 'status', header: 'Status', render: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge> },
              ]}
            />
          </Card>
        </>
      )}

      {tab === 'auditoria' && (
        <Card title="Log de auditoria das minhas baixas">
          <table className="data-table">
            <thead><tr><th>Baixa</th><th>Data/hora</th><th>Usuário do portal</th><th>IP</th></tr></thead>
            <tbody>
              {baixas.map((b) => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td className="num">{dateTime(b.dataHora)}</td>
                  <td>{b.usuarioPortal}</td>
                  <td className="num">{b.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
