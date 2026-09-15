import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/index.js';
import {
  Card, Tabs, DataTable, Badge, StatusMenu, Button, Icon, EmptyState, Modal, Input, FieldRow, EnderecoFields,
} from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { apiFetch, useEmpresa, usePerfisPermissoesCacheState, useUsuariosList } from '../../lib/api.js';
import { parametros } from '../../mock/sistema.js';
import { dateTime } from '../../lib/format.js';
import { maskCNPJ, maskPhone, isValidEmail } from '../../lib/masks.js';
import { STATUS_SETS } from '../../lib/status.js';
import UsuarioFormModal from './UsuarioFormModal.jsx';

const TABS = [
  { id: 'usuarios', label: 'Usuários' },
  { id: 'perfis', label: 'Perfis e permissões' },
  { id: 'parametros', label: 'Parâmetros' },
  { id: 'empresa', label: 'Empresa' },
];

const enderecoVazio = { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' };
const empresaVazia = {
  razaoSocial: '', nomeFantasia: '', cnpj: '', inscricaoEstadual: '', inscricaoMunicipal: '',
  regimeTributario: '', cnae: '', endereco: enderecoVazio, telefone: '', email: '', site: '',
  responsavelLegal: '', contador: '',
};

export default function Configuracoes() {
  const { toast } = useToast();
  const [tab, setTab] = useState('usuarios');
  const [novoUsuario, setNovoUsuario] = useState(false);
  const [editUsuario, setEditUsuario] = useState(null);
  const { rows, loading, error, reload } = useUsuariosList();
  const { rows: perfis, reload: reloadPerfis } = usePerfisPermissoesCacheState();
  const [editPerfil, setEditPerfil] = useState(null);
  const { empresa, reload: reloadEmpresa } = useEmpresa();
  const [formEmpresa, setFormEmpresa] = useState(empresaVazia);
  const [salvandoEmpresa, setSalvandoEmpresa] = useState(false);

  useEffect(() => {
    if (empresa) {
      setFormEmpresa({
        ...empresa,
        cnpj: maskCNPJ(empresa.cnpj || ''),
        telefone: maskPhone(empresa.telefone || ''),
        endereco: { ...enderecoVazio, ...empresa.endereco },
      });
    }
  }, [empresa]);

  const alterarStatus = async (r, next) => {
    try {
      await apiFetch(`/usuarios/status.php?id=${encodeURIComponent(r.id)}`, { method: 'PATCH', body: { status: next } });
      toast(`Usuário ${r.nome} definido como "${next}".`);
      reload();
    } catch (e) {
      toast(e.message, { kind: 'danger' });
    }
  };

  const emailValido = !formEmpresa.email || isValidEmail(formEmpresa.email);
  const empresaPronta = formEmpresa.razaoSocial.trim() && formEmpresa.nomeFantasia.trim()
    && formEmpresa.cnpj.replace(/\D/g, '').length === 14 && emailValido;

  const salvarEmpresa = async (e) => {
    e.preventDefault();
    if (!empresaPronta || salvandoEmpresa) return;
    setSalvandoEmpresa(true);
    try {
      await apiFetch('/config/empresa.php', { method: 'PUT', body: formEmpresa });
      toast('Dados da empresa salvos.');
      reloadEmpresa();
    } catch (err) {
      toast(err.message, { kind: 'danger' });
    } finally {
      setSalvandoEmpresa(false);
    }
  };

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Usuários' }]}
        title="Usuários"
        subtitle="Controle de acesso, matriz de permissões por perfil, parâmetros e dados da empresa."
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
          <table className="data-table">
            <tbody>
              {parametros.map((p) => (
                <tr key={p.chave}>
                  <td style={{ fontWeight: 700, width: '55%' }}>{p.chave}</td>
                  <td>{p.valor}</td>
                  <td style={{ textAlign: 'right' }}><Button size="sm" variant="ghost" onClick={() => toast('Parâmetro editável (simulação).')}>Editar</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'empresa' && (
        <Card title="Dados cadastrais da empresa">
          <form onSubmit={salvarEmpresa} className="stack" style={{ gap: 'var(--space-5)' }}>
            <FieldRow>
              <Input label="Razão social" value={formEmpresa.razaoSocial} onChange={(e) => setFormEmpresa((f) => ({ ...f, razaoSocial: e.target.value }))} required />
              <Input label="Nome fantasia" value={formEmpresa.nomeFantasia} onChange={(e) => setFormEmpresa((f) => ({ ...f, nomeFantasia: e.target.value }))} required />
              <Input label="CNPJ" value={formEmpresa.cnpj} onChange={(e) => setFormEmpresa((f) => ({ ...f, cnpj: maskCNPJ(e.target.value) }))} placeholder="00.000.000/0000-00" required />
              <Input label="Inscrição estadual" value={formEmpresa.inscricaoEstadual || ''} onChange={(e) => setFormEmpresa((f) => ({ ...f, inscricaoEstadual: e.target.value }))} />
              <Input label="Inscrição municipal" value={formEmpresa.inscricaoMunicipal || ''} onChange={(e) => setFormEmpresa((f) => ({ ...f, inscricaoMunicipal: e.target.value }))} />
              <Input label="Regime tributário" value={formEmpresa.regimeTributario || ''} onChange={(e) => setFormEmpresa((f) => ({ ...f, regimeTributario: e.target.value }))} />
              <Input label="CNAE" value={formEmpresa.cnae || ''} onChange={(e) => setFormEmpresa((f) => ({ ...f, cnae: e.target.value }))} />
            </FieldRow>

            <EnderecoFields title="Endereço" value={formEmpresa.endereco} onChange={(endereco) => setFormEmpresa((f) => ({ ...f, endereco }))} />
            <FieldRow>
              <Input label="Complemento" value={formEmpresa.endereco.complemento || ''} onChange={(e) => setFormEmpresa((f) => ({ ...f, endereco: { ...f.endereco, complemento: e.target.value } }))} />
            </FieldRow>

            <FieldRow>
              <Input label="Telefone" value={formEmpresa.telefone} onChange={(e) => setFormEmpresa((f) => ({ ...f, telefone: maskPhone(e.target.value) }))} placeholder="(00) 0000-0000" />
              <Input label="E-mail" type="email" value={formEmpresa.email || ''} onChange={(e) => setFormEmpresa((f) => ({ ...f, email: e.target.value }))}
                error={!emailValido ? 'E-mail em formato inválido.' : undefined} />
              <Input label="Site" value={formEmpresa.site || ''} onChange={(e) => setFormEmpresa((f) => ({ ...f, site: e.target.value }))} />
              <Input label="Responsável legal" value={formEmpresa.responsavelLegal || ''} onChange={(e) => setFormEmpresa((f) => ({ ...f, responsavelLegal: e.target.value }))} />
              <Input label="Contador" value={formEmpresa.contador || ''} onChange={(e) => setFormEmpresa((f) => ({ ...f, contador: e.target.value }))} />
            </FieldRow>

            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <Button variant="primary" type="submit" disabled={!empresaPronta} loading={salvandoEmpresa}>Salvar dados da empresa</Button>
            </div>
          </form>
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
