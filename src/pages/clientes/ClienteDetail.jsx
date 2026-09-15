import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../../components/index.js';
import {
  Card, Badge, Button, Tabs, DefList, DataTable, Avatar, EmptyState, Icon, ConfirmDialog,
} from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  apiFetch, useContratosCache, useEmprestimosCache, useNotasFiscaisCache, useObitosCache, usePlanosCache,
} from '../../lib/api.js';
import { cpf, phone, date, dateTime, money } from '../../lib/format.js';
import { statusVariant } from '../../lib/status.js';
import ClienteFormModal from './ClienteFormModal.jsx';

const TABS = [
  { id: 'geral', label: 'Visão geral' },
  { id: 'planos', label: 'Planos e pagamentos' },
  { id: 'atendimentos', label: 'Atendimentos' },
  { id: 'equipamentos', label: 'Equipamentos' },
  { id: 'notas', label: 'Notas fiscais' },
  { id: 'historico', label: 'Histórico' },
];

export default function ClienteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState('geral');
  const [confirmInativar, setConfirmInativar] = useState(false);
  const [editing, setEditing] = useState(false);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const contratosGlobal = useContratosCache();
  const planosProduto = usePlanosCache();
  const obitosGlobal = useObitosCache();
  const emprestimosGlobal = useEmprestimosCache();
  const notasFiscaisGlobal = useNotasFiscaisCache();
  const [parcelasPorContrato, setParcelasPorContrato] = useState({});

  const carregar = useCallback(() => {
    setLoading(true);
    apiFetch(`/clientes/detail.php?id=${encodeURIComponent(id)}`)
      .then((c) => { setCliente(c); setErro(null); })
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { carregar(); }, [carregar]);

  // Busca as parcelas de cada contrato do cliente sob demanda (não vêm na listagem).
  useEffect(() => {
    if (!cliente) return;
    contratosGlobal
      .filter((c) => c.clienteId === cliente.id)
      .forEach((ct) => {
        if (parcelasPorContrato[ct.id]) return;
        apiFetch(`/contratos/detail.php?id=${encodeURIComponent(ct.id)}`)
          .then((full) => setParcelasPorContrato((m) => ({ ...m, [ct.id]: full.parcelas })))
          .catch(() => {});
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cliente, contratosGlobal]);

  if (loading) return null;
  if (erro || !cliente) {
    return <EmptyState icon="users" title="Cliente não encontrado" action={<Button to="/clientes">Voltar à lista</Button>} />;
  }

  const planoById = (pid) => planosProduto.find((p) => p.id === pid);
  const contratos = contratosGlobal.filter((c) => c.clienteId === cliente.id);
  const atendimentos = obitosGlobal.filter((o) => o.vinculo.clienteId === cliente.id);
  const emprestimos = emprestimosGlobal.filter((e) => e.clienteId === cliente.id);
  const notas = notasFiscaisGlobal.filter((n) => n.clienteNome === cliente.nome);

  const inativar = async () => {
    try {
      await apiFetch(`/clientes/status.php?id=${encodeURIComponent(cliente.id)}`, { method: 'PATCH', body: { status: 'Inativo' } });
      toast('Cadastro inativado.', { kind: 'warning' });
      carregar();
    } catch (e) {
      toast(e.message, { kind: 'danger' });
    } finally {
      setConfirmInativar(false);
    }
  };

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Clientes', to: '/clientes' }, { label: cliente.nome }]}
        title={cliente.nome}
        subtitle={`${cpf(cliente.cpf)} · ${phone(cliente.telefone)} · ${cliente.email}`}
        actions={
          <>
            <Button variant="secondary" icon="pencil" onClick={() => setEditing(true)}>Editar</Button>
            <Button variant="ghost" onClick={() => setConfirmInativar(true)} disabled={cliente.status === 'Inativo'}>
              {cliente.status === 'Inativo' ? 'Inativo' : 'Inativar cadastro'}
            </Button>
          </>
        }
      />

      <div className="row" style={{ gap: 'var(--space-3)', alignItems: 'center' }}>
        <Avatar name={cliente.nome} size="lg" />
        <div>
          <Badge variant={cliente.status === 'Ativo' ? 'success' : 'neutral'}>{cliente.status}</Badge>{' '}
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            Cliente desde {date(cliente.cadastradoEm)} · {cliente.dependentes.length} dependente(s)
          </span>
        </div>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'geral' && (
        <>
          <Card title="Dados do titular">
            <DefList
              items={[
                { label: 'Nome', value: cliente.nome },
                { label: 'CPF', value: cpf(cliente.cpf) },
                { label: 'RG', value: cliente.rg },
                { label: 'Nascimento', value: date(cliente.nascimento) },
                { label: 'Telefone', value: phone(cliente.telefone) },
                { label: 'E-mail', value: cliente.email },
                { label: 'Endereço', value: `${cliente.endereco.logradouro}, ${cliente.endereco.numero} — ${cliente.endereco.bairro}` },
                { label: 'Cidade/UF', value: `${cliente.endereco.cidade}/${cliente.endereco.uf}` },
                { label: 'CEP', value: cliente.endereco.cep },
              ]}
            />
          </Card>

          <Card title="Dependentes">
            {cliente.dependentes.length === 0 ? (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Nenhum dependente vinculado.</p>
            ) : (
              <DataTable
                searchable={false}
                pageSize={5}
                columns={[
                  { key: 'nome', header: 'Nome' },
                  { key: 'parentesco', header: 'Parentesco' },
                  { key: 'cpf', header: 'CPF', render: (r) => cpf(r.cpf) },
                  { key: 'nascimento', header: 'Nascimento', render: (r) => date(r.nascimento) },
                ]}
                rows={cliente.dependentes}
                getKey={(r) => r.cpf}
              />
            )}
          </Card>

          <Card title="Documentos anexados">
            <div className="row" style={{ gap: 'var(--space-3)' }}>
              {['RG (frente e verso).pdf', 'Contrato assinado.pdf', 'Comprovante de residência.pdf'].map((doc) => (
                <span key={doc} className="tag-chip"><Icon name="doc" size={13} /> {doc}</span>
              ))}
            </div>
          </Card>
        </>
      )}

      {tab === 'planos' && (
        <>
          {contratos.length === 0 ? (
            <EmptyState icon="shield" title="Sem planos contratados" action={<Button variant="primary" to="/planos/contratar">Contratar plano</Button>} />
          ) : contratos.map((ct) => {
            const parcelas = parcelasPorContrato[ct.id] || [];
            return (
              <Card key={ct.id} title={`${planoById(ct.planoId)?.nome} — ${ct.id}`}
                action={<Link className="link" to={`/planos/contratos/${ct.id}`}>Abrir contrato <Icon name="chevron-right" size={12} /></Link>}>
                <DefList items={[
                  { label: 'Situação', value: <Badge variant={statusVariant(ct.situacao)}>{ct.situacao}</Badge> },
                  { label: 'Mensalidade', value: money(planoById(ct.planoId)?.valorMensal) },
                  { label: 'Início', value: date(ct.inicio) },
                  { label: 'Vencimento', value: `dia ${ct.diaVencimento}` },
                  { label: 'Forma de pagamento', value: ct.formaPagamento },
                  { label: 'Vendedor', value: ct.vendedor },
                ]} />
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <DataTable
                    searchable={false}
                    pageSize={4}
                    columns={[
                      { key: 'competencia', header: 'Competência' },
                      { key: 'vencimento', header: 'Vencimento', render: (r) => date(r.vencimento) },
                      { key: 'valor', header: 'Valor', align: 'right', render: (r) => money(r.valor) },
                      { key: 'status', header: 'Status', render: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge> },
                    ]}
                    rows={parcelas}
                  />
                </div>
              </Card>
            );
          })}
        </>
      )}

      {tab === 'atendimentos' && (
        atendimentos.length === 0 ? (
          <EmptyState icon="doc" title="Nenhum atendimento registrado" />
        ) : (
          <Card>
            <DataTable
              searchable={false}
              onRowClick={(r) => navigate(`/obitos/${r.id}`)}
              columns={[
                { key: 'id', header: 'Atendimento' },
                { key: 'falecido', header: 'Falecido', render: (r) => r.falecido.nome },
                { key: 'obitoEm', header: 'Data do óbito', render: (r) => date(r.falecido.obitoEm) },
                { key: 'status', header: 'Status', render: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge> },
                { key: 'valorTotal', header: 'Valor cobrado', align: 'right', render: (r) => money(r.valorTotal) },
              ]}
              rows={atendimentos}
            />
          </Card>
        )
      )}

      {tab === 'equipamentos' && (
        emprestimos.length === 0 ? (
          <EmptyState icon="wheelchair" title="Nenhum equipamento em uso ou histórico" />
        ) : (
          <Card>
            <DataTable
              searchable={false}
              columns={[
                { key: 'id', header: 'Empréstimo' },
                { key: 'produtoDescricao', header: 'Equipamento' },
                { key: 'unidadePatrimonio', header: 'Patrimônio' },
                { key: 'saidaEm', header: 'Saída', render: (r) => date(r.saidaEm) },
                { key: 'previsaoDevolucao', header: 'Prev. devolução', render: (r) => date(r.previsaoDevolucao) },
                { key: 'status', header: 'Status', render: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge> },
              ]}
              rows={emprestimos}
            />
          </Card>
        )
      )}

      {tab === 'notas' && (
        notas.length === 0 ? (
          <EmptyState icon="receipt" title="Nenhuma nota fiscal emitida para este cliente" />
        ) : (
          <Card>
            <DataTable
              searchable={false}
              onRowClick={() => navigate('/notas-fiscais')}
              columns={[
                { key: 'id', header: 'Nota' },
                { key: 'tipo', header: 'Tipo' },
                { key: 'valor', header: 'Valor', align: 'right', render: (r) => money(r.valor) },
                { key: 'status', header: 'Status', render: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge> },
                { key: 'emitidaEm', header: 'Emissão', render: (r) => (r.emitidaEm ? dateTime(r.emitidaEm) : '—') },
              ]}
              rows={notas}
            />
          </Card>
        )
      )}

      {tab === 'historico' && (
        <Card title="Histórico de alterações">
          <div className="stack gap-sm">
            {cliente.historico.length === 0 ? (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Nenhum registro ainda.</p>
            ) : cliente.historico.map((h, i) => (
              <div key={i} className="row" style={{ gap: 'var(--space-3)', alignItems: 'baseline', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>
                <span className="num" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', minWidth: 130 }}>{dateTime(h.quando)}</span>
                <span style={{ fontSize: 'var(--text-sm)' }}>{h.oque} <span style={{ color: 'var(--color-text-secondary)' }}>— {h.quem || 'sistema'}</span></span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {confirmInativar && (
        <ConfirmDialog
          title="Inativar cadastro?"
          message="O cadastro deixa de aparecer nas listas operacionais, mas os dados e o histórico são preservados (sem exclusão física)."
          confirmLabel="Inativar"
          onConfirm={inativar}
          onClose={() => setConfirmInativar(false)}
        />
      )}

      {editing && (
        <ClienteFormModal
          cliente={cliente}
          onClose={() => setEditing(false)}
          onSaved={() => { setEditing(false); carregar(); }}
        />
      )}
    </>
  );
}
