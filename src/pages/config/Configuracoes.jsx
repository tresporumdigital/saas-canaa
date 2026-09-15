import { useState } from 'react';
import { PageHeader } from '../../components/index.js';
import {
  Card, Tabs, DataTable, Badge, StatusMenu, Button, Icon, EmptyState, Modal, Input, Alert,
} from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  apiFetch, useAuditoriaList, useParametrosCacheState, usePerfisPermissoesCacheState, useUsuariosList,
} from '../../lib/api.js';
import { dateTime } from '../../lib/format.js';
import { STATUS_SETS } from '../../lib/status.js';
import UsuarioFormModal from './UsuarioFormModal.jsx';

const TABS = [
  { id: 'usuarios', label: 'Usuários' },
  { id: 'perfis', label: 'Perfis e permissões' },
  { id: 'parametros', label: 'Parâmetros' },
  { id: 'auditoria', label: 'Auditoria' },
];

export default function Configuracoes() {
  const { toast } = useToast();
  const [tab, setTab] = useState('usuarios');
  const [novoUsuario, setNovoUsuario] = useState(false);
  const [editUsuario, setEditUsuario] = useState(null);
  const { rows, loading, error, reload } = useUsuariosList();
  const { rows: perfis, reload: reloadPerfis } = usePerfisPermissoesCacheState();
  const [editPerfil, setEditPerfil] = useState(null);
  const { rows: parametros, reload: reloadParametros } = useParametrosCacheState();
  const [editParametro, setEditParametro] = useState(null);
  const { rows: auditoria, loading: loadingAuditoria } = useAuditoriaList();

  const alterarStatus = async (r, next) => {
    try {
      await apiFetch(`/usuarios/status.php?id=${encodeURIComponent(r.id)}`, { method: 'PATCH', body: { status: next } });
      toast(`Usuário ${r.nome} definido como "${next}".`);
      reload();
    } catch (e) {
      toast(e.message, { kind: 'danger' });
    }
  };

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Usuários' }]}
        title="Usuários"
        subtitle="Controle de acesso, matriz de permissões por perfil e parâmetros."
        actions={tab === 'usuarios' ? <Button variant="primary" icon="plus" onClick={() => setNovoUsuario(true)}>Novo usuário</Button> : null}
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'usuarios' && (
        <Card>
          {error ? (
            <EmptyState icon="alert" title="Não foi possível carregar os usuários">{error}</EmptyState>
          ) : (
            <DataTable
              rows={rows}
              emptyLabel={loading ? 'Carregando…' : undefined}
              searchKeys={['nome', 'email', 'perfil']}
              columns={[
                { key: 'nome', header: 'Usuário', sortable: true },
                { key: 'email', header: 'E-mail' },
                { key: 'perfil', header: 'Perfil', sortable: true, render: (r) => <Badge variant="info">{r.perfil}</Badge> },
                { key: 'doisFatores', header: '2FA', render: (r) => <Badge variant={r.doisFatores ? 'success' : 'neutral'}>{r.doisFatores ? 'Ativo' : '—'}</Badge> },
                { key: 'ultimoAcesso', header: 'Último acesso', sortable: true, render: (r) => (r.ultimoAcesso ? dateTime(r.ultimoAcesso) : '—') },
                { key: 'status', header: 'Status', render: (r) => (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <StatusMenu value={r.status} options={STATUS_SETS.usuario} onChange={(next) => alterarStatus(r, next)} />
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ padding: 'var(--space-1)' }}
                      aria-label={`Editar ${r.nome}`}
                      onClick={(e) => { e.stopPropagation(); setEditUsuario(r); }}
                    >
                      <Icon name="pencil" size={14} />
                    </button>
                  </span>
                ) },
              ]}
            />
          )}
        </Card>
      )}

      {tab === 'perfis' && (
        <Card title="Matriz de permissões por perfil">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Módulo</th><th>Administrador</th><th>Atendente</th><th>Financeiro</th><th>Operacional</th><th>Parceiro</th><th />
                </tr>
              </thead>
              <tbody>
                {perfis.map((p) => (
                  <tr key={p.modulo}>
                    <td style={{ fontWeight: 700 }}>{p.modulo}</td>
                    <td>{p.admin || '—'}</td>
                    <td>{p.atendente || '—'}</td>
                    <td>{p.financeiro || '—'}</td>
                    <td>{p.operacional || '—'}</td>
                    <td>{p.parceiro || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button type="button" className="btn btn-ghost btn-sm" style={{ padding: 'var(--space-1)' }}
                        aria-label={`Editar ${p.modulo}`} onClick={() => setEditPerfil(p)}>
                        <Icon name="pencil" size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'parametros' && (
        <Card title="Parâmetros de negócio">
          <Alert variant="info" title="Valores informativos">
            Estes parâmetros ficam salvos de verdade, mas hoje nenhum deles é lido automaticamente
            pelo sistema — editar um valor aqui não muda o comportamento real (ex.: expiração de
            sessão, limite de aprovação de baixa). Servem como referência documentada da política
            atual até que o código passe a consultá-los.
          </Alert>
          <table className="data-table">
            <tbody>
              {parametros.map((p) => (
                <tr key={p.chave}>
                  <td style={{ fontWeight: 700, width: '55%' }}>{p.chave}</td>
                  <td>{p.valor}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Button size="sm" variant="ghost" onClick={() => setEditParametro(p)}>Editar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'auditoria' && (
        <Card title="Trilha de auditoria">
          <DataTable
            rows={auditoria}
            emptyLabel={loadingAuditoria ? 'Carregando…' : 'Nenhum evento registrado ainda.'}
            searchKeys={['usuario', 'acao', 'entidade']}
            pageSize={20}
            getKey={(r) => r.id}
            columns={[
              { key: 'quando', header: 'Quando', sortable: true, render: (r) => dateTime(r.quando) },
              { key: 'usuario', header: 'Usuário' },
              { key: 'acao', header: 'Ação' },
              { key: 'entidade', header: 'Entidade', render: (r) => r.entidade || '—' },
              { key: 'ip', header: 'IP', render: (r) => r.ip || '—' },
            ]}
          />
        </Card>
      )}

      {novoUsuario && (
        <UsuarioFormModal onClose={() => setNovoUsuario(false)} onSaved={() => { setNovoUsuario(false); reload(); }} />
      )}
      {editUsuario && (
        <UsuarioFormModal usuario={editUsuario} onClose={() => setEditUsuario(null)} onSaved={() => { setEditUsuario(null); reload(); }} />
      )}
      {editPerfil && (
        <EditPerfilModal perfil={editPerfil} onClose={() => setEditPerfil(null)} onSaved={() => { setEditPerfil(null); reloadPerfis(); }} />
      )}
      {editParametro && (
        <EditParametroModal parametro={editParametro} onClose={() => setEditParametro(null)} onSaved={() => { setEditParametro(null); reloadParametros(); }} />
      )}
    </>
  );
}

function EditPerfilModal({ perfil, onClose, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    admin: perfil.admin || '', atendente: perfil.atendente || '', financeiro: perfil.financeiro || '',
    operacional: perfil.operacional || '', parceiro: perfil.parceiro || '',
  });
  const [salvando, setSalvando] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (salvando) return;
    setSalvando(true);
    try {
      await apiFetch(`/config/perfis_permissoes.php?modulo=${encodeURIComponent(perfil.modulo)}`, { method: 'PATCH', body: form });
      toast(`Permissões de "${perfil.modulo}" atualizadas.`);
      onSaved?.();
    } catch (err) {
      toast(err.message, { kind: 'danger' });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      title={`Editar acesso — ${perfil.modulo}`}
      onClose={onClose}
      footer={(
        <>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="perfil-form" loading={salvando}>Salvar</Button>
        </>
      )}
    >
      <form id="perfil-form" onSubmit={submit} className="stack" style={{ gap: 'var(--space-4)' }}>
        <Input label="Administrador" value={form.admin} onChange={set('admin')} />
        <Input label="Atendente" value={form.atendente} onChange={set('atendente')} />
        <Input label="Financeiro" value={form.financeiro} onChange={set('financeiro')} />
        <Input label="Operacional" value={form.operacional} onChange={set('operacional')} />
        <Input label="Parceiro" value={form.parceiro} onChange={set('parceiro')} />
      </form>
    </Modal>
  );
}

function EditParametroModal({ parametro, onClose, onSaved }) {
  const { toast } = useToast();
  const [valor, setValor] = useState(parametro.valor);
  const [salvando, setSalvando] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (salvando || !valor.trim()) return;
    setSalvando(true);
    try {
      await apiFetch(`/config/parametros.php?chave=${encodeURIComponent(parametro.chave)}`, { method: 'PATCH', body: { valor } });
      toast(`Parâmetro "${parametro.chave}" atualizado.`);
      onSaved?.();
    } catch (err) {
      toast(err.message, { kind: 'danger' });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      title={`Editar — ${parametro.chave}`}
      onClose={onClose}
      footer={(
        <>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="parametro-form" loading={salvando}>Salvar</Button>
        </>
      )}
    >
      <form id="parametro-form" onSubmit={submit}>
        <Input label="Valor" value={valor} onChange={(e) => setValor(e.target.value)} required />
      </form>
    </Modal>
  );
}
