import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/index.js';
import { Card, DataTable, StatusMenu, Button } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import useRowStatus from '../../hooks/useRowStatus.js';
import { clientes, contratosDoCliente } from '../../mock/index.js';
import { planoById } from '../../mock/planos.js';
import { contratoById } from '../../mock/contratos.js';
import { cpf, phone, date } from '../../lib/format.js';
import { STATUS_SETS } from '../../lib/status.js';
import ClienteFormModal from './ClienteFormModal.jsx';

export default function ClientesList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [showNew, setShowNew] = useState(false);

  const base = useMemo(() => clientes.map((c) => {
    const contratos = contratosDoCliente(c.id);
    const principal = contratos[0];
    return {
      ...c,
      planoNome: principal ? planoById(principal.planoId)?.nome : '—',
      situacaoPlano: principal ? principal.situacao : 'Sem plano',
      dependentesCount: c.dependentes.length,
    };
  }), []);

  const [rowsCadastro, setCadastro] = useRowStatus(base, { key: 'status' });
  const [rows, setSituacao] = useRowStatus(rowsCadastro, { key: 'situacaoPlano' });

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
    { key: 'situacaoPlano', header: 'Situação', sortable: true, render: (r) => (
      <StatusMenu
        value={r.situacaoPlano}
        options={STATUS_SETS.clientePlano}
        onChange={(next) => { setSituacao(r.id, next); toast(`Situação de plano de ${r.nome} alterada para "${next}".`); }}
      />
    ) },
    { key: 'status', header: 'Cadastro', render: (r) => (
      <StatusMenu
        value={r.status}
        options={STATUS_SETS.clienteCadastro}
        onChange={(next) => { setCadastro(r.id, next); toast(`Cadastro de ${r.nome} definido como "${next}".`); }}
      />
    ) },
  ];

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Clientes' }]}
        title="Clientes"
        subtitle="Ficha completa com histórico de planos, atendimentos e equipamentos. Busca por nome, CPF, telefone ou contrato."
        actions={<Button variant="primary" icon="plus" onClick={() => setShowNew(true)}>Novo cliente</Button>}
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

      {showNew && <ClienteFormModal onClose={() => setShowNew(false)} />}
    </>
  );
}
