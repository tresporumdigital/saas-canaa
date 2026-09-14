import { useMemo, useState } from 'react';
import { Modal, Button, Select, Alert, PrintDocument } from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { apiFetch, useClientesCache, useContratosCache, useParceirosCache } from '../../lib/api.js';
import { dateTime, money } from '../../lib/format.js';

// Pop-up: busca o contrato pelo titular, escolhe o beneficiário (titular ou dependente)
// e o parceiro, gera a guia (cupom de desconto) e mostra o PDF para imprimir ou baixar.
export default function GerarGuiaModal({ onClose, onGenerate }) {
  const { toast } = useToast();
  const clientes = useClientesCache();
  const parceiros = useParceirosCache();
  const contratos = useContratosCache();
  const contratosDoCliente = (clienteId) => contratos.filter((c) => c.clienteId === clienteId);
  const [clienteBuscaId, setClienteBuscaId] = useState('');
  const [contrato, setContrato] = useState(null);
  const [buscou, setBuscou] = useState(false);
  const [beneficiarioId, setBeneficiarioId] = useState('');
  const [parceiroId, setParceiroId] = useState('');
  const [guiaGerada, setGuiaGerada] = useState(null);

  const clienteBusca = clientes.find((c) => c.id === clienteBuscaId);
  const parceiro = parceiros.find((p) => p.id === parceiroId);

  const buscarContrato = () => {
    const c = clienteBusca ? contratosDoCliente(clienteBusca.id)[0] : null;
    setContrato(c || null);
    setBuscou(true);
    setBeneficiarioId('');
  };

  const beneficiarios = useMemo(() => {
    if (!clienteBusca) return [];
    const titular = { id: 'titular', nome: clienteBusca.nome, vinculo: 'Titular' };
    const deps = (clienteBusca.dependentes || []).map((d) => ({ id: d.id, nome: d.nome, vinculo: 'Dependente' }));
    return [titular, ...deps];
  }, [clienteBusca]);

  const beneficiario = beneficiarios.find((b) => b.id === beneficiarioId);
  const pronto = Boolean(contrato && beneficiario && parceiro);
  const [salvando, setSalvando] = useState(false);

  const gerar = async (e) => {
    e.preventDefault();
    if (!pronto || salvando) return;
    setSalvando(true);
    const servico = parceiro.acordo?.servicosCobertos?.[0] || parceiro.tipoParceria;
    const valor = parceiro.acordo?.tipo === 'Fixo por atendimento' ? parceiro.acordo.valor : 0;
    try {
      const { id } = await apiFetch('/guias/index.php', {
        method: 'POST',
        body: {
          contratoId: contrato.id, parceiroId: parceiro.id,
          clienteNome: beneficiario.nome, clienteVinculo: beneficiario.vinculo,
          servico, valorAcordado: valor, coberto: true,
        },
      });
      const nova = {
        id,
        clienteNome: beneficiario.nome,
        clienteVinculo: beneficiario.vinculo,
        contratoId: contrato.id,
        parceiroId: parceiro.id,
        servico,
        valorAcordado: valor,
        emitidaEm: new Date().toISOString(),
        emitidaPor: 'Geração manual',
        status: 'Emitida',
        coberto: true,
        pdfNumero: id.replace('GA-', ''),
      };
      onGenerate(nova);
      setGuiaGerada(nova);
    } catch (err) {
      toast(err.message, { kind: 'danger' });
    } finally {
      setSalvando(false);
    }
  };

  if (guiaGerada) {
    return (
      <Modal
        title="Guia de atendimento — PDF"
        onClose={onClose}
        wide
        footer={(
          <>
            <Button variant="secondary" onClick={onClose}>Fechar</Button>
            <Button variant="secondary" icon="download" onClick={() => toast('Guia baixada em PDF (simulação).')}>Baixar</Button>
            <Button variant="primary" icon="print" onClick={() => window.print()}>Imprimir</Button>
          </>
        )}
      >
        <PrintDocument kind="Guia de Atendimento" numero={guiaGerada.pdfNumero}>
          <table>
            <tbody>
              <tr><th>Cliente</th><td>{guiaGerada.clienteNome}</td><th>Vínculo</th><td>{guiaGerada.clienteVinculo}</td></tr>
              <tr><th>Contrato</th><td>{contrato.id}</td><th>Emissão</th><td>{dateTime(guiaGerada.emitidaEm)}</td></tr>
              <tr><th>Parceiro</th><td>{parceiro.razaoSocial}</td><th>CNPJ</th><td>{parceiro.cnpj}</td></tr>
              <tr><th>Serviço solicitado</th><td colSpan={3}>{guiaGerada.servico}</td></tr>
              <tr><th>Plano / cobertura</th><td>Coberto pelo plano</td><th>Valor acordado</th><td>{money(guiaGerada.valorAcordado)}</td></tr>
            </tbody>
          </table>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
            Documento gerado pelo Sistema de Gestão Funerária Canaã. Válido mediante aceite do parceiro no portal.
          </p>
          <div className="pd-sign">
            <div>Emitente — Funerária Canaã</div>
            <div>Aceite do parceiro — {parceiro.nomeFantasia}</div>
          </div>
        </PrintDocument>
      </Modal>
    );
  }

  return (
    <Modal
      title="Gerar guia"
      onClose={onClose}
      wide
      footer={(
        <>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="gerar-guia-form" disabled={!pronto} loading={salvando}>Gerar</Button>
        </>
      )}
    >
      <form id="gerar-guia-form" onSubmit={gerar} className="stack" style={{ gap: 'var(--space-4)' }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          A guia dá ao beneficiário um cupom de desconto para serviços com o parceiro selecionado.
        </p>

        <div>
          <div className="card-title">Contrato</div>
          <Select
            label="Titular do contrato"
            value={clienteBuscaId}
            onChange={(e) => { setClienteBuscaId(e.target.value); setBuscou(false); setContrato(null); setBeneficiarioId(''); }}
          >
            <option value="">Selecione um cliente…</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </Select>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <Button variant="secondary" icon="search" type="button" onClick={buscarContrato} disabled={!clienteBuscaId}>Buscar</Button>
          </div>
          {buscou && contrato && (
            <Alert variant="info" title={`Contrato nº ${contrato.id}`}>Situação: {contrato.situacao}</Alert>
          )}
          {buscou && !contrato && (
            <Alert variant="warning">Este cliente não possui contrato de plano.</Alert>
          )}
        </div>

        {contrato && (
          <Select label="Cliente" value={beneficiarioId} onChange={(e) => setBeneficiarioId(e.target.value)}>
            <option value="">Selecione o titular ou um dependente…</option>
            {beneficiarios.map((b) => <option key={b.id} value={b.id}>{b.nome} ({b.vinculo})</option>)}
          </Select>
        )}

        <Select label="Parceiro" value={parceiroId} onChange={(e) => setParceiroId(e.target.value)}>
          <option value="">Selecione um parceiro…</option>
          {parceiros.filter((p) => p.status === 'Ativo').map((p) => (
            <option key={p.id} value={p.id}>{p.nomeFantasia} — {p.tipoParceria}</option>
          ))}
        </Select>

        {pronto && (
          <Alert variant="info">
            Guia para <strong>{beneficiario.nome}</strong> em <strong>{parceiro.nomeFantasia}</strong>.
          </Alert>
        )}
      </form>
    </Modal>
  );
}
