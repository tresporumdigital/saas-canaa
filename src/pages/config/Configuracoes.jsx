import { useState } from 'react';
import { PageHeader } from '../../components/index.js';
import { Card, Tabs, DataTable, Badge, StatusMenu, Button } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import useRowStatus from '../../hooks/useRowStatus.js';
import { usuarios, perfisPermissoes, parametros } from '../../mock/sistema.js';
import { dateTime } from '../../lib/format.js';
import { STATUS_SETS } from '../../lib/status.js';

const TABS = [
  { id: 'usuarios', label: 'Usuários' },
  { id: 'perfis', label: 'Perfis e permissões' },
  { id: 'parametros', label: 'Parâmetros' },
];

export default function Configuracoes() {
  const { toast } = useToast();
  const [tab, setTab] = useState('usuarios');
  const [usuariosRows, setUsuarioStatus] = useRowStatus(usuarios);

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Usuários' }]}
        title="Usuários"
        subtitle="Controle de acesso, matriz de permissões por perfil e parâmetros de negócio do sistema."
        actions={<Button variant="primary" icon="plus" onClick={() => toast('Formulário de novo usuário (simulação).')}>Novo usuário</Button>}
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'usuarios' && (
        <Card>
          <DataTable
            rows={usuariosRows}
            searchKeys={['nome', 'email', 'perfil']}
            columns={[
              { key: 'nome', header: 'Usuário', sortable: true },
              { key: 'email', header: 'E-mail' },
              { key: 'perfil', header: 'Perfil', sortable: true, render: (r) => <Badge variant="info">{r.perfil}</Badge> },
              { key: 'doisFatores', header: '2FA', render: (r) => <Badge variant={r.doisFatores ? 'success' : 'neutral'}>{r.doisFatores ? 'Ativo' : '—'}</Badge> },
              { key: 'ultimoAcesso', header: 'Último acesso', sortable: true, render: (r) => dateTime(r.ultimoAcesso) },
              { key: 'status', header: 'Status', render: (r) => (
                <StatusMenu
                  value={r.status}
                  options={STATUS_SETS.usuario}
                  onChange={(next) => { setUsuarioStatus(r.id, next); toast(`Usuário ${r.nome} definido como "${next}".`); }}
                />
              ) },
            ]}
          />
        </Card>
      )}

      {tab === 'perfis' && (
        <Card title="Matriz de permissões por perfil">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Módulo</th><th>Administrador</th><th>Atendente</th><th>Financeiro</th><th>Operacional</th><th>Parceiro</th>
                </tr>
              </thead>
              <tbody>
                {perfisPermissoes.map((p) => (
                  <tr key={p.modulo}>
                    <td style={{ fontWeight: 700 }}>{p.modulo}</td>
                    <td>{p.admin}</td>
                    <td>{p.atendente}</td>
                    <td>{p.financeiro}</td>
                    <td>{p.operacional}</td>
                    <td>{p.parceiro}</td>
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
    </>
  );
}
