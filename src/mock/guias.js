import { obitos } from './obitos.js';

// Guias de atendimento para parceiros (RF-23..RF-30).
// Derivadas dos óbitos para manter consistência (cada óbito aciona seus parceiros).

const CICLO = ['Emitida', 'Enviada', 'Aceita', 'Em execução', 'Concluída', 'Faturada'];

// serviço da guia -> parceiro + valor acordado
const PLANOS_GUIA = [
  { servico: 'Translado do corpo até o velório', parceiroId: 'PAR-001', valor: 480 },
  { servico: 'Preparação e tanatopraxia', parceiroId: 'PAR-005', valor: 650 },
  { servico: 'Sepultamento e locação de jazigo', parceiroId: 'PAR-003', valor: 1850 },
  { servico: 'Cremação e cerimônia de despedida', parceiroId: 'PAR-004', valor: 2400 },
  { servico: 'Registro de óbito em cartório', parceiroId: 'PAR-007', valor: 320 },
  { servico: 'Coroa de flores e ornamentação', parceiroId: 'PAR-002', valor: 260 },
  { servico: 'Fornecimento de urna', parceiroId: 'PAR-008', valor: 1400 },
  { servico: 'Buffet de velório 12h', parceiroId: 'PAR-006', valor: 380 },
];

const responsaveis = ['Sandra Duarte', 'Renato Aguiar', 'Plantão noturno'];
const pad = (n, w = 2) => String(n).padStart(w, '0');

function historicoAte(idxStatus, emitidaEm) {
  const base = new Date(emitidaEm).getTime();
  return CICLO.slice(0, idxStatus + 1).map((status, i) => ({
    status,
    quando: new Date(base + i * 3 * 3600 * 1000).toISOString(),
    quem: i === 0 ? 'Sandra Duarte' : responsaveis[i % responsaveis.length],
  }));
}

export const guias = [];

obitos.forEach((ob) => {
  ob.guiaIds.forEach((gid, i) => {
    const plano = PLANOS_GUIA[(parseInt(gid.slice(-2), 10) + i) % PLANOS_GUIA.length];
    // status: óbitos concluídos -> guias faturadas/concluídas; em andamento -> meio do ciclo; aberto -> emitida
    let idxStatus;
    if (ob.status === 'Concluído') idxStatus = i === 0 ? 5 : 4;
    else if (ob.status === 'Em andamento') idxStatus = [3, 2, 1][i % 3];
    else idxStatus = 0;
    const cancelada = gid === 'GA-2026-00111';
    const emitidaEm = new Date(new Date(ob.abertoEm).getTime() + (i + 1) * 3600 * 1000).toISOString();
    const coberto = !/regulariza|particular/i.test(ob.vinculo.tipo) ? ob.cobertura?.planoAtivo !== false : false;
    guias.push({
      id: gid,
      obitoId: ob.id,
      clienteNome: ob.falecido.nome,
      clienteVinculo: ob.vinculo.tipo,
      parceiroId: plano.parceiroId,
      servico: plano.servico,
      valorAcordado: plano.valor,
      emitidaEm,
      emitidaPor: responsaveis[i % responsaveis.length],
      status: cancelada ? 'Cancelada' : CICLO[idxStatus],
      coberto: ob.cobertura ? ob.cobertura.planoAtivo && ob.cobertura.adimplente : false,
      historico: cancelada
        ? [...historicoAte(1, emitidaEm), { status: 'Cancelada', quando: new Date(new Date(emitidaEm).getTime() + 6 * 3600 * 1000).toISOString(), quem: 'Renato Aguiar' }]
        : historicoAte(idxStatus, emitidaEm),
      canceladaJustificativa: cancelada ? 'Serviço não coberto — plano com 2 parcelas em atraso. Redirecionado para cobrança particular.' : null,
      pdfNumero: gid.replace('GA-', ''),
    });
  });
});

// ordena por emissão desc
guias.sort((a, b) => new Date(b.emitidaEm) - new Date(a.emitidaEm));

export const guiaById = (id) => guias.find((g) => g.id === id);
export const guiasDoParceiro = (parceiroId) => guias.filter((g) => g.parceiroId === parceiroId);
export const guiasDoObito = (obitoId) => guias.filter((g) => g.obitoId === obitoId);

export { CICLO as CICLO_GUIA };
