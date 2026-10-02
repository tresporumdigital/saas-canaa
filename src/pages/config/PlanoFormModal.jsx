import { useState } from 'react';
import { Modal, Button, Input, FieldRow } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { apiFetch, useEquipamentosCache } from '../../lib/api.js';
import { maskMoney, moneyToNumber, numberToMoneyInput } from '../../lib/masks.js';

const vazio = { nome: '', valorMensal: '', carenciaDias: '90', limiteDependentes: '4', coberturas: [] };
const GRUPOS = [['Serviço', 'Serviços'], ['Produto', 'Produtos'], ['Equipamento', 'Equipamentos']];

// Pop-up de cadastro/edição de um plano (produto) oferecido nas unidades.
export default function PlanoFormModal({ plano, onClose, onSaved }) {
  const editando = Boolean(plano);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState(() => (
    editando ? {
      nome: plano.nome,
      valorMensal: numberToMoneyInput(plano.valorMensal),
      carenciaDias: String(plano.carenciaDias),
      limiteDependentes: String(plano.limiteDependentes),
      coberturas: plano.coberturas || [],
    } : { ...vazio }
  ));
  const { toast } = useToast();
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  // Cobertura = itens (produtos, serviços e equipamentos) cadastrados em Operação → Cadastros.
  const catalogo = useEquipamentosCache();
  const nomesCatalogo = new Set(catalogo.map((p) => p.descricao));
  // Coberturas antigas digitadas à mão (antes da seleção) continuam visíveis para poderem ser removidas.
  const avulsas = form.coberturas.filter((c) => !nomesCatalogo.has(c));
  const toggleCobertura = (nome) => setForm((f) => ({
    ...f,
    coberturas: f.coberturas.includes(nome) ? f.coberturas.filter((c) => c !== nome) : [...f.coberturas, nome],
  }));
  const pronto = form.nome.trim() && moneyToNumber(form.valorMensal) > 0;

  const submit = async (e) => {
    e.preventDefault();
    if (!pronto || salvando) return;
    setSalvando(true);
    const dados = {
      nome: form.nome.trim(),
      valorMensal: moneyToNumber(form.valorMensal),
      carenciaDias: Number(form.carenciaDias) || 0,
      limiteDependentes: Number(form.limiteDependentes) || 0,
      coberturas: form.coberturas,
    };
    try {
      if (editando) {
        await apiFetch(`/planos/detail.php?id=${encodeURIComponent(plano.id)}`, { method: 'PUT', body: dados });
        toast(`Plano ${dados.nome} atualizado.`);
      } else {
        await apiFetch('/planos/index.php', { method: 'POST', body: dados });
        toast(`Plano ${dados.nome} cadastrado.`);
      }
      onSaved?.();
    } catch (err) {
      toast(err.message, { kind: 'danger' });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      title={editando ? `Editar ${plano.nome}` : 'Novo plano'}
      onClose={onClose}
      wide
      footer={(
        <>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="plano-form" disabled={!pronto} loading={salvando}>
            {editando ? 'Salvar alterações' : 'Cadastrar plano'}
          </Button>
        </>
      )}
    >
      <form id="plano-form" onSubmit={submit} className="stack" style={{ gap: 'var(--space-4)' }}>
        <FieldRow>
          <Input label="Nome do plano" value={form.nome} onChange={set('nome')} required />
          <Input label="Valor mensal (R$)" value={form.valorMensal} onChange={(e) => setForm((f) => ({ ...f, valorMensal: maskMoney(e.target.value) }))} placeholder="R$ 0,00" required />
          <Input label="Carência (dias)" type="number" min="0" value={form.carenciaDias} onChange={set('carenciaDias')} />
          <Input label="Limite de dependentes" type="number" min="0" value={form.limiteDependentes} onChange={set('limiteDependentes')} />
        </FieldRow>
        <div>
          <div className="card-title">Cobertura — produtos e serviços inclusos ({form.coberturas.length})</div>
          {catalogo.length === 0 && avulsas.length === 0 ? (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
              Nenhum produto ou serviço cadastrado ainda — cadastre em Operação → Cadastros ou Serviços.
            </p>
          ) : (
            <div className="stack" style={{ gap: 'var(--space-3)', maxHeight: 280, overflowY: 'auto' }}>
              {GRUPOS.map(([tipo, rotulo]) => {
                const itens = catalogo.filter((p) => (p.tipo || 'Equipamento') === tipo);
                if (itens.length === 0) return null;
                return (
                  <fieldset key={tipo} className="cobertura-grupo">
                    <legend>{rotulo}</legend>
                    {itens.map((p) => (
                      <label key={p.id} className="cobertura-opcao">
                        <input type="checkbox" checked={form.coberturas.includes(p.descricao)} onChange={() => toggleCobertura(p.descricao)} />
                        <span>{p.descricao}</span>
                      </label>
                    ))}
                  </fieldset>
                );
              })}
              {avulsas.length > 0 && (
                <fieldset className="cobertura-grupo">
                  <legend>Coberturas antigas (fora do cadastro)</legend>
                  {avulsas.map((c) => (
                    <label key={c} className="cobertura-opcao">
                      <input type="checkbox" checked onChange={() => toggleCobertura(c)} />
                      <span>{c}</span>
                    </label>
                  ))}
                </fieldset>
              )}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
