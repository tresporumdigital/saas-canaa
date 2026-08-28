import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/index.js';
import { Card, DataTable, Badge, Button } from '../../components/index.js';
import { clientes, contratosDoCliente } from '../../mock/index.js';
import { planoById } from '../../mock/planos.js';
import { contratoById } from '../../mock/contratos.js';
import { cpf, phone, date } from '../../lib/format.js';
import { statusVariant } from '../../lib/status.js';

export default function ClientesList() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const q = params.get('q') || '';

  const rows = clientes.map((c) => {
    const contratos = contratosDoCliente(c.id);
    const principal = contratos[0];
    return {
      ...c,
      planoNome: principal ? planoById(principal.planoId)?.nome : '—',
      situacaoPlano: principal ? principal.situacao : 'Sem plano',
      dependentesCount: c.dependentes.length,
    };
  });

  const columns = [
    { key: 'nome', header: 'Cliente', sortable: true, render: (r) => (
      <div>
        <div style={{ fontWeight: 700 }}>{r.nome}</div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{cpf(r.cpf)} · {phone(r.telefone)}</div>
      </div>
    ) },
    { key: 'planoNome', header: 'Plano', sortable: true },
    { key: 'dependentesCount', header: 'Depend.', align: 'right', sortable: true },
    { key: 'cadastradoEm', header: 'Cliente desde', sortable: true, render: (r) => date(r.cadastradoEm) },
    { key: 'situacaoPlano', header: 'Situação', sortable: true, render: (r) => <Badge variant={r.situacaoPlano === 'Sem plano' ? 'neutral' : statusVariant(r.situacaoPlano)}>{r.situacaoPlano}</Badge> },
    { key: 'status', header: 'Cadastro', render: (r) => <Badge variant={r.status === 'Ativo' ? 'success' : 'neutral'}>{r.status}</Badge> },
  ];

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Clientes' }]}
        title="Clientes"
        subtitle="Ficha completa com histórico de planos, atendimentos e equipamentos. Busca por nome, CPF, telefone ou contrato."
        actions={<Button variant="primary" icon="plus" to="/clientes/novo">Novo cliente</Button>}
      />
      <Card>
        <DataTable
          columns={columns}
          rows={rows}
          searchKeys={['nome', 'cpf', 'telefone', 'email', 'planoNome']}
          searchPlaceholder="Buscar por nome, CPF, telefone…"
          onRowClick={(r) => navigate(`/clientes/${r.id}`)}
          pageSize={10}
          initialQuery={q}
        />
      </Card>
    </>
  );
}
