import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader.jsx';
import { Card, Badge, Icon, StatCard, Spark, Alert } from '../../components/ui/index.js';
import { useRole } from '../../context/RoleContext.jsx';
import { dashboardData } from '../../mock/index.js';
import { money, number, percent } from '../../lib/format.js';

const PERIODOS = [
  { id: 'hoje', label: 'Hoje' },
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mês' },
  { id: 'custom', label: 'Trimestre' },
];

export default function Dashboard() {
  const { role } = useRole();
  const [periodo, setPeriodo] = useState('mes');
  const d = useMemo(() => dashboardData(periodo), [periodo]);

  if (role.id === 'parceiro') {
    return (
      <>
        <PageHeader title="Painel do parceiro" subtitle="Visão restrita: consulte planos e registre baixas dos seus atendimentos." />
        <Alert variant="info" title="Acesso de parceiro comercial">
          Use o <Link to="/portal-parceiro">Portal do Parceiro</Link> para consultar a situação de um plano por CPF/contrato,
          registrar a baixa de um atendimento e acompanhar seu extrato de valores a receber.
        </Alert>
      </>
    );
  }

  const podeFinanceiro = role.id === 'admin' || role.id === 'financeiro';

  return (
    <>
      <PageHeader
        title="Painel"
        subtitle={`Visão geral do negócio — planos, financeiro, equipamentos e atendimentos ${d.periodoLabel}.`}
        actions={
          <div className="row" style={{ gap: 'var(--space-1)', background: 'var(--color-bg-sunken)', padding: 4, borderRadius: 'var(--radius-pill)' }}>
            {PERIODOS.map((p) => (
              <button
                key={p.id}
                className={`btn btn-sm ${periodo === p.id ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setPeriodo(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid cols-4">
        <StatCard label="Planos ativos" value={number(d.planos.ativos)} icon="shield" foot={`${d.planos.novos} novos · ${d.planos.cancelamentos} cancelados`} to="/planos" />
        <StatCard label="Receita recebida" value={money(d.planos.receitaRecebida)} icon="cash" tone="success" trend={{ dir: 'up', label: 'vs. previsto' }} to={podeFinanceiro ? '/financeiro' : undefined} />
        <StatCard label="Receita prevista" value={money(d.planos.receitaPrevista)} icon="trend" foot="recorrência mensal dos planos" to="/planos" />
        <StatCard label="Inadimplência" value={money(d.planos.inadimplenciaValor)} icon="alert" tone="danger" foot={`${percent(d.planos.inadimplenciaPct)} da carteira`} to={podeFinanceiro ? '/financeiro' : undefined} />
      </div>

      <div className="grid cols-3">
        <Card title="Equipamentos" action={<Link className="link" to="/emprestimos">Ver módulo <Icon name="chevron-right" size={12} /></Link>}>
          <div className="grid cols-2" style={{ gap: 'var(--space-3)' }}>
            <MiniStat label="Em estoque" value={d.equipamentos.emEstoque} />
            <MiniStat label="Emprestados" value={d.equipamentos.emprestados} />
            <MiniStat label="Atrasados" value={d.equipamentos.atrasados} tone="danger" />
            <MiniStat label="Vendidos" value={d.equipamentos.vendidos} />
          </div>
        </Card>

        <Card title="Atendimentos de óbito" action={<Link className="link" to="/obitos">Ver módulo <Icon name="chevron-right" size={12} /></Link>}>
          <div className="stat-card" style={{ padding: 0, boxShadow: 'none', gap: 4 }}>
            <span className="sc-value">{number(d.atendimentos.obitos)}</span>
            <span className="sc-foot">registrados {d.periodoLabel}</span>
          </div>
          <div className="stack gap-sm" style={{ marginTop: 'var(--space-4)' }}>
            {d.atendimentos.porParceiro.map((p) => (
              <div key={p.parceiro} className="row between" style={{ fontSize: 'var(--text-sm)' }}>
                <span>{p.parceiro}</span>
                <span className="num" style={{ color: 'var(--color-text-secondary)' }}>{p.total} guias</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Receita — últimos meses">
          <Spark data={d.serieReceita} />
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-3)' }}>
            Entradas mensais consolidadas. Ver detalhamento em Controle Financeiro.
          </p>
        </Card>
      </div>

      <Card title="Alertas acionáveis">
        <div className="stack gap-sm">
          {d.alertas.map((a, i) => (
            <Link key={i} to={a.to} className="row between" style={{ textDecoration: 'none', color: 'inherit', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-sunken)' }}>
              <span className="row" style={{ alignItems: 'center', gap: 'var(--space-3)' }}>
                <Badge variant={a.tipo}>{a.tipo === 'danger' ? 'Urgente' : a.tipo === 'warning' ? 'Atenção' : 'Aviso'}</Badge>
                <span style={{ fontSize: 'var(--text-sm)' }}>{a.label}</span>
              </span>
              <Icon name="chevron-right" size={14} />
            </Link>
          ))}
        </div>
      </Card>
    </>
  );
}

function MiniStat({ label, value, tone }) {
  return (
    <div style={{ background: 'var(--color-bg-sunken)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)' }}>
      <div className="num" style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: tone === 'danger' ? 'var(--canaa-danger-600)' : 'inherit' }}>{value}</div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{label}</div>
    </div>
  );
}
