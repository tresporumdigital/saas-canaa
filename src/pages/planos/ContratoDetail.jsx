import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Card, Badge, Button, DefList, DataTable, EmptyState, Tag, Modal, Input, Textarea,
} from '../../components/index.js';
import { PageHeader } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { apiFetch, usePlanosCache } from '../../lib/api.js';
import { carnesDoContrato } from '../../mock/carnes.js';
import { money, date } from '../../lib/format.js';
import { statusVariant } from '../../lib/status.js';

export default function ContratoDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [showAcordo, setShowAcordo] = useState(false);
  const planosProduto = usePlanosCache();
  const planoById = (pid) => planosProduto.find((p) => p.id === pid);
  const [ct, setCt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(() => {
    setLoading(true);
    apiFetch(`/contratos/detail.php?id=${encodeURIComponent(id)}`)
      .then((row) => { setCt(row); setErro(null); })
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { carregar(); }, [carregar]);

  if (loading) return null;
  if (erro || !ct) return <EmptyState icon="shield" title="Contrato não encontrado" action={<Button to="/planos">Voltar</Button>} />;

  const plano = planoById(ct.planoId);
  const parcelas = ct.parcelas;
  const pagas = parcelas.filter((p) => p.status === 'Pago').length;
  const emAberto = parcelas.filter((p) => p.status === 'Vencido' || p.status === 'Em aberto');
  const divida = emAberto.reduce((s, p) => s + p.valor, 0);
  const carnes = carnesDoContrato(ct.id);

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Planos', to: '/planos' }, { label: ct.id }]}
        title={`Contrato ${ct.id}`}
        subtitle={`${plano?.nome} · ${ct.clienteId}`}
        actions={
          <>
            <Badge variant={statusVariant(ct.situacao)}>{ct.situacao}</Badge>
            <Button variant="secondary" icon="receipt" to="/carnes">Gerar carnê</Button>
            {(ct.situacao === 'Em atraso' || ct.situacao === 'Suspenso') && (
              <Button variant="ghost" onClick={() => setShowAcordo(true)}>Registrar acordo</Button>
            )}
          </>
        }
      />

      <div className="grid cols-2">
        <Card title="Dados do contrato">
          <DefList items={[
            { label: 'Cliente', value: <Link to={`/clientes/${ct.clienteId}`}>{ct.clienteId}</Link> },
            { label: 'Plano', value: plano?.nome },
            { label: 'Mensalidade', value: money(plano?.valorMensal) },
            { label: 'Início de vigência', value: date(ct.inicio) },
            { label: 'Dia de vencimento', value: `dia ${ct.diaVencimento}` },
            { label: 'Forma de pagamento', value: ct.formaPagamento },
            { label: 'Vendedor', value: ct.vendedor || '—' },
            { label: 'Renovação', value: 'Automática ao fim da vigência, com reajuste ' + plano?.reajuste },
            ...(ct.canceladoEm ? [{ label: 'Cancelamento', value: `${date(ct.canceladoEm)} — ${ct.motivoCancelamento}` }] : []),
          ]} />
        </Card>
        <Card title="Situação financeira">
          <DefList items={[
            { label: 'Parcelas pagas (12 meses)', value: `${pagas} de 12` },
            { label: 'Parcelas em aberto', value: emAberto.length },
            { label: 'Dívida atual', value: money(divida) },
            { label: 'Coberturas', value: '' },
          ]} />
          <div className="row" style={{ gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            {plano?.coberturas.map((c) => <Tag key={c}>{c}</Tag>)}
          </div>
        </Card>
      </div>

      <Card title="Parcelas recorrentes">
        <DataTable
          searchable={false}
          pageSize={12}
          rows={parcelas}
          columns={[
            { key: 'competencia', header: 'Competência' },
            { key: 'vencimento', header: 'Vencimento', render: (r) => date(r.vencimento) },
            { key: 'valor', header: 'Valor', align: 'right', render: (r) => money(r.valor) },
            { key: 'forma', header: 'Forma' },
            { key: 'pagoEm', header: 'Pago em', render: (r) => (r.pagoEm ? date(r.pagoEm) : '—') },
            { key: 'status', header: 'Status', render: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge> },
          ]}
        />
      </Card>

      <Card title="Carnês gerados">
        {carnes.length === 0 ? (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Nenhum carnê gerado para este contrato.</p>
        ) : (
          <DataTable
            searchable={false}
            rows={carnes}
            columns={[
              { key: 'id', header: 'Carnê' },
              { key: 'competenciaInicial', header: 'A partir de' },
              { key: 'parcelas', header: 'Parcelas', align: 'right' },
              { key: 'valorParcela', header: 'Valor', align: 'right', render: (r) => money(r.valorParcela) },
              { key: 'enviadoEm', header: 'Envio', render: (r) => (r.enviadoEm ? date(r.enviadoEm) : 'Não enviado') },
            ]}
          />
        )}
      </Card>

      {showAcordo && (
        <Modal title="Registrar acordo de dívida" onClose={() => setShowAcordo(false)}
          footer={<>
            <Button size="sm" variant="secondary" onClick={() => setShowAcordo(false)}>Cancelar</Button>
            <Button size="sm" variant="primary" onClick={() => { toast('Acordo registrado e novo parcelamento gerado (simulação).'); setShowAcordo(false); }}>Salvar acordo</Button>
          </>}>
          <div className="field-grid">
            <Input label="Valor da dívida" defaultValue={money(divida)} readOnly />
            <Input label="Nº de parcelas do acordo" type="number" defaultValue={3} />
            <Input label="Primeiro vencimento" type="date" defaultValue="2026-09-10" />
          </div>
          <Textarea label="Observações" placeholder="Condições negociadas com o cliente…" />
        </Modal>
      )}
    </>
  );
}
