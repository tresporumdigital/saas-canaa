import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader.jsx';
import {
  Card, Badge, Button, Tabs, DefList, DataTable, EmptyState, Icon,
} from '../../components/ui/index.js';
import { parceiroById } from '../../mock/parceiros.js';
import { guiasDoParceiro } from '../../mock/guias.js';
import { baixasDoParceiro, extratoParceiro } from '../../mock/portal.js';
import { cnpj, dateTime, money, date, percent } from '../../lib/format.js';
import { statusVariant } from '../../lib/status.js';

const TABS = [
  { id: 'dados', label: 'Dados e acordo' },
  { id: 'contatos', label: 'Contatos' },
  { id: 'guias', label: 'Guias' },
  { id: 'baixas', label: 'Baixas e extrato' },
];

export default function ParceiroDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dados');

  const p = parceiroById(id);
  if (!p) return <EmptyState icon="briefcase" title="Parceiro não encontrado" action={<Button to="/parceiros">Voltar</Button>} />;

  const guias = guiasDoParceiro(p.id);
  const baixas = baixasDoParceiro(p.id);
  const extrato = extratoParceiro(p.id);
  const remun = p.acordo.tipo === 'Fixo por atendimento' ? money(p.acordo.valor) : percent(p.acordo.valor);

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Parceiros', to: '/parceiros' }, { label: p.nomeFantasia }]}
        title={p.nomeFantasia}
        subtitle={`${p.razaoSocial} · ${cnpj(p.cnpj)} · ${p.cidade}/${p.uf}`}
        actions={<Badge variant={p.status === 'Ativo' ? 'success' : 'neutral'}>{p.status}</Badge>}
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'dados' && (
        <>
          <Card title="Acordo comercial">
            <DefList items={[
              { label: 'Tipo de remuneração', value: p.acordo.tipo },
              { label: 'Valor / percentual', value: remun },
              { label: 'Vigência', value: p.acordo.vigencia },
              { label: 'Dados bancários', value: p.dadosBancarios },
            ]} />
            <div className="row" style={{ gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
              {p.acordo.servicosCobertos.map((s) => <span key={s} className="tag-chip">{s}</span>)}
            </div>
          </Card>
          <Card title="Acesso ao portal">
            <DefList items={[
              { label: 'Login', value: p.usuarioPortal.login },
              { label: 'Situação', value: <Badge variant={p.usuarioPortal.ativo ? 'success' : 'neutral'}>{p.usuarioPortal.ativo ? 'Ativo' : 'Inativo'}</Badge> },
              { label: 'Último acesso', value: dateTime(p.usuarioPortal.ultimoAcesso) },
            ]} />
          </Card>
          <Card title="Contrato de parceria">
            <span className="tag-chip"><Icon name="doc" size={13} /> Contrato de parceria assinado.pdf</span>
          </Card>
        </>
      )}

      {tab === 'contatos' && (
        <Card>
          <DataTable
            searchable={false}
            rows={p.contatos}
            getKey={(r) => r.telefone}
            columns={[
              { key: 'nome', header: 'Nome' },
              { key: 'funcao', header: 'Função' },
              { key: 'telefone', header: 'Telefone' },
              { key: 'email', header: 'E-mail' },
            ]}
          />
        </Card>
      )}

      {tab === 'guias' && (
        <Card>
          <DataTable
            rows={guias}
            searchKeys={['id', 'clienteNome', 'servico']}
            onRowClick={(r) => navigate(`/guias/${r.id}`)}
            columns={[
              { key: 'id', header: 'Guia' },
              { key: 'clienteNome', header: 'Falecido / cliente' },
              { key: 'servico', header: 'Serviço' },
              { key: 'emitidaEm', header: 'Emitida', render: (r) => date(r.emitidaEm) },
              { key: 'valorAcordado', header: 'Valor', align: 'right', render: (r) => money(r.valorAcordado) },
              { key: 'status', header: 'Status', render: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge> },
            ]}
          />
        </Card>
      )}

      {tab === 'baixas' && (
        <>
          <Card title="Extrato — valores a receber no período">
            <div className="row between" style={{ fontWeight: 800, fontSize: 'var(--text-lg)' }}>
              <span>Total aprovado</span>
              <span className="num">{money(extrato.total)}</span>
            </div>
          </Card>
          <Card title="Baixas registradas pelo parceiro">
            <DataTable
              searchable={false}
              rows={baixas}
              columns={[
                { key: 'id', header: 'Baixa' },
                { key: 'clienteNome', header: 'Cliente' },
                { key: 'servicoPrestado', header: 'Serviço prestado' },
                { key: 'dataHora', header: 'Data/hora', render: (r) => dateTime(r.dataHora) },
                { key: 'valor', header: 'Valor', align: 'right', render: (r) => money(r.valor) },
                { key: 'status', header: 'Status', render: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge> },
              ]}
            />
          </Card>
        </>
      )}
    </>
  );
}
