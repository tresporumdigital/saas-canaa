import { useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader.jsx';
import {
  Card, Badge, Button, DefList, Timeline, EmptyState,
} from '../../components/ui/index.js';
import { unidadeByPatrimonio, emprestimosDaUnidade } from '../../mock/equipamentos.js';
import { date, money, dateTime } from '../../lib/format.js';
import { statusVariant } from '../../lib/status.js';

export default function UnidadeHistorico() {
  const { patrimonio } = useParams();
  const u = unidadeByPatrimonio(patrimonio);
  if (!u) return <EmptyState icon="box" title="Unidade não encontrada" action={<Button to="/emprestimos">Voltar</Button>} />;

  const historico = emprestimosDaUnidade(patrimonio);
  const atual = historico.find((e) => e.status !== 'Devolvido');

  const steps = [
    { label: `Aquisição — ${date(u.aquisicao)}`, at: 'entrada no inventário', state: 'done' },
    ...historico.slice().reverse().flatMap((e) => [
      { label: `Empréstimo ${e.id} — ${e.clienteNome}`, at: `saída ${dateTime(e.saidaEm)}`, by: `retirada por ${e.responsavelRetirada}`, state: 'done' },
      e.devolucaoEm
        ? { label: `Devolução — estado ${e.estadoDevolucao}`, at: dateTime(e.devolucaoEm), state: 'done' }
        : { label: 'Em poder do cliente', at: `previsão ${date(e.previsaoDevolucao)}`, state: 'current' },
    ]),
  ];

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Empréstimos', to: '/emprestimos' }, { label: patrimonio }]}
        title={`${u.descricao} — ${u.patrimonio}`}
        subtitle={atual ? `Atualmente com ${atual.clienteNome} desde ${date(atual.saidaEm)}.` : 'Atualmente no estoque.'}
        actions={<Badge variant={statusVariant(u.status)}>{u.status}</Badge>}
      />

      <Card title="Ficha da unidade">
        <DefList items={[
          { label: 'Patrimônio', value: u.patrimonio },
          { label: 'Equipamento', value: u.descricao },
          { label: 'Estado de conservação', value: u.estadoConservacao },
          { label: 'Data de aquisição', value: date(u.aquisicao) },
          { label: 'Status atual', value: u.status },
          { label: 'Total de empréstimos', value: historico.length },
        ]} />
      </Card>

      <Card title="Histórico completo da unidade">
        {historico.length === 0 ? (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Sem empréstimos registrados.</p>
        ) : (
          <>
            <Timeline steps={steps} />
            <div style={{ marginTop: 'var(--space-4)' }}>
              {historico.map((e) => (
                <div key={e.id} className="row between" style={{ fontSize: 'var(--text-sm)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
                  <span>{e.id} · {e.clienteNome}</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    {date(e.saidaEm)} → {e.devolucaoEm ? date(e.devolucaoEm) : 'em aberto'} · {e.vinculo.tipo === 'Locação' ? money(e.vinculo.valorLocacao) : 'plano'}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </>
  );
}
