import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/index.js';
import { Card, DataTable, StatusMenu, Button, EmptyState } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import useRowStatus from '../../hooks/useRowStatus.js';
import {
  apiFetch, reloadContratosCache, useClientesCacheState, useContratosCache, usePlanosCache,
} from '../../lib/api.js';
import { cpf, phone, date } from '../../lib/format.js';
import { STATUS_SETS } from '../../lib/status.js';
import NovoClienteWizard from './NovoClienteWizard.jsx';

export default function ClientesList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [showNew, setShowNew] = useState(false);
  const { rows: clientes, loading, error, reload } = useClientesCacheState();
  const contratos = useContratosCache();
  const planos = usePlanosCache();

  const base = useMemo(() => clientes.map((c) => {
    const principal = contratos.find((ct) => ct.clienteId === c.id);
    return {
      ...c,
      contratoId: principal?.id || null,
      planoNome: principal ? planos.find((p) => p.id === principal.planoId)?.nome : '—',
      situacaoPlano: principal ? principal.situacao : 'Sem plano',
      dependentesCount: c.dependentes.length,
    };
  }), [clientes, contratos, planos]);

  const [rowsCadastro, setCadastroLocal] = useRowStatus(base, { key: 'status' });
  const [rows, setSituacaoLocal] = useRowStatus(rowsCadastro, { key: 'situacaoPlano' });

  const alterarCadastro = async (r, next) => {
    setCadastroLocal(r.id, next);
    try {
      await apiFetch(`/clientes/status.php?id=${encodeURIComponent(r.id)}`, { method: 'PATCH', body: { status: next } });
      toast(`Cadastro de ${r.nome} definido como "${next}".`);
      reload();
    } catch (e) {
      setCadastroLocal(r.id, r.status);
      toast(e.message, { kind: 'danger' });
    }
  };

  const alterarSituacaoPlano = async (r, next) => {
    if (!r.contratoId) {
      toast(`${r.nome} ainda não tem um plano contratado.`, { kind: 'warning' });
      return;
    }
    setSituacaoLocal(r.id, next);
    try {
      await apiFetch(`/contratos/status.php?id=${encodeURIComponent(r.contratoId)}`, { method: 'PATCH', body: { situacao: next } });
      toast(`Situação de plano de ${r.nome} alterada para "${next}".`);
      reloadContratosCache();
    } catch (e) {
      setSituacaoLocal(r.id, r.situacaoPlano);
      toast(e.message, { kind: 'danger' });
    }
  };

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
        onChange={(next) => alterarSituacaoPlano(r, next)}
      />
    ) },
    { key: 'status', header: 'Cadastro', render: (r) => (
      <StatusMenu
        value={r.status}
        options={STATUS_SETS.clienteCadastro}
        onChange={(next) => alterarCadastro(r, next)}
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
        {error ? (
          <EmptyState icon="alert" title="Não foi possível carregar os clientes">{error}</EmptyState>
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            emptyLabel={loading ? 'Carregando…' : undefined}
            searchKeys={['nome', 'cpf', 'telefone', 'email', 'planoNome']}
            searchPlaceholder="Buscar por nome, CPF, telefone…"
            onRowClick={(r) => navigate(`/clientes/${r.id}`)}
            pageSize={10}
            initialQuery={q}
          />
        )}
      </Card>

      {showNew && (
        <NovoClienteWizard
          existentes={clientes}
          onClose={() => setShowNew(false)}
          onCreated={() => { reload(); setShowNew(false); }}
        />
      )}
    </>
  );
}
