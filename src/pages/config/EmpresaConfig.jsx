import { useState } from 'react';
import { PageHeader } from '../../components/index.js';
import {
  Card, DataTable, Badge, Button, DefList, Modal, Icon, Avatar, EmptyState,
} from '../../components/index.js';
import { useUnidadesList } from '../../lib/api.js';
import UnidadeFormModal from './UnidadeFormModal.jsx';

const enderecoLinha = (e) =>
  `${e.logradouro}, ${e.numero}${e.complemento ? ` — ${e.complemento}` : ''} · ${e.bairro} · ${e.cidade}/${e.uf} · CEP ${e.cep}`;

export default function EmpresaConfig() {
  const { rows, loading, error, reload } = useUnidadesList();
  const [unidade, setUnidade] = useState(null);
  const [editUnidade, setEditUnidade] = useState(null);
  const [novaUnidade, setNovaUnidade] = useState(false);

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Unidades' }]}
        title="Unidades"
        subtitle="Filiais e escritórios da Funerária Canaã."
      />

      <Card title={`Unidades (${rows.length})`}>
        {error ? (
          <EmptyState icon="alert" title="Não foi possível carregar as unidades">{error}</EmptyState>
        ) : (
          <DataTable
            rows={rows}
            emptyLabel={loading ? 'Carregando…' : undefined}
            searchKeys={['nome', 'tipo', 'cidade', 'responsavel', 'cnpj']}
            searchPlaceholder="Buscar por unidade, tipo, cidade ou responsável…"
            onRowClick={(r) => setUnidade(r)}
            pageSize={10}
            toolbarExtra={<Button variant="primary" icon="plus" onClick={() => setNovaUnidade(true)}>Nova unidade</Button>}
            columns={[
              { key: 'foto', header: '', render: (r) => <Avatar name={r.nome} src={r.foto} size="sm" /> },
              { key: 'nome', header: 'Unidade', sortable: true },
              { key: 'tipo', header: 'Tipo', sortable: true, render: (r) => <Badge variant={r.tipo === 'Matriz' ? 'info' : 'neutral'}>{r.tipo}</Badge> },
              { key: 'cnpj', header: 'CNPJ' },
              { key: 'cidade', header: 'Cidade/UF', render: (r) => `${r.cidade}/${r.uf}` },
              { key: 'responsavel', header: 'Responsável', sortable: true },
              { key: 'telefone', header: 'Telefone' },
              { key: 'status', header: 'Status', render: (r) => (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Badge variant={r.status === 'Ativa' ? 'success' : 'neutral'}>{r.status}</Badge>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ padding: 'var(--space-1)' }}
                    aria-label={`Editar ${r.nome}`}
                    onClick={(e) => { e.stopPropagation(); setEditUnidade(r); }}
                  >
                    <Icon name="pencil" size={14} />
                  </button>
                </span>
              ) },
            ]}
          />
        )}
      </Card>

      {unidade && (
        <Modal
          title={unidade.nome}
          onClose={() => setUnidade(null)}
          wide
          footer={(
            <>
              <Button variant="secondary" type="button" icon="pencil" onClick={() => { const u = unidade; setUnidade(null); setEditUnidade(u); }}>Editar</Button>
              <Button variant="secondary" type="button" onClick={() => setUnidade(null)}>Fechar</Button>
            </>
          )}
        >
          <div className="row" style={{ marginBottom: 'var(--space-4)' }}>
            <Avatar name={unidade.nome} src={unidade.foto} size="lg" />
          </div>
          <DefList items={[
            { label: 'Tipo', value: <Badge variant={unidade.tipo === 'Matriz' ? 'info' : 'neutral'}>{unidade.tipo}</Badge> },
            { label: 'Status', value: <Badge variant={unidade.status === 'Ativa' ? 'success' : 'neutral'}>{unidade.status}</Badge> },
            { label: 'CNPJ', value: unidade.cnpj },
            { label: 'Endereço', value: enderecoLinha(unidade.endereco) },
            { label: 'Responsável', value: unidade.responsavel },
            { label: 'Telefone', value: unidade.telefone },
            { label: 'E-mail', value: unidade.email },
            { label: 'Horário de funcionamento', value: unidade.horario },
            { label: 'Alvará de funcionamento', value: unidade.alvara },
            { label: 'Salas de velório', value: String(unidade.salasVelorio) },
            { label: 'Capela', value: unidade.capela ? 'Sim' : 'Não' },
          ]} />
        </Modal>
      )}

      {editUnidade && (
        <UnidadeFormModal
          unidade={editUnidade}
          onClose={() => setEditUnidade(null)}
          onSaved={() => { setEditUnidade(null); reload(); }}
        />
      )}
      {novaUnidade && (
        <UnidadeFormModal
          onClose={() => setNovaUnidade(false)}
          onSaved={() => { setNovaUnidade(false); reload(); }}
        />
      )}
    </>
  );
}
