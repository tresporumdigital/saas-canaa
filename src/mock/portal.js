// Baixa de planos por parceiros comerciais (RF-104..RF-111).
export const baixasParceiro = [
  { id: 'BX-2026-0088', parceiroId: 'PAR-003', clienteNome: 'Neusa Aparecida Gomes', contratoRef: 'CTR-2026-0015', servicoPrestado: 'Sepultamento — Quadra 12', dataHora: '2026-08-24T15:30:00', valor: 1850, observacoes: 'Sepultamento realizado conforme guia GA-2026-00120.', status: 'Aprovado', comprovante: true, ip: '187.62.14.203', usuarioPortal: 'jardimoliveiras.paulo' },
  { id: 'BX-2026-0087', parceiroId: 'PAR-001', clienteNome: 'Neusa Aparecida Gomes', contratoRef: 'CTR-2026-0015', servicoPrestado: 'Translado do corpo até o velório', dataHora: '2026-08-24T09:10:00', valor: 480, observacoes: 'Remoção do hospital para o velório.', status: 'Aprovado', comprovante: true, ip: '201.44.90.11', usuarioPortal: 'boaviagem.wagner' },
  { id: 'BX-2026-0086', parceiroId: 'PAR-004', clienteNome: 'Osvaldo Prado', contratoRef: 'CTR-2026-0007', servicoPrestado: 'Cremação e cerimônia de despedida', dataHora: '2026-08-27T11:00:00', valor: 2400, observacoes: 'Agendada para 27/08 às 16h.', status: 'Aguardando aprovação', comprovante: false, ip: '177.10.55.240', usuarioPortal: 'memorialbosque.renata' },
  { id: 'BX-2026-0085', parceiroId: 'PAR-007', clienteNome: 'Osvaldo Prado', contratoRef: 'CTR-2026-0007', servicoPrestado: 'Registro de óbito em cartório', dataHora: '2026-08-27T08:40:00', valor: 320, observacoes: 'DO protocolada no 9º Cartório.', status: 'Aprovado', comprovante: true, ip: '187.33.201.9', usuarioPortal: 'documenta.andre' },
  { id: 'BX-2026-0084', parceiroId: 'PAR-005', clienteNome: 'Antônio Alves Costa', contratoRef: 'CTR-2026-0001', servicoPrestado: 'Preparação e tanatopraxia', dataHora: '2026-08-03T07:20:00', valor: 650, observacoes: '', status: 'Aprovado', comprovante: true, ip: '189.5.44.170', usuarioPortal: 'artefinal.claudio' },
  { id: 'BX-2026-0083', parceiroId: 'PAR-003', clienteNome: 'Manoel Pereira Lopes', contratoRef: 'CTR-2026-0018', servicoPrestado: 'Sepultamento — Vila Formosa', dataHora: '2026-08-11T16:00:00', valor: 1850, observacoes: 'Quadra 44.', status: 'Aprovado', comprovante: true, ip: '187.62.14.203', usuarioPortal: 'jardimoliveiras.paulo' },
  { id: 'BX-2026-0082', parceiroId: 'PAR-002', clienteNome: 'Manoel Pereira Lopes', contratoRef: 'CTR-2026-0018', servicoPrestado: 'Coroa de flores e ornamentação', dataHora: '2026-08-11T13:30:00', valor: 260, observacoes: '', status: 'Aprovado', comprovante: true, ip: '191.9.88.44', usuarioPortal: 'floriculturajardim.marta' },
  { id: 'BX-2026-0081', parceiroId: 'PAR-004', clienteNome: 'Rita de Cássia Moura', contratoRef: 'CTR-2026-0013', servicoPrestado: 'Cremação e cerimônia de despedida', dataHora: '2026-07-19T18:00:00', valor: 2400, observacoes: '', status: 'Aprovado', comprovante: true, ip: '177.10.55.240', usuarioPortal: 'memorialbosque.renata' },
  { id: 'BX-2026-0080', parceiroId: 'PAR-006', clienteNome: 'Ivone Cardoso Melo', contratoRef: 'CTR-2026-0019', servicoPrestado: 'Buffet de velório 12h', dataHora: '2026-06-29T20:00:00', valor: 380, observacoes: 'Serviço fora da cobertura padrão — acima do limite configurável, enviado para aprovação.', status: 'Aprovado', comprovante: true, ip: '200.171.4.90', usuarioPortal: 'confortovelorio.silvia' },
  { id: 'BX-2026-0079', parceiroId: 'PAR-001', clienteNome: 'Jorge Amado Ferreira', contratoRef: 'CTR-2026-0004', servicoPrestado: 'Translado do corpo até o velório', dataHora: '2026-06-15T09:00:00', valor: 480, observacoes: '', status: 'Aprovado', comprovante: true, ip: '201.44.90.11', usuarioPortal: 'boaviagem.wagner' },
  { id: 'BX-2026-0078', parceiroId: 'PAR-003', clienteNome: 'Maria do Carmo Silveira', contratoRef: 'CTR-2026-0005', servicoPrestado: 'Sepultamento — Vila Formosa', dataHora: '2026-06-02T17:30:00', valor: 1850, observacoes: '', status: 'Aprovado', comprovante: true, ip: '187.62.14.203', usuarioPortal: 'jardimoliveiras.paulo' },
  { id: 'BX-2026-0077', parceiroId: 'PAR-008', clienteNome: 'Célia Regina Tavares', contratoRef: 'CTR-2026-0010', servicoPrestado: 'Fornecimento de urna semiluxo', dataHora: '2026-05-09T05:40:00', valor: 1400, observacoes: '', status: 'Aprovado', comprovante: true, ip: '186.220.7.33', usuarioPortal: 'luzeterna.fernando' },
];

export const baixasDoParceiro = (parceiroId) => baixasParceiro.filter((b) => b.parceiroId === parceiroId);

// Extrato: total a receber no período por parceiro
export function extratoParceiro(parceiroId, { somenteAprovadas = true } = {}) {
  const itens = baixasDoParceiro(parceiroId).filter((b) => (somenteAprovadas ? b.status === 'Aprovado' : true));
  const total = itens.reduce((s, b) => s + b.valor, 0);
  return { itens, total };
}
