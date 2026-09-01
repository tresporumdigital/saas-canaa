import { useState } from 'react';
import { Modal, Button, Select, Alert } from '../../components/index.js';
import { clientes } from '../../mock/clientes.js';
import { parceiros } from '../../mock/parceiros.js';

// Pop-up: gera uma guia de atendimento (cupom de desconto) para um cliente num parceiro.
export default function GerarGuiaModal({ onClose, onGenerate }) {
  const [clienteId, setClienteId] = useState('');
  const [parceiroId, setParceiroId] = useState('');

  const cliente = clientes.find((c) => c.id === clienteId);
  const parceiro = parceiros.find((p) => p.id === parceiroId);
  const pronto = Boolean(cliente && parceiro);

  const gerar = (e) => {
    e.preventDefault();
    if (!pronto) return;
    const servico = parceiro.acordo?.servicosCobertos?.[0] || parceiro.tipoParceria;
    const valor = parceiro.acordo?.tipo === 'Fixo por atendimento' ? parceiro.acordo.valor : 0;
    onGenerate({
      id: `GA-2026-9${String(Date.now()).slice(-4)}`,
      clienteNome: cliente.nome,
      clienteVinculo: 'Cliente',
      parceiroId: parceiro.id,
      servico,
      valorAcordado: valor,
      emitidaEm: new Date().toISOString(),
      emitidaPor: 'Geração manual',
      status: 'Emitida',
      coberto: true,
      historico: [],
    });
    onClose();
  };

  return (
    <Modal
      title="Gerar guia"
      onClose={onClose}
      footer={(
        <>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="gerar-guia-form" disabled={!pronto}>Gerar</Button>
        </>
      )}
    >
      <form id="gerar-guia-form" onSubmit={gerar} className="stack" style={{ gap: 'var(--space-4)' }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          A guia dá ao cliente um cupom de desconto para serviços com o parceiro selecionado.
        </p>
        <Select label="Cliente" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
          <option value="">Selecione um cliente…</option>
          {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </Select>
        <Select label="Parceiro" value={parceiroId} onChange={(e) => setParceiroId(e.target.value)}>
          <option value="">Selecione um parceiro…</option>
          {parceiros.filter((p) => p.status === 'Ativo').map((p) => (
            <option key={p.id} value={p.id}>{p.nomeFantasia} — {p.tipoParceria}</option>
          ))}
        </Select>
        {pronto && (
          <Alert variant="info">
            Guia para <strong>{cliente.nome}</strong> em <strong>{parceiro.nomeFantasia}</strong>.
          </Alert>
        )}
      </form>
    </Modal>
  );
}
