import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/index.js';
import { Card, Button, Input, Select, FieldRow, Alert, Tag, EmptyState } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { apiFetch, reloadContratosCache, useClientesCache, usePlanosCache, useUsuariosList } from '../../lib/api.js';
import { money } from '../../lib/format.js';

export default function ContratarForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const clientes = useClientesCache();
  const planos = usePlanosCache();
  const { rows: usuarios } = useUsuariosList();
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    clienteId: '', planoId: '', inicio: '2026-09-01', diaVencimento: '10',
    formaPagamento: 'Boleto', vendedorUsuarioId: '',
  });

  // Assim que o catálogo carrega, pré-seleciona o primeiro plano disponível.
  useEffect(() => {
    if (planos.length > 0 && !form.planoId) {
      setForm((f) => ({ ...f, planoId: planos[0].id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planos]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const plano = planos.find((p) => p.id === form.planoId);

  const parcelasPreview = useMemo(() => {
    const [y, m] = form.inicio.split('-').map(Number);
    return Array.from({ length: 12 }).map((_, i) => {
      const d = new Date(y, m - 1 + i, Number(form.diaVencimento));
      return d.toLocaleDateString('pt-BR');
    });
  }, [form.inicio, form.diaVencimento]);

  if (planos.length === 0) {
    return (
      <>
        <PageHeader
          crumbs={[{ label: 'Início', to: '/' }, { label: 'Planos', to: '/planos' }, { label: 'Contratar plano' }]}
          title="Contratar plano"
        />
        <EmptyState icon="shield" title="Nenhum plano cadastrado ainda" action={<Button to="/configuracoes/planos">Cadastrar um plano</Button>}>
          Cadastre ao menos um plano em Configurações → Planos antes de contratar.
        </EmptyState>
      </>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!form.clienteId || salvando) return;
    setSalvando(true);
    try {
      await apiFetch('/contratos/index.php', { method: 'POST', body: form });
      reloadContratosCache();
      toast('Plano contratado — 12 parcelas recorrentes geradas automaticamente.');
      navigate('/planos');
    } catch (err) {
      toast(err.message, { kind: 'danger' });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Planos', to: '/planos' }, { label: 'Contratar plano' }]}
        title="Contratar plano"
        subtitle="Ao confirmar, o sistema gera as parcelas mensais recorrentes conforme a vigência e prepara o carnê."
      />
      <form onSubmit={submit}>
        <Card title="Contratação">
          <FieldRow>
            <Select label="Cliente" value={form.clienteId} onChange={set('clienteId')} required>
              <option value="">Selecione…</option>
              {clientes.filter((c) => c.status === 'Ativo').map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
            <Select label="Produto de plano" value={form.planoId} onChange={set('planoId')}
              options={planos.map((p) => ({ value: p.id, label: `${p.nome} — ${money(p.valorMensal)}/mês` }))} />
            <Input label="Data de início" type="date" value={form.inicio} onChange={set('inicio')} />
            <Select label="Dia de vencimento" value={form.diaVencimento} onChange={set('diaVencimento')}
              options={['1', '5', '10', '15', '20', '25']} />
            <Select label="Forma de pagamento" value={form.formaPagamento} onChange={set('formaPagamento')}
              options={['Boleto', 'Pix', 'Cartão recorrente']} />
            <Select label="Vendedor responsável" value={form.vendedorUsuarioId} onChange={set('vendedorUsuarioId')}>
              <option value="">Não informar</option>
              {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </Select>
          </FieldRow>
        </Card>

        <Card title={`Resumo — ${plano?.nome}`}>
          <div className="row between">
            <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{money(plano?.valorMensal)}<span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>/mês</span></span>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              Carência {plano?.carenciaDias} dias · até {plano?.limiteDependentes} dependentes
            </span>
          </div>
          <div className="row" style={{ gap: 'var(--space-2)', margin: 'var(--space-3) 0' }}>
            {plano?.coberturas.map((c) => <Tag key={c}>{c}</Tag>)}
          </div>
          <Alert variant="info" title="Carência (RN-01)">
            A carência começa a contar da data de início do plano ({form.inicio.split('-').reverse().join('/')}), não da data de cadastro.
          </Alert>
        </Card>

        <Card title="Prévia das 12 primeiras parcelas">
          <div className="row" style={{ gap: 'var(--space-2)' }}>
            {parcelasPreview.map((d, i) => (
              <span key={i} className="tag-chip">{i + 1}ª · {d} · {money(plano?.valorMensal)}</span>
            ))}
          </div>
        </Card>

        <div className="row" style={{ justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
          <Button variant="secondary" type="button" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={!form.clienteId} loading={salvando}>Contratar e gerar parcelas</Button>
        </div>
      </form>
    </>
  );
}
