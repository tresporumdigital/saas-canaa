import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../../components/index.js';
import {
  Card, Badge, Button, DefList, CoverageBanner, DataTable, EmptyState, Icon, Alert,
} from '../../components/index.js';
import { obitoById } from '../../mock/obitos.js';
import { guiasDoObito } from '../../mock/guias.js';
import { clienteById } from '../../mock/clientes.js';
import { parceiroById } from '../../mock/parceiros.js';
import { date, dateTime, money } from '../../lib/format.js';
import { statusVariant } from '../../lib/status.js';

function coberturaChecks(cob) {
  if (!cob) return null;
  return [
    { label: 'Plano ativo', state: cob.planoAtivo ? 'ok' : 'bad', detail: cob.planoAtivo ? 'contrato vigente' : 'contrato cancelado ou suspenso' },
    { label: 'Carência cumprida', state: cob.carenciaCumprida ? 'ok' : 'warn', detail: cob.carenciaCumprida ? 'acima do prazo de carência' : 'dentro do período de carência' },
    { label: 'Beneficiário incluído', state: cob.dependenteIncluido ? 'ok' : 'warn', detail: cob.dependenteIncluido ? 'titular/dependente no plano' : 'não consta como dependente' },
    { label: 'Adimplência', state: cob.adimplente ? 'ok' : 'bad', detail: cob.adimplente ? 'sem parcelas em atraso' : 'parcelas em atraso — cobrança à parte' },
  ];
}

export default function ObitoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ob = obitoById(id);
  if (!ob) return <EmptyState icon="doc" title="Atendimento não encontrado" action={<Button to="/obitos">Voltar</Button>} />;

  const guias = guiasDoObito(ob.id);
  const cliente = ob.vinculo.clienteId ? clienteById(ob.vinculo.clienteId) : null;
  const checks = coberturaChecks(ob.cobertura);
  const cobertos = ob.servicos.filter((s) => s.coberto);
  const cobrados = ob.servicos.filter((s) => !s.coberto);

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Registro de Óbito', to: '/obitos' }, { label: ob.id }]}
        title={ob.falecido.nome}
        subtitle={`${ob.id} · aberto em ${dateTime(ob.abertoEm)} · responsável: ${ob.responsavel}`}
        actions={
          <>
            <Badge variant={statusVariant(ob.status)}>{ob.status}</Badge>
            <Button variant="secondary" icon="send" to="/guias">Ver guias</Button>
          </>
        }
      />

      {ob.vinculo.tipo === 'Particular' ? (
        <Alert variant="warning" title="Atendimento particular">Sem plano vinculado — todos os serviços são cobrados à parte.</Alert>
      ) : (
        <Card title="Validação de cobertura" action={cliente ? <Link className="link" to={`/clientes/${cliente.id}`}>Ver ficha do cliente <Icon name="chevron-right" size={12} /></Link> : null}>
          {checks ? <CoverageBanner checks={checks} /> : <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Sem dados de cobertura.</p>}
        </Card>
      )}

      <div className="grid cols-2">
        <Card title="Dados do falecido">
          <DefList items={[
            { label: 'Nome', value: ob.falecido.nome },
            { label: 'CPF', value: ob.falecido.cpf },
            { label: 'Nascimento', value: date(ob.falecido.nascimento) },
            { label: 'Data/hora do óbito', value: dateTime(ob.falecido.obitoEm) },
            { label: 'Local do óbito', value: ob.falecido.localObito },
            { label: 'Causa declarada', value: ob.falecido.causaDeclarada },
            { label: 'Nº da declaração de óbito', value: ob.falecido.numeroDO },
            { label: 'Cartório', value: ob.falecido.cartorio || 'A definir' },
          ]} />
        </Card>
        <Card title="Solicitante e locais">
          <DefList items={[
            { label: 'Solicitante', value: `${ob.solicitante.nome} (${ob.solicitante.parentesco})` },
            { label: 'Telefone', value: ob.solicitante.telefone },
            { label: 'Vínculo', value: ob.vinculo.tipo + (ob.vinculo.dependenteNome ? ` — ${ob.vinculo.dependenteNome}` : '') },
            { label: 'Contrato', value: ob.vinculo.contratoId || '—' },
            { label: 'Local de velório', value: ob.locais.velorio },
            { label: 'Sepultamento/cremação', value: ob.locais.sepultamento },
          ]} />
        </Card>
      </div>

      <Card title="Serviços prestados">
        <div className="grid cols-2">
          <div>
            <div className="card-title" style={{ marginBottom: 'var(--space-2)' }}>Cobertos pelo plano</div>
            <div className="stack gap-sm">
              {cobertos.length ? cobertos.map((s, i) => (
                <div key={i} className="row between" style={{ fontSize: 'var(--text-sm)' }}>
                  <span><Icon name="check" size={13} /> {s.nome}</span>
                  <span style={{ color: 'var(--canaa-success-600)' }}>incluído</span>
                </div>
              )) : <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Nenhum.</span>}
            </div>
          </div>
          <div>
            <div className="card-title" style={{ marginBottom: 'var(--space-2)' }}>Cobrados à parte</div>
            <div className="stack gap-sm">
              {cobrados.length ? cobrados.map((s, i) => (
                <div key={i} className="row between" style={{ fontSize: 'var(--text-sm)' }}>
                  <span>{s.nome}</span>
                  <span className="num">{money(s.valor)}</span>
                </div>
              )) : <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Nenhum.</span>}
            </div>
          </div>
        </div>
        <div className="row between" style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)', fontWeight: 800 }}>
          <span>Valor final do atendimento</span>
          <span className="num">{money(ob.valorTotal)}</span>
        </div>
      </Card>

      <Card title={`Guias acionadas (${guias.length})`}>
        {guias.length === 0 ? (
          <EmptyState icon="send" title="Nenhuma guia emitida" >Selecione parceiros para gerar as guias a partir deste atendimento.</EmptyState>
        ) : (
          <DataTable
            searchable={false}
            onRowClick={(r) => navigate(`/guias/${r.id}`)}
            columns={[
              { key: 'id', header: 'Guia' },
              { key: 'parceiroId', header: 'Parceiro', render: (r) => parceiroById(r.parceiroId)?.nomeFantasia },
              { key: 'servico', header: 'Serviço' },
              { key: 'valorAcordado', header: 'Valor', align: 'right', render: (r) => money(r.valorAcordado) },
              { key: 'status', header: 'Status', render: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge> },
            ]}
            rows={guias}
          />
        )}
      </Card>

      <Card title="Documentos anexados">
        <div className="row" style={{ gap: 'var(--space-3)' }}>
          {['Declaração de óbito.pdf', 'Autorização de sepultamento.pdf', 'RG do solicitante.pdf'].map((d) => (
            <span key={d} className="tag-chip"><Icon name="doc" size={13} /> {d}</span>
          ))}
        </div>
      </Card>
    </>
  );
}
