// Pagamento integrado com banco (RF-65..RF-72).
export const pagamentos = [
  { id: 'PG-2026-2041', parcelaRef: 'CTR-2026-0001-P12', contratoRef: 'CTR-2026-0001', clienteNome: 'Marina Alves Costa', valor: 149.9, meio: 'Boleto', recebidoEm: '2026-08-11T08:14:00', status: 'Conciliado', identificador: '34191.79001 01043.510047 91020.150008 5 99110000014990', observacao: null },
  { id: 'PG-2026-2040', parcelaRef: 'CTR-2026-0003-P12', contratoRef: 'CTR-2026-0003', clienteNome: 'Aparecida Nogueira Lima', valor: 149.9, meio: 'Pix', recebidoEm: '2026-08-15T19:22:00', status: 'Conciliado', identificador: 'PIX-e2f1a9c7-8b3d', observacao: null },
  { id: 'PG-2026-2039', parcelaRef: null, contratoRef: null, clienteNome: 'Depósito não identificado', valor: 200, meio: 'Transferência', recebidoEm: '2026-08-24T13:05:00', status: 'Exceção', identificador: 'TED-778120', observacao: 'Valor não corresponde a nenhuma parcela em aberto. Aguardando identificação do pagador.' },
  { id: 'PG-2026-2038', parcelaRef: 'CTR-2026-0002-P10', contratoRef: 'CTR-2026-0002', clienteNome: 'José Ribeiro da Silva', valor: 119.9, meio: 'Dinheiro', recebidoEm: '2026-08-05T10:40:00', status: 'Baixa manual', identificador: 'CAIXA-08-05', observacao: 'Pago no balcão. Baixa registrada por Financeiro (Ana Paula).' },
  { id: 'PG-2026-2037', parcelaRef: 'CTR-2026-0006-P12', contratoRef: 'CTR-2026-0006', clienteNome: 'Roberto Carlos Antunes', valor: 229.9, meio: 'Boleto', recebidoEm: '2026-08-10T09:02:00', status: 'Conciliado', identificador: '34191.79001 01043.510047 91020.150008 5 99110000022990', observacao: null },
  { id: 'PG-2026-2036', parcelaRef: 'CTR-2026-0007-P12', contratoRef: 'CTR-2026-0007', clienteNome: 'Vera Lúcia Prado', valor: 149.9, meio: 'Pix', recebidoEm: '2026-08-01T07:31:00', status: 'Conciliado', identificador: 'PIX-a71c33ff-2d90', observacao: null },
  { id: 'PG-2026-2035', parcelaRef: null, contratoRef: null, clienteNome: 'Pagamento em duplicidade', valor: 149.9, meio: 'Pix', recebidoEm: '2026-08-16T11:10:00', status: 'Exceção', identificador: 'PIX-e2f1a9c7-8b3d-DUP', observacao: 'Segundo Pix idêntico ao PG-2026-2040. Gerar crédito na conta do cliente (RN-05), não baixar em duplicidade.' },
  { id: 'PG-2026-2034', parcelaRef: 'CTR-2026-0010-P12', contratoRef: 'CTR-2026-0010', clienteNome: 'Antônio Carlos Ferreira', valor: 149.9, meio: 'Boleto', recebidoEm: '2026-08-14T14:20:00', status: 'Conciliado', identificador: '34191.79001 01043.510047 91020.150008 5 99110000014990', observacao: null },
  { id: 'PG-2026-2033', parcelaRef: 'CTR-2026-0013-P12', contratoRef: 'CTR-2026-0013', clienteNome: 'Cleuza Maria dos Santos', valor: 149.9, meio: 'Pix', recebidoEm: '2026-08-10T20:05:00', status: 'Conciliado', identificador: 'PIX-90ab12cd-77ef', observacao: null },
  { id: 'PG-2026-2032', parcelaRef: 'CTR-2026-0014-P12', contratoRef: 'CTR-2026-0014', clienteNome: 'Wilson Batista Rocha', valor: 229.9, meio: 'Boleto', recebidoEm: '2026-08-01T08:50:00', status: 'Conciliado', identificador: '34191.79001 01043.510047 91020.150008 5 99110000022990', observacao: null },
  { id: 'PG-2026-2031', parcelaRef: 'CTR-2026-0005-P12', contratoRef: 'CTR-2026-0005', clienteNome: 'Terezinha de Jesus Farias', valor: 119.9, meio: 'Boleto', recebidoEm: '2026-08-06T09:15:00', status: 'Conciliado', identificador: '34191.79001 01043.510047 91020.150008 5 99110000011990', observacao: null },
  { id: 'PG-2026-2030', parcelaRef: 'CTR-2026-0017-P12', contratoRef: 'CTR-2026-0017', clienteNome: 'Rosângela Martins Dias', valor: 149.9, meio: 'Cartão recorrente', recebidoEm: '2026-08-10T02:00:00', status: 'Conciliado', identificador: 'CARD-8842-recur', observacao: null },
  { id: 'PG-2026-2029', parcelaRef: null, contratoRef: null, clienteNome: 'Boleto pago a menor', valor: 90, meio: 'Boleto', recebidoEm: '2026-08-20T16:44:00', status: 'Exceção', identificador: '34191.79001 ... 0009000', observacao: 'Pagamento parcial (parcela de R$ 149,90). Registrar pagamento parcial e cobrar diferença + juros.' },
  { id: 'PG-2026-2028', parcelaRef: 'CTR-2026-0009-P12', contratoRef: 'CTR-2026-0009', clienteNome: 'Sandra Regina Duarte', valor: 89.9, meio: 'Cartão recorrente', recebidoEm: '2026-08-10T02:00:00', status: 'Conciliado', identificador: 'CARD-1102-recur', observacao: null },
  { id: 'PG-2026-2027', parcelaRef: 'CTR-2026-0019-P12', contratoRef: 'CTR-2026-0019', clienteNome: 'Divina Aparecida Moraes', valor: 89.9, meio: 'Pix', recebidoEm: '2026-08-25T09:30:00', status: 'Conciliado', identificador: 'PIX-11ff22aa-88bc', observacao: null },
  { id: 'PG-2026-2026', parcelaRef: 'CTR-2026-0020-P12', contratoRef: 'CTR-2026-0020', clienteNome: 'Edson Luís Carvalho', valor: 149.9, meio: 'Boleto', recebidoEm: '2026-08-11T10:00:00', status: 'Conciliado', identificador: '34191.79001 ... 0014990', observacao: null },
];

export const pagamentoById = (id) => pagamentos.find((p) => p.id === id);
export const filaExcecoes = () => pagamentos.filter((p) => p.status === 'Exceção');

export const logApiBancaria = [
  { quando: '2026-08-27T06:00:12', endpoint: '/v2/boletos/retorno', metodo: 'GET', http: 200, resultado: 'Arquivo de retorno processado — 34 registros' },
  { quando: '2026-08-27T05:59:40', endpoint: '/v2/pix/webhook', metodo: 'POST', http: 200, resultado: 'Confirmação Pix PIX-11ff22aa-88bc' },
  { quando: '2026-08-26T18:22:03', endpoint: '/v2/cobrancas', metodo: 'POST', http: 201, resultado: 'Boleto emitido — CTR-2026-0016-P10' },
  { quando: '2026-08-26T12:10:55', endpoint: '/v2/pix/webhook', metodo: 'POST', http: 200, resultado: 'Confirmação Pix PIX-11ff22aa-2211 (duplicidade detectada)' },
  { quando: '2026-08-26T09:04:11', endpoint: '/v2/boletos/CTR-2026-0002-P10', metodo: 'GET', http: 200, resultado: 'Consulta de situação — LIQUIDADO' },
  { quando: '2026-08-25T22:41:37', endpoint: '/v2/cobrancas/lote', metodo: 'POST', http: 207, resultado: 'Lote 128 — 51 emitidos, 2 rejeitados (CNPJ inválido)' },
  { quando: '2026-08-25T06:00:09', endpoint: '/v2/boletos/retorno', metodo: 'GET', http: 200, resultado: 'Arquivo de retorno processado — 41 registros' },
  { quando: '2026-08-24T14:58:20', endpoint: '/v2/pix/webhook', metodo: 'POST', http: 500, resultado: 'Falha temporária — reenfileirado, reprocessado às 15:03 (RNF-11)' },
];
