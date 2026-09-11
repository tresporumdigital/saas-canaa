import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/index.js';
import {
  Card, Tabs, DataTable, StatusMenu, Button, StatCard, Alert, Modal, Select, Input, Textarea, DefList, Avatar, Icon,
} from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import useRowStatus from '../../hooks/useRowStatus.js';
import {
  emprestimos, unidadesEquipamento, emprestimosAtrasados, equipamentoProdutoById, unidadeByPatrimonio,
} from '../../mock/equipamentos.js';
import { clientes } from '../../mock/clientes.js';
import { date, money, dateTime } from '../../lib/format.js';
import { STATUS_SETS } from '../../lib/status.js';

const TABS = [
  { id: 'emprestimos', label: 'Empréstimos' },
  { id: 'inventario', label: 'Inventário unitário' },
];

const formaVazia = {
  clienteId: '', responsavel: '', previsao: '2026-09-27', vinculo: 'Cobertura de plano', estado: 'Ótimo', observacoes: '',
};

export default function EmprestimosHome() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState('emprestimos');
  const [emprestimosRows, setEmprestimoStatus] = useRowStatus(emprestimos);
  const [unidadesRows, setUnidadeStatus] = useRowStatus(unidadesEquipamento, { getId: (r) => r.patrimonio });

  const [passoSaida, setPassoSaida] = useState(0); // 0 fechado · 1 catálogo · 2 dados
  const [unidadeSel, setUnidadeSel] = useState(null);
  const [formSaida, setFormSaida] = useState(formaVazia);
  const [emprestimoDetalhe, setEmprestimoDetalhe] = useState(null);

  const atrasados = emprestimosAtrasados();
  const emprestadas = unidadesRows.filter((u) => u.status === 'Emprestado').length;
  const disponiveis = unidadesRows.filter((u) => u.status === 'Disponível').length;
  const disponiveisCatalogo = unidadesRows.filter((u) => u.status === 'Disponível');

  const fecharSaida = () => {
    setPassoSaida(0);
    setUnidadeSel(null);
    setFormSaida(formaVazia);
  };

  const escolherUnidade = (u) => {
    setUnidadeSel(u);
    setPassoSaida(2);
  };

  const clienteSaida = clientes.find((c) => c.id === formSaida.clienteId);
  const saidaValida = Boolean(clienteSaida && formSaida.responsavel.trim() && formSaida.previsao);

  const confirmarSaida = (e) => {
    e.preventDefault();
    if (!saidaValida) return;
    toast(`Saída de ${unidadeSel.descricao} (${unidadeSel.patrimonio}) registrada para ${clienteSaida.nome} — termo de responsabilidade gerado em PDF (simulação).`);
    fecharSaida();
  };

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Empréstimo de Equipamentos' }]}
        title="Empréstimo de Equipamentos"
        subtitle="Controle de saída, devolução e disponibilidade do inventário — cada unidade é rastreável pelo número de inventário."
        actions={<Button variant="primary" icon="plus" onClick={() => setPassoSaida(1)}>Registrar saída</Button>}
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
            searchPlaceholder="Buscar por cliente, nº de inventário ou equipamento…"
            pageSize={12}
            onRowClick={(r) => setEmprestimoDetalhe(r)}
            columns={[
              { key: 'foto', header: '', render: (r) => (
                <Avatar name={r.produtoDescricao} src={equipamentoProdutoById(unidadeByPatrimonio(r.unidadePatrimonio)?.produtoId)?.foto} size="sm" />
              ) },
              { key: 'id', header: 'Empréstimo', sortable: true },
              { key: 'produtoDescricao', header: 'Equipamento' },
              { key: 'unidadePatrimonio', header: 'Nº de inventário', render: (r) => (
                <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/emprestimos/unidade/${r.unidadePatrimonio}`); }}>{r.unidadePatrimonio}</button>
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
                <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); toast(`Devolução da unidade ${r.unidadePatrimonio} registrada. Unidade retorna a "Disponível" (simulação).`); }}>Devolver</Button>
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
            searchPlaceholder="Buscar por nº de inventário, equipamento ou status…"
            pageSize={14}
            getKey={(r) => r.patrimonio}
            onRowClick={(r) => navigate(`/emprestimos/unidade/${r.patrimonio}`)}
            columns={[
              { key: 'foto', header: '', render: (r) => <Avatar name={r.descricao} src={equipamentoProdutoById(r.produtoId)?.foto} size="sm" /> },
              { key: 'patrimonio', header: 'Nº de inventário', sortable: true },
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

      {emprestimoDetalhe && (
        <Modal
          title={`Empréstimo ${emprestimoDetalhe.id}`}
          onClose={() => setEmprestimoDetalhe(null)}
          wide
          footer={<Button variant="secondary" onClick={() => setEmprestimoDetalhe(null)}>Fechar</Button>}
        >
          <div className="row" style={{ gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <Avatar
              name={emprestimoDetalhe.produtoDescricao}
              src={equipamentoProdutoById(unidadeByPatrimonio(emprestimoDetalhe.unidadePatrimonio)?.produtoId)?.foto}
              size="lg"
            />
            <div>
              <div style={{ fontWeight: 800 }}>{emprestimoDetalhe.produtoDescricao}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>Nº de inventário {emprestimoDetalhe.unidadePatrimonio}</div>
            </div>
          </div>
          <DefList items={[
            { label: 'Cliente', value: emprestimoDetalhe.clienteNome },
            { label: 'Responsável pela retirada', value: emprestimoDetalhe.responsavelRetirada },
            { label: 'Saída em', value: date(emprestimoDetalhe.saidaEm) },
            { label: 'Previsão de devolução', value: date(emprestimoDetalhe.previsaoDevolucao) },
            { label: 'Devolução em', value: emprestimoDetalhe.devolucaoEm ? date(emprestimoDetalhe.devolucaoEm) : '—' },
            { label: 'Estado na saída', value: emprestimoDetalhe.estadoSaida },
            { label: 'Estado na devolução', value: emprestimoDetalhe.estadoDevolucao || '—' },
            { label: 'Vínculo', value: emprestimoDetalhe.vinculo.tipo === 'Locação' ? `Locação — ${money(emprestimoDetalhe.vinculo.valorLocacao)}` : `Cobertura de plano — ${emprestimoDetalhe.vinculo.contratoId || '—'}` },
            { label: 'Status', value: emprestimoDetalhe.status },
          ]} />
        </Modal>
      )}

      {passoSaida === 1 && (
        <Modal
          title="Selecione o equipamento"
          onClose={fecharSaida}
          wide
          footer={<Button variant="secondary" onClick={fecharSaida}>Cancelar</Button>}
        >
          {disponiveisCatalogo.length === 0 ? (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Nenhuma unidade disponível no momento.</p>
          ) : (
            <div className="grid cols-3">
              {disponiveisCatalogo.map((u) => (
                <button key={u.patrimonio} type="button" className="equip-card" onClick={() => escolherUnidade(u)}>
                  <Avatar name={u.descricao} src={equipamentoProdutoById(u.produtoId)?.foto} size="lg" />
                  <span className="equip-card-nome">{u.descricao}</span>
                  <span className="equip-card-patrimonio">Nº {u.patrimonio} · {u.estadoConservacao}</span>
                </button>
              ))}
            </div>
          )}
        </Modal>
      )}

      {passoSaida === 2 && unidadeSel && (
        <Modal
          title={`Registrar saída — ${unidadeSel.descricao}`}
          onClose={fecharSaida}
          wide
          footer={(
            <>
              <Button variant="secondary" type="button" onClick={() => setPassoSaida(1)}>
                <Icon name="chevron-left" size={14} /> Trocar equipamento
              </Button>
              <Button variant="secondary" type="button" onClick={fecharSaida}>Cancelar</Button>
              <Button variant="primary" type="submit" form="saida-form" disabled={!saidaValida}>Registrar e gerar termo</Button>
            </>
          )}
        >
          <form id="saida-form" onSubmit={confirmarSaida} className="stack" style={{ gap: 'var(--space-4)' }}>
            <div className="row" style={{ gap: 'var(--space-3)', alignItems: 'center' }}>
              <Avatar name={unidadeSel.descricao} src={equipamentoProdutoById(unidadeSel.produtoId)?.foto} size="md" />
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Nº de inventário {unidadeSel.patrimonio} · {unidadeSel.estadoConservacao}</div>
            </div>
            <div className="field-grid">
              <Select label="Cliente" value={formSaida.clienteId} onChange={(e) => setFormSaida((f) => ({ ...f, clienteId: e.target.value }))}>
                <option value="">Selecione um cliente…</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </Select>
              <Input label="Responsável pela retirada" value={formSaida.responsavel} onChange={(e) => setFormSaida((f) => ({ ...f, responsavel: e.target.value }))} required />
              <Input label="Previsão de devolução" type="date" value={formSaida.previsao} onChange={(e) => setFormSaida((f) => ({ ...f, previsao: e.target.value }))} />
              <Select label="Vínculo" value={formSaida.vinculo} onChange={(e) => setFormSaida((f) => ({ ...f, vinculo: e.target.value }))} options={['Cobertura de plano', 'Locação']} />
              <Select label="Estado de conservação na saída" value={formSaida.estado} onChange={(e) => setFormSaida((f) => ({ ...f, estado: e.target.value }))} options={['Ótimo', 'Bom', 'Regular']} />
            </div>
            <Textarea label="Observações" value={formSaida.observacoes} onChange={(e) => setFormSaida((f) => ({ ...f, observacoes: e.target.value }))} />
          </form>
        </Modal>
      )}
    </>
  );
}
