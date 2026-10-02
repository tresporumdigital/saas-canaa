import { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Input, Select, FieldRow, Alert, Tag, EmptyState } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { apiFetch, reloadContratosCache, useClientesCache, usePlanosCache, useUsuariosList } from '../../lib/api.js';
import { money, todayISO } from '../../lib/format.js';

// Pop-up de contratação de plano — aberto a partir de Planos ("Contratar plano") e do
// detalhe do Cliente (com o cliente já pré-selecionado em `clienteId`).
export default function ContratarModal({ clienteId = '', onClose, onSaved }) {
  const { toast } = useToast();
  const clientes = useClientesCache();
  const planos = usePlanosCache();
  const { rows: usuarios } = useUsuariosList();
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    clienteId, planoId: '', inicio: todayISO(), diaVencimento: '10',
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
    if (!y || !m) return [];
    return Array.from({ length: 12 }).map((_, i) => {
      const d = new Date(y, m - 1 + i, Number(form.diaVencimento));
      return d.toLocaleDateString('pt-BR');
    });
  }, [form.inicio, form.diaVencimento]);

  const submit = async (e) => {
    e?.preventDefault();
    if (!form.clienteId || !form.planoId || salvando) return;
    setSalvando(true);
    try {
      await apiFetch('/contratos/index.php', { method: 'POST', body: form });
      reloadContratosCache();
      toast('Plano contratado — 12 parcelas recorrentes geradas automaticamente.');
      onSaved?.();
      onClose();
    } catch (err) {
      toast(err.message, { kind: 'danger' });
    } finally {
      setSalvando(false);
    }
  };

  if (planos.length === 0) {
    return (
      <Modal title="Contratar plano" onClose={onClose} wide
        footer={<Button size="sm" variant="secondary" onClick={onClose}>Fechar</Button>}>
        <EmptyState icon="shield" title="Nenhum plano cadastrado ainda" action={<Button to="/configuracoes/planos">Cadastrar um plano</Button>}>
          Cadastre ao menos um plano em Configurações → Planos antes de contratar.
        </EmptyState>
      </Modal>
    );
  }

  return (
    <Modal
      title="Contratar plano"
      onClose={onClose}
      wide
      footer={
        <>
          <Button size="sm" variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button size="sm" variant="primary" onClick={submit} disabled={!form.clienteId || !form.planoId} loading={salvando}>
            Contratar e gerar parcelas
          </Button>
        </>
      }
    >
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
          Ao confirmar, o sistema gera as parcelas mensais recorrentes conforme a vigência e prepara o carnê.
        </p>
        <FieldRow>
          <Select label="Cliente" value={form.clienteId} onChange={set('clienteId')} required>
            <option value="">Selecione…</option>
            {clientes.filter((c) => c.status === 'Ativo' || c.id === clienteId).map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
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

        {plano && (
          <div>
            <div className="row between">
              <span style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>{money(plano.valorMensal)}<span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>/mês</span></span>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                Carência {plano.carenciaDias} dias · até {plano.limiteDependentes} dependentes
              </span>
            </div>
            {plano.coberturas?.length > 0 && (
              <div className="row" style={{ gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                {plano.coberturas.map((c) => <Tag key={c}>{c}</Tag>)}
              </div>
            )}
          </div>
        )}

        <Alert variant="info" title="Carência (RN-01)">
          A carência começa a contar da data de início do plano ({form.inicio.split('-').reverse().join('/')}), não da data de cadastro.
        </Alert>

        <div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Prévia das 12 primeiras parcelas</div>
          <div className="row" style={{ gap: 'var(--space-2)' }}>
            {parcelasPreview.map((d, i) => (
              <span key={i} className="tag-chip">{i + 1}ª · {d} · {money(plano?.valorMensal)}</span>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
