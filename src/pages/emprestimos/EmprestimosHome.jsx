import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/index.js';
import {
  Card, Tabs, DataTable, StatusMenu, Button, StatCard, Alert, Modal, Select, Input, Textarea,
} from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import useRowStatus from '../../hooks/useRowStatus.js';
import {
  emprestimos, unidadesEquipamento, emprestimosAtrasados,
} from '../../mock/equipamentos.js';
import { date, money } from '../../lib/format.js';
import { STATUS_SETS } from '../../lib/status.js';

const TABS = [
  { id: 'emprestimos', label: 'Empréstimos' },
  { id: 'inventario', label: 'Inventário unitário' },
];

export default function EmprestimosHome() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState('emprestimos');
  const [novo, setNovo] = useState(false);
  const [emprestimosRows, setEmprestimoStatus] = useRowStatus(emprestimos);
  const [unidadesRows, setUnidadeStatus] = useRowStatus(unidadesEquipamento, { getId: (r) => r.patrimonio });

  const atrasados = emprestimosAtrasados();
  const emprestadas = unidadesRows.filter((u) => u.status === 'Emprestado').length;
  const disponiveis = unidadesRows.filter((u) => u.status === 'Disponível').length;

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Empréstimo de Equipamentos' }]}
        title="Empréstimo de Equipamentos"
        subtitle="Controle de saída, devolução e disponibilidade do inventário — cada unidade é rastreável pelo número de patrimônio."
        actions={<Button variant="primary" icon="plus" onClick={() => setNovo(true)}>Registrar saída</Button>}
      />

      <div className="grid cols-3">
        <StatCard label="Unidades disponíveis" value={disponiveis} icon="box" tone="success" />
        <StatCard label="Emprestadas" value={emprestadas} icon="wheelchair" tone="info" />
        <StatCard label="Devoluções atrasadas" value={atrasados.length} icon="alert" tone="danger" to="#" />
      </div>

      {atrasados.length > 0 && (
        <Alert variant="warning" title={`${atrasados.length} devolução(ões) atrasada(s)`}>
          {atrasados.map((e) => `${e.produtoDescricao} (${e.unidadePatrimonio}) — ${e.clienteNome}`).join(' · ')}
        </Alert>
      )}

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'emprestimos' && (
        <Card>
          <DataTable
            rows={emprestimosRows}
            searchKeys={['id', 'clienteNome', 'unidadePatrimonio', 'produtoDescricao']}
            searchPlaceholder="Buscar por cliente, patrimônio ou equipamento…"
            pageSize={12}
            columns={[
              { key: 'id', header: 'Empréstimo', sortable: true },
              { key: 'produtoDescricao', header: 'Equipamento' },
              { key: 'unidadePatrimonio', header: 'Patrimônio', render: (r) => (
                <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/emprestimos/unidade/${r.unidadePatrimonio}`)}>{r.unidadePatrimonio}</button>
              ) },
              { key: 'clienteNome', header: 'Cliente', sortable: true },
              { key: 'saidaEm', header: 'Saída', sortable: true, render: (r) => date(r.saidaEm) },
              { key: 'previsaoDevolucao', header: 'Prev. devolução', render: (r) => date(r.previsaoDevolucao) },
              { key: 'vinculo', header: 'Vínculo', render: (r) => r.vinculo.tipo === 'Locação' ? `Locação ${money(r.vinculo.valorLocacao)}` : 'Cobertura de plano' },
              { key: 'status', header: 'Status', sortable: true, render: (r) => (
                <StatusMenu
                  value={r.status}
                  options={STATUS_SETS.emprestimo}
                  onChange={(next) => { setEmprestimoStatus(r.id, next); toast(`Empréstimo ${r.id} definido como "${next}".`); }}
                />
              ) },
              { key: 'acao', header: '', render: (r) => r.status !== 'Devolvido' ? (
                <Button size="sm" variant="secondary" onClick={() => toast(`Devolução da unidade ${r.unidadePatrimonio} registrada. Unidade retorna a "Disponível" (simulação).`)}>Devolver</Button>
              ) : null },
            ]}
          />
        </Card>
      )}

      {tab === 'inventario' && (
        <Card>
          <DataTable
            rows={unidadesRows}
            searchKeys={['patrimonio', 'descricao', 'status']}
            searchPlaceholder="Buscar por patrimônio, equipamento ou status…"
            pageSize={14}
            getKey={(r) => r.patrimonio}
            onRowClick={(r) => navigate(`/emprestimos/unidade/${r.patrimonio}`)}
            columns={[
              { key: 'patrimonio', header: 'Patrimônio', sortable: true },
              { key: 'descricao', header: 'Equipamento', sortable: true },
              { key: 'estadoConservacao', header: 'Conservação' },
              { key: 'aquisicao', header: 'Aquisição', render: (r) => date(r.aquisicao) },
              { key: 'status', header: 'Status', sortable: true, render: (r) => (
                <StatusMenu
                  value={r.status}
                  options={STATUS_SETS.unidadeEquipamento}
                  onChange={(next) => { setUnidadeStatus(r.patrimonio, next); toast(`Unidade ${r.patrimonio} definida como "${next}".`); }}
                />
              ) },
            ]}
          />
        </Card>
      )}

      {novo && (
        <Modal title="Registrar saída de empréstimo" onClose={() => setNovo(false)}
          footer={<>
            <Button size="sm" variant="secondary" onClick={() => setNovo(false)}>Cancelar</Button>
            <Button size="sm" variant="primary" onClick={() => { toast('Saída registrada e termo de responsabilidade gerado em PDF (simulação).'); setNovo(false); }}>Registrar e gerar termo</Button>
          </>}>
          <div className="field-grid">
            <Select label="Unidade disponível" options={unidadesEquipamento.filter((u) => u.status === 'Disponível').map((u) => `${u.patrimonio} — ${u.descricao}`)} />
            <Input label="Cliente" placeholder="Buscar cliente…" />
            <Input label="Responsável pela retirada" />
            <Input label="Previsão de devolução" type="date" defaultValue="2026-09-27" />
            <Select label="Vínculo" options={['Cobertura de plano', 'Locação']} />
            <Select label="Estado de conservação na saída" options={['Ótimo', 'Bom', 'Regular']} />
          </div>
          <Textarea label="Observações" />
        </Modal>
      )}
    </>
  );
}
