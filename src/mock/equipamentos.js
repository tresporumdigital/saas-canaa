// Equipamentos para convalescentes: catálogo, inventário unitário, empréstimos e vendas.
// RF-40..RF-56.

export const equipamentosProduto = [
  { id: 'EQ-CDR', descricao: 'Cadeira de rodas dobrável', categoria: 'Mobilidade', precoCusto: 420, precoVenda: 890, estoque: 6, estoqueMinimo: 4, locavel: true },
  { id: 'EQ-CMH', descricao: 'Cama hospitalar manual 2 manivelas', categoria: 'Leito', precoCusto: 1650, precoVenda: 3290, estoque: 2, estoqueMinimo: 2, locavel: true },
  { id: 'EQ-CLP', descricao: 'Colchão pneumático antiescaras', categoria: 'Leito', precoCusto: 240, precoVenda: 520, estoque: 3, estoqueMinimo: 3, locavel: true },
  { id: 'EQ-AND', descricao: 'Andador alumínio dobrável', categoria: 'Mobilidade', precoCusto: 130, precoVenda: 320, estoque: 9, estoqueMinimo: 4, locavel: true },
  { id: 'EQ-CBN', descricao: 'Cadeira de banho', categoria: 'Higiene', precoCusto: 180, precoVenda: 410, estoque: 4, estoqueMinimo: 3, locavel: true },
  { id: 'EQ-MUL', descricao: 'Par de muletas axilares', categoria: 'Mobilidade', precoCusto: 60, precoVenda: 160, estoque: 12, estoqueMinimo: 6, locavel: false },
  { id: 'EQ-OXI', descricao: 'Concentrador de oxigênio 5L', categoria: 'Respiratório', precoCusto: 2100, precoVenda: 4200, estoque: 1, estoqueMinimo: 2, locavel: true },
  { id: 'EQ-NEB', descricao: 'Nebulizador ultrassônico', categoria: 'Respiratório', precoCusto: 95, precoVenda: 240, estoque: 7, estoqueMinimo: 4, locavel: false },
  { id: 'EQ-SPS', descricao: 'Suporte de soro com rodízios', categoria: 'Leito', precoCusto: 110, precoVenda: 260, estoque: 5, estoqueMinimo: 3, locavel: true },
  { id: 'EQ-BEN', descricao: 'Bengala ortopédica regulável', categoria: 'Mobilidade', precoCusto: 25, precoVenda: 70, estoque: 15, estoqueMinimo: 8, locavel: false },
];

export const equipamentoProdutoById = (id) => equipamentosProduto.find((p) => p.id === id);
export const equipamentosAbaixoDoMinimo = () => equipamentosProduto.filter((p) => p.estoque <= p.estoqueMinimo);

// ---- Inventário unitário (cada unidade tem patrimônio) ----
const UNIDADE_DEFS = [
  { produtoId: 'EQ-CDR', qtd: 14, prefixo: 'CDR' },
  { produtoId: 'EQ-CMH', qtd: 6, prefixo: 'CMH' },
  { produtoId: 'EQ-CLP', qtd: 6, prefixo: 'CLP' },
  { produtoId: 'EQ-AND', qtd: 8, prefixo: 'AND' },
  { produtoId: 'EQ-CBN', qtd: 6, prefixo: 'CBN' },
  { produtoId: 'EQ-OXI', qtd: 3, prefixo: 'OXI' },
  { produtoId: 'EQ-SPS', qtd: 5, prefixo: 'SPS' },
];
const CONS = ['Ótimo', 'Bom', 'Bom', 'Regular'];
const pad3 = (n) => String(n).padStart(3, '0');

export const unidadesEquipamento = [];
UNIDADE_DEFS.forEach((def) => {
  const prod = equipamentoProdutoById(def.produtoId);
  for (let i = 1; i <= def.qtd; i++) {
    // ~1/3 emprestadas, algumas em manutenção/baixadas
    let status = 'Disponível';
    if (i % 3 === 0) status = 'Emprestado';
    else if (i === def.qtd) status = 'Em manutenção';
    else if (def.prefixo === 'CDR' && i === 13) status = 'Baixado';
    unidadesEquipamento.push({
      id: `${def.prefixo}-${pad3(i)}`,
      patrimonio: `${def.prefixo}-${pad3(i)}`,
      produtoId: def.produtoId,
      descricao: prod.descricao,
      status,
      estadoConservacao: CONS[i % CONS.length],
      aquisicao: `202${2 + (i % 3)}-0${1 + (i % 8)}-1${i % 9}`,
    });
  }
});

export const unidadeByPatrimonio = (p) => unidadesEquipamento.find((u) => u.patrimonio === p);

// ---- Empréstimos ----
export const emprestimos = [
  { id: 'EMP-2026-0031', unidadePatrimonio: 'CDR-003', produtoDescricao: 'Cadeira de rodas dobrável', clienteId: 'CLI-0003', clienteNome: 'Aparecida Nogueira Lima', saidaEm: '2026-08-02', previsaoDevolucao: '2026-09-02', devolucaoEm: null, responsavelRetirada: 'Carlos Nogueira Lima', estadoSaida: 'Bom', estadoDevolucao: null, vinculo: { tipo: 'Cobertura de plano', contratoId: 'CTR-2026-0003', valorLocacao: 0 }, status: 'Em vigência' },
  { id: 'EMP-2026-0030', unidadePatrimonio: 'CMH-003', produtoDescricao: 'Cama hospitalar manual 2 manivelas', clienteId: 'CLI-0006', clienteNome: 'Roberto Carlos Antunes', saidaEm: '2026-07-10', previsaoDevolucao: '2026-08-10', devolucaoEm: null, responsavelRetirada: 'Sônia Antunes', estadoSaida: 'Ótimo', estadoDevolucao: null, vinculo: { tipo: 'Locação', contratoId: null, valorLocacao: 180 }, status: 'Atrasado' },
  { id: 'EMP-2026-0029', unidadePatrimonio: 'OXI-003', produtoDescricao: 'Concentrador de oxigênio 5L', clienteId: 'CLI-0010', clienteNome: 'Antônio Carlos Ferreira', saidaEm: '2026-08-18', previsaoDevolucao: '2026-09-18', devolucaoEm: null, responsavelRetirada: 'Marli Ferreira', estadoSaida: 'Bom', estadoDevolucao: null, vinculo: { tipo: 'Locação', contratoId: null, valorLocacao: 320 }, status: 'Em vigência' },
  { id: 'EMP-2026-0028', unidadePatrimonio: 'CBN-003', produtoDescricao: 'Cadeira de banho', clienteId: 'CLI-0005', clienteNome: 'Terezinha de Jesus Farias', saidaEm: '2026-08-05', previsaoDevolucao: '2026-09-05', devolucaoEm: null, responsavelRetirada: 'Marcos Farias', estadoSaida: 'Bom', estadoDevolucao: null, vinculo: { tipo: 'Cobertura de plano', contratoId: 'CTR-2026-0005', valorLocacao: 0 }, status: 'Em vigência' },
  { id: 'EMP-2026-0027', unidadePatrimonio: 'CDR-006', produtoDescricao: 'Cadeira de rodas dobrável', clienteId: 'CLI-0013', clienteNome: 'Cleuza Maria dos Santos', saidaEm: '2026-06-20', previsaoDevolucao: '2026-07-20', devolucaoEm: '2026-07-18', responsavelRetirada: 'Pedro Santos', estadoSaida: 'Bom', estadoDevolucao: 'Bom', vinculo: { tipo: 'Cobertura de plano', contratoId: 'CTR-2026-0013', valorLocacao: 0 }, status: 'Devolvido' },
  { id: 'EMP-2026-0026', unidadePatrimonio: 'AND-006', produtoDescricao: 'Andador alumínio dobrável', clienteId: 'CLI-0001', clienteNome: 'Marina Alves Costa', saidaEm: '2026-05-14', previsaoDevolucao: '2026-06-14', devolucaoEm: '2026-06-10', responsavelRetirada: 'Beatriz Costa Ramos', estadoSaida: 'Ótimo', estadoDevolucao: 'Bom', vinculo: { tipo: 'Cobertura de plano', contratoId: 'CTR-2026-0001', valorLocacao: 0 }, status: 'Devolvido' },
  { id: 'EMP-2026-0025', unidadePatrimonio: 'SPS-003', produtoDescricao: 'Suporte de soro com rodízios', clienteId: 'CLI-0017', clienteNome: 'Rosângela Martins Dias', saidaEm: '2026-08-12', previsaoDevolucao: '2026-09-12', devolucaoEm: null, responsavelRetirada: 'Tiago Dias', estadoSaida: 'Bom', estadoDevolucao: null, vinculo: { tipo: 'Locação', contratoId: null, valorLocacao: 90 }, status: 'Em vigência' },
  { id: 'EMP-2026-0024', unidadePatrimonio: 'CMH-006', produtoDescricao: 'Cama hospitalar manual 2 manivelas', clienteId: 'CLI-0007', clienteNome: 'Vera Lúcia Prado', saidaEm: '2026-04-02', previsaoDevolucao: '2026-05-02', devolucaoEm: '2026-05-20', responsavelRetirada: 'Osvaldo Prado', estadoSaida: 'Bom', estadoDevolucao: 'Regular', vinculo: { tipo: 'Locação', contratoId: null, valorLocacao: 180 }, status: 'Devolvido' },
  { id: 'EMP-2026-0023', unidadePatrimonio: 'CLP-003', produtoDescricao: 'Colchão pneumático antiescaras', clienteId: 'CLI-0018', clienteNome: 'Manoel dos Reis Alencar', saidaEm: '2026-07-28', previsaoDevolucao: '2026-08-28', devolucaoEm: null, responsavelRetirada: 'Isabel Alencar', estadoSaida: 'Ótimo', estadoDevolucao: null, vinculo: { tipo: 'Cobertura de plano', contratoId: 'CTR-2026-0018', valorLocacao: 0 }, status: 'Em vigência' },
  { id: 'EMP-2026-0022', unidadePatrimonio: 'CDR-009', produtoDescricao: 'Cadeira de rodas dobrável', clienteId: 'CLI-0002', clienteNome: 'José Ribeiro da Silva', saidaEm: '2026-06-01', previsaoDevolucao: '2026-07-01', devolucaoEm: '2026-06-29', responsavelRetirada: 'José Ribeiro da Silva', estadoSaida: 'Bom', estadoDevolucao: 'Bom', vinculo: { tipo: 'Cobertura de plano', contratoId: 'CTR-2026-0002', valorLocacao: 0 }, status: 'Devolvido' },
  { id: 'EMP-2026-0021', unidadePatrimonio: 'CBN-006', produtoDescricao: 'Cadeira de banho', clienteId: 'CLI-0014', clienteNome: 'Wilson Batista Rocha', saidaEm: '2026-08-20', previsaoDevolucao: '2026-09-20', devolucaoEm: null, responsavelRetirada: 'Fabiana Rocha', estadoSaida: 'Bom', estadoDevolucao: null, vinculo: { tipo: 'Locação', contratoId: null, valorLocacao: 90 }, status: 'Em vigência' },
  { id: 'EMP-2026-0020', unidadePatrimonio: 'AND-003', produtoDescricao: 'Andador alumínio dobrável', clienteId: 'CLI-0020', clienteNome: 'Edson Luís Carvalho', saidaEm: '2026-05-30', previsaoDevolucao: '2026-06-30', devolucaoEm: '2026-06-25', responsavelRetirada: 'Patrícia Carvalho', estadoSaida: 'Ótimo', estadoDevolucao: 'Ótimo', vinculo: { tipo: 'Locação', contratoId: null, valorLocacao: 90 }, status: 'Devolvido' },
];

export const emprestimoById = (id) => emprestimos.find((e) => e.id === id);
export const emprestimosDoCliente = (clienteId) => emprestimos.filter((e) => e.clienteId === clienteId);
export const emprestimosDaUnidade = (patrimonio) => emprestimos.filter((e) => e.unidadePatrimonio === patrimonio);
export const emprestimosAtrasados = () => emprestimos.filter((e) => e.status === 'Atrasado');

// ---- Vendas de equipamento ----
export const vendasEquipamento = [
  { id: 'VEQ-2026-0021', data: '2026-08-25', clienteId: 'CLI-0003', clienteNome: 'Aparecida Nogueira Lima', vendedor: 'Sandra Duarte', formaPagamento: 'Pix', itens: [{ descricao: 'Cadeira de banho', qtd: 1, valorUnit: 410 }, { descricao: 'Bengala ortopédica regulável', qtd: 1, valorUnit: 70 }], desconto: 20, custo: 205, notaFiscalId: 'NF-2026-0455' },
  { id: 'VEQ-2026-0020', data: '2026-08-22', clienteId: 'CLI-0006', clienteNome: 'Roberto Carlos Antunes', vendedor: 'Renato Aguiar', formaPagamento: 'Cartão 3x', itens: [{ descricao: 'Colchão pneumático antiescaras', qtd: 1, valorUnit: 520 }], desconto: 0, custo: 240, notaFiscalId: 'NF-2026-0452', parcelas: 3 },
  { id: 'VEQ-2026-0019', data: '2026-08-18', clienteId: null, clienteNome: 'Clínica Reviver (particular)', vendedor: 'Sandra Duarte', formaPagamento: 'Boleto', itens: [{ descricao: 'Andador alumínio dobrável', qtd: 3, valorUnit: 320 }], desconto: 90, custo: 390, notaFiscalId: 'NF-2026-0448' },
  { id: 'VEQ-2026-0018', data: '2026-08-14', clienteId: 'CLI-0010', clienteNome: 'Antônio Carlos Ferreira', vendedor: 'Renato Aguiar', formaPagamento: 'Pix', itens: [{ descricao: 'Nebulizador ultrassônico', qtd: 1, valorUnit: 240 }], desconto: 0, custo: 95, notaFiscalId: 'NF-2026-0443' },
  { id: 'VEQ-2026-0017', data: '2026-08-09', clienteId: 'CLI-0013', clienteNome: 'Cleuza Maria dos Santos', vendedor: 'Sandra Duarte', formaPagamento: 'Dinheiro', itens: [{ descricao: 'Par de muletas axilares', qtd: 1, valorUnit: 160 }, { descricao: 'Bengala ortopédica regulável', qtd: 1, valorUnit: 70 }], desconto: 0, custo: 85, notaFiscalId: 'NF-2026-0437' },
  { id: 'VEQ-2026-0016', data: '2026-08-04', clienteId: 'CLI-0017', clienteNome: 'Rosângela Martins Dias', vendedor: 'Renato Aguiar', formaPagamento: 'Cartão 2x', itens: [{ descricao: 'Cadeira de rodas dobrável', qtd: 1, valorUnit: 890 }], desconto: 40, custo: 420, notaFiscalId: 'NF-2026-0431', parcelas: 2 },
  { id: 'VEQ-2026-0015', data: '2026-07-29', clienteId: 'CLI-0001', clienteNome: 'Marina Alves Costa', vendedor: 'Sandra Duarte', formaPagamento: 'Pix', itens: [{ descricao: 'Suporte de soro com rodízios', qtd: 1, valorUnit: 260 }], desconto: 0, custo: 110, notaFiscalId: 'NF-2026-0424' },
  { id: 'VEQ-2026-0014', data: '2026-07-21', clienteId: null, clienteNome: 'Casa de Repouso Bem Viver', vendedor: 'Renato Aguiar', formaPagamento: 'Boleto 3x', itens: [{ descricao: 'Cama hospitalar manual 2 manivelas', qtd: 2, valorUnit: 3290 }], desconto: 400, custo: 3300, notaFiscalId: 'NF-2026-0416', parcelas: 3 },
  { id: 'VEQ-2026-0013', data: '2026-07-12', clienteId: 'CLI-0014', clienteNome: 'Wilson Batista Rocha', vendedor: 'Sandra Duarte', formaPagamento: 'Pix', itens: [{ descricao: 'Andador alumínio dobrável', qtd: 1, valorUnit: 320 }], desconto: 0, custo: 130, notaFiscalId: 'NF-2026-0409' },
  { id: 'VEQ-2026-0012', data: '2026-07-03', clienteId: 'CLI-0018', clienteNome: 'Manoel dos Reis Alencar', vendedor: 'Renato Aguiar', formaPagamento: 'Dinheiro', itens: [{ descricao: 'Cadeira de banho', qtd: 1, valorUnit: 410 }], desconto: 0, custo: 180, notaFiscalId: 'NF-2026-0401' },
];

export function vendaTotais(v) {
  const bruto = v.itens.reduce((s, it) => s + it.qtd * it.valorUnit, 0);
  const total = bruto - (v.desconto || 0);
  return { bruto, total, margem: total - v.custo };
}
export const vendaEquipamentoById = (id) => vendasEquipamento.find((v) => v.id === id);
