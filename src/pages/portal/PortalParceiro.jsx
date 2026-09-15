import { useState } from 'react';
import { PageHeader } from '../../components/index.js';
import {
  Card, Tabs, DataTable, Badge, Button, StatCard, Alert, Input, Select, Textarea, Checkbox, DefList, CoverageBanner, StatusMenu, EmptyState,
} from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useRole } from '../../context/RoleContext.jsx';
import {
  apiFetch, useBaixasParceiroCacheState, useClientesCache, useContratosCache, useParceirosCache, usePlanosCache,
} from '../../lib/api.js';
import { money, dateTime, cpf } from '../../lib/format.js';
import { maskMoney, moneyToNumber } from '../../lib/masks.js';
import { statusVariant } from '../../lib/status.js';

const TABS = [
  { id: 'consulta', label: 'Consultar plano' },
  { id: 'baixa', label: 'Registrar baixa' },
  { id: 'extrato', label: 'Meu extrato' },
  { id: 'auditoria', label: 'Log de auditoria' },
];

const baixaVazia = { servico: '', dataHora: '2026-09-15T10:00', valor: '', comprovante: false, observacoes: '' };

export default function PortalParceiro() {
  const { toast } = useToast();
  const { role } = useRole();
  const [tab, setTab] = useState('consulta');
  const [busca, setBusca] = useState('');
  const [resultado, setResultado] = useState(null);
  const clientes = useClientesCache();
  const parceiros = useParceirosCache();
  const contratos = useContratosCache();
  const planosProduto = usePlanosCache();
  const planoById = (id) => planosProduto.find((p) => p.id === id);
  const { rows: baixasTodas, reload: reloadBaixas } = useBaixasParceiroCacheState();

  // Persona de demonstração: primeiro parceiro cadastrado (sem login próprio de parceiro — ver RF-104).
  const parceiro = parceiros[0] || null;

  // ---- Registrar baixa ----
  const [buscaBaixa, setBuscaBaixa] = useState('');
  const [clienteBaixa, setClienteBaixa] = useState(null);
  const [formBaixa, setFormBaixa] = useState(baixaVazia);
  const [salvandoBaixa, setSalvandoBaixa] = useState(false);

  const buscarCliente = (termo) => {
    const digitos = termo.replace(/\D/g, '');
    const cli = clientes.find((c) => c.cpf.includes(digitos) || c.nome.toLowerCase().includes(termo.toLowerCase()));
    if (!cli) return null;
    const ct = contratos.find((c) => c.clienteId === cli.id);
    return { cliente: cli, contrato: ct };
  };

  if (!parceiro) {
    return <EmptyState icon="briefcase" title="Nenhum parceiro cadastrado" action={<Button to="/parceiros">Ir para Parceiros</Button>} />;
  }
  const baixas = baixasTodas.filter((b) => b.parceiroId === parceiro.id);
  const extrato = {
    itens: baixas.filter((b) => b.status === 'Aprovado'),
    total: baixas.filter((b) => b.status === 'Aprovado').reduce((s, b) => s + b.valor, 0),
  };

  const consultar = (e) => {
    e.preventDefault();
    const r = buscarCliente(busca);
    setResultado(r ? { nome: r.cliente.nome, cpf: r.cliente.cpf, plano: r.contrato ? planoById(r.contrato.planoId) : null, contrato: r.contrato } : { erro: true });
  };

  const buscarParaBaixa = (e) => {
    e.preventDefault();
    const r = buscarCliente(buscaBaixa);
    setClienteBaixa(r && r.contrato ? r : { erro: true });
  };

  const registrarBaixa = async () => {
    if (salvandoBaixa || !clienteBaixa?.contrato) return;
    setSalvandoBaixa(true);
    try {
      const { id, status } = await apiFetch('/portal/baixas.php', {
        method: 'POST',
        body: {
          parceiroId: parceiro.id,
          clienteId: clienteBaixa.cliente.id,
          contratoId: clienteBaixa.contrato.id,
          servicoPrestado: formBaixa.servico,
          dataHora: formBaixa.dataHora,
          valor: moneyToNumber(formBaixa.valor),
          comprovante: formBaixa.comprovante,
          observacoes: formBaixa.observacoes,
        },
      });
      toast(status === 'Aprovado'
        ? `Baixa ${id} registrada e já reflete no seu extrato.`
        : `Baixa ${id} registrada — acima de ${money(1500)}, aguardando aprovação interna antes de entrar no extrato.`);
      reloadBaixas();
      setClienteBaixa(null);
      setBuscaBaixa('');
      setFormBaixa(baixaVazia);
    } catch (err) {
      toast(err.message, { kind: 'danger' });
    } finally {
      setSalvandoBaixa(false);
    }
  };

  const alterarStatusBaixa = async (b, next) => {
    try {
      await apiFetch(`/portal/baixas_status.php?id=${encodeURIComponent(b.id)}`, { method: 'PATCH', body: { status: next } });
      toast(`Baixa ${b.id} definida como "${next}".`);
      reloadBaixas();
    } catch (err) {
      toast(err.message, { kind: 'danger' });
    }
  };

  const baixaPronta = Boolean(clienteBaixa?.contrato && formBaixa.servico && formBaixa.dataHora && moneyToNumber(formBaixa.valor) > 0);

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
          {!clienteBaixa?.contrato ? (
            <>
              <form className="row" style={{ alignItems: 'flex-end', gap: 'var(--space-3)' }} onSubmit={buscarParaBaixa}>
                <div style={{ flex: 1 }}>
                  <Input label="CPF do titular / contrato" value={buscaBaixa} onChange={(e) => setBuscaBaixa(e.target.value)} placeholder="000.000.000-00" />
                </div>
                <Button variant="secondary" type="submit">Buscar</Button>
              </form>
              {clienteBaixa?.erro && (
                <Alert variant="warning" title="Cliente ou plano não encontrado">Confira o CPF informado — é preciso um contrato ativo para registrar a baixa.</Alert>
              )}
            </>
          ) : (
            <>
              <Alert variant="info" title={`Atendimento para ${clienteBaixa.cliente.nome}`}>
                Contrato {clienteBaixa.contrato.id}.{' '}
                <button type="button" className="link" onClick={() => { setClienteBaixa(null); setBuscaBaixa(''); }}>Trocar cliente</button>
              </Alert>
              <div className="field-grid">
                <Select label="Serviço prestado" value={formBaixa.servico} onChange={(e) => setFormBaixa((f) => ({ ...f, servico: e.target.value }))}>
                  <option value="">Selecione…</option>
                  {parceiro.acordo.servicosCobertos.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
                <Input label="Data/hora do atendimento" type="datetime-local" value={formBaixa.dataHora} onChange={(e) => setFormBaixa((f) => ({ ...f, dataHora: e.target.value }))} />
                <Input label="Valor" value={formBaixa.valor} onChange={(e) => setFormBaixa((f) => ({ ...f, valor: maskMoney(e.target.value) }))} placeholder="R$ 0,00" />
              </div>
              <Checkbox label="Anexar comprovante" checked={formBaixa.comprovante} onChange={(e) => setFormBaixa((f) => ({ ...f, comprovante: e.target.checked }))} />
              <Textarea label="Observações" value={formBaixa.observacoes} onChange={(e) => setFormBaixa((f) => ({ ...f, observacoes: e.target.value }))} />
              <Alert variant="warning" title="Aprovação interna">
                Baixas acima de {money(1500)} entram como "Aguardando aprovação" até um usuário interno aprovar. Baixa registrada não pode ser excluída — apenas estornada por usuário interno (RN-07).
              </Alert>
              <div className="row" style={{ justifyContent: 'flex-end' }}>
                <Button variant="primary" disabled={!baixaPronta} loading={salvandoBaixa} onClick={registrarBaixa}>Registrar baixa</Button>
              </div>
            </>
          )}
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
                { key: 'status', header: 'Status', render: (r) => (
                  role.id === 'parceiro'
                    ? <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                    : (
                      <StatusMenu
                        value={r.status}
                        options={['Aprovado', 'Aguardando aprovação', 'Estornado']}
                        onChange={(next) => (next === 'Aguardando aprovação' ? null : alterarStatusBaixa(r, next))}
                      />
                    )
                ) },
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
