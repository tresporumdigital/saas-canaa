import { useState } from 'react';
import { Modal, Button, Select, Input, Alert } from '../../components/index.js';
import { clientes } from '../../mock/clientes.js';
import { money } from '../../lib/format.js';

const SERVICOS = [
  'Plano funerário — mensalidade',
  'Serviço funerário completo',
  'Translado de corpo',
  'Ornamentação e flores',
  'Cremação',
  'Sepultamento e taxas',
  'Locação de equipamento',
  'Venda de equipamento',
];

// Pop-up: gera uma nota fiscal (NFS-e / NF-e) pré-preenchida para um cliente.
export default function GerarNotaModal({ onClose, onGenerate }) {
  const [clienteId, setClienteId] = useState('');
  const [tipo, setTipo] = useState('NFS-e');
  const [servico, setServico] = useState(SERVICOS[0]);
  const [valor, setValor] = useState('');

  const cliente = clientes.find((c) => c.id === clienteId);
  const valorNum = Number(valor);
  const pronto = Boolean(cliente && valorNum > 0);
  const aliquota = tipo === 'NFS-e' ? 0.05 : 0.18;
  const impostos = pronto ? valorNum * aliquota : 0;

  const gerar = (e) => {
    e.preventDefault();
    if (!pronto) return;
    onGenerate({
      id: `NF-2026-9${String(Date.now()).slice(-4)}`,
      tipo,
      origemTipo: 'Emissão manual',
      origemRef: servico,
      clienteNome: cliente.nome,
      servico,
      valor: valorNum,
      impostos: Number(impostos.toFixed(2)),
      status: 'Pendente',
      emitidaEm: null,
      numero: null,
      motivoRejeicao: null,
    });
    onClose();
  };

  return (
    <Modal
      title="Gerar nota fiscal"
      onClose={onClose}
      wide
      footer={(
        <>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="gerar-nota-form" disabled={!pronto}>Gerar</Button>
        </>
      )}
    >
      <form id="gerar-nota-form" onSubmit={gerar} className="stack" style={{ gap: 'var(--space-4)' }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          A nota entra na fila de emissão como <strong>Pendente</strong>, pronta para ser enviada à SEFAZ / prefeitura.
        </p>
        <Select label="Cliente" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
          <option value="">Selecione um cliente…</option>
          {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </Select>
        <Select label="Tipo de nota" value={tipo} onChange={(e) => setTipo(e.target.value)}
          options={['NFS-e', 'NF-e']} />
        <Select label="Serviço / item" value={servico} onChange={(e) => setServico(e.target.value)} options={SERVICOS} />
        <Input label="Valor (R$)" type="number" min="0" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} required />
        {pronto && (
          <Alert variant="info">
            {tipo} para <strong>{cliente.nome}</strong> — {servico}. Impostos estimados {money(impostos)} ({(aliquota * 100).toFixed(0)}%).
          </Alert>
        )}
      </form>
    </Modal>
  );
}
