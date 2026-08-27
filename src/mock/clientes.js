// Clientes titulares + dependentes (RF-08, RF-09, RF-12).

export const clientes = [
  {
    id: 'CLI-0001', nome: 'Marina Alves Costa', cpf: '38245177090', rg: '28.114.552-7',
    nascimento: '1958-03-12', telefone: '11988760001', email: 'marina.costa@email.com',
    status: 'Ativo', cadastradoEm: '2021-04-18',
    endereco: { logradouro: 'Rua das Acácias', numero: '145', bairro: 'Vila Mariana', cidade: 'São Paulo', uf: 'SP', cep: '04101-000' },
    dependentes: [
      { nome: 'Antônio Alves Costa', cpf: '11122233344', parentesco: 'Cônjuge', nascimento: '1955-07-30' },
      { nome: 'Beatriz Costa Ramos', cpf: '55566677788', parentesco: 'Filha', nascimento: '1985-11-02' },
    ],
    historico: [
      { quando: '2026-08-10T14:22:00', quem: 'Sandra Duarte', oque: 'Atualização de telefone de contato' },
      { quando: '2025-12-01T09:10:00', quem: 'Renato Aguiar', oque: 'Inclusão da dependente Beatriz Costa Ramos' },
      { quando: '2021-04-18T11:00:00', quem: 'Sandra Duarte', oque: 'Cadastro inicial do cliente' },
    ],
  },
  {
    id: 'CLI-0002', nome: 'José Ribeiro da Silva', cpf: '20455988012', rg: '19.882.031-4',
    nascimento: '1949-09-25', telefone: '11994330002', email: 'jose.ribeiro@email.com',
    status: 'Ativo', cadastradoEm: '2019-08-03',
    endereco: { logradouro: 'Av. Sapopemba', numero: '9820', bairro: 'Sapopemba', cidade: 'São Paulo', uf: 'SP', cep: '03988-000' },
    dependentes: [
      { nome: 'Lúcia Ribeiro', cpf: '99988877766', parentesco: 'Cônjuge', nascimento: '1952-02-14' },
    ],
    historico: [
      { quando: '2026-07-22T16:40:00', quem: 'Financeiro', oque: 'Renegociação de 2 parcelas em atraso' },
      { quando: '2019-08-03T10:30:00', quem: 'Renato Aguiar', oque: 'Cadastro inicial do cliente' },
    ],
  },
  {
    id: 'CLI-0003', nome: 'Aparecida Nogueira Lima', cpf: '15788422900', rg: '22.331.908-0',
    nascimento: '1961-01-08', telefone: '11987120003', email: 'cida.lima@email.com',
    status: 'Ativo', cadastradoEm: '2022-02-27',
    endereco: { logradouro: 'Rua Itapura', numero: '512', bairro: 'Tatuapé', cidade: 'São Paulo', uf: 'SP', cep: '03310-000' },
    dependentes: [
      { nome: 'Carlos Nogueira Lima', cpf: '32132132100', parentesco: 'Filho', nascimento: '1989-06-19' },
      { nome: 'Helena Lima Prado', cpf: '45645645600', parentesco: 'Mãe', nascimento: '1938-10-05' },
    ],
    historico: [
      { quando: '2026-08-19T11:15:00', quem: 'Sandra Duarte', oque: 'Anexado comprovante de residência' },
      { quando: '2022-02-27T13:05:00', quem: 'Sandra Duarte', oque: 'Cadastro inicial do cliente' },
    ],
  },
  {
    id: 'CLI-0004', nome: 'Paulo Sérgio Mendes', cpf: '48291744055', rg: '30.552.117-9',
    nascimento: '1972-12-01', telefone: '11991450004', email: 'paulo.mendes@email.com',
    status: 'Ativo', cadastradoEm: '2020-11-11',
    endereco: { logradouro: 'Rua Padre Marchetti', numero: '77', bairro: 'Ipiranga', cidade: 'São Paulo', uf: 'SP', cep: '04266-000' },
    dependentes: [],
    historico: [
      { quando: '2020-11-11T15:20:00', quem: 'Renato Aguiar', oque: 'Cadastro inicial do cliente' },
    ],
  },
  {
    id: 'CLI-0005', nome: 'Terezinha de Jesus Farias', cpf: '10233455066', rg: '17.204.889-2',
    nascimento: '1944-06-17', telefone: '11986530005', email: 'terezinha.farias@email.com',
    status: 'Ativo', cadastradoEm: '2018-05-30',
    endereco: { logradouro: 'Rua Serra de Botucatu', numero: '1203', bairro: 'Vila Gomes Cardim', cidade: 'São Paulo', uf: 'SP', cep: '03317-000' },
    dependentes: [
      { nome: 'Marcos Farias', cpf: '78978978900', parentesco: 'Filho', nascimento: '1970-03-22' },
    ],
    historico: [
      { quando: '2026-06-05T10:00:00', quem: 'Sandra Duarte', oque: 'Atualização de endereço' },
      { quando: '2018-05-30T09:45:00', quem: 'Renato Aguiar', oque: 'Cadastro inicial do cliente' },
    ],
  },
  {
    id: 'CLI-0006', nome: 'Roberto Carlos Antunes', cpf: '55412300188', rg: '25.998.114-3',
    nascimento: '1965-04-09', telefone: '11990120006', email: 'roberto.antunes@email.com',
    status: 'Ativo', cadastradoEm: '2023-09-14',
    endereco: { logradouro: 'Av. Aricanduva', numero: '5555', bairro: 'Vila Matilde', cidade: 'São Paulo', uf: 'SP', cep: '03526-000' },
    dependentes: [
      { nome: 'Sônia Antunes', cpf: '65465465400', parentesco: 'Cônjuge', nascimento: '1968-08-11' },
      { nome: 'Diego Antunes', cpf: '15915915900', parentesco: 'Filho', nascimento: '1996-01-27' },
    ],
    historico: [
      { quando: '2023-09-14T14:00:00', quem: 'Sandra Duarte', oque: 'Cadastro inicial do cliente' },
    ],
  },
  {
    id: 'CLI-0007', nome: 'Vera Lúcia Prado', cpf: '33021988744', rg: '21.556.700-1',
    nascimento: '1953-10-21', telefone: '11987770007', email: 'vera.prado@email.com',
    status: 'Ativo', cadastradoEm: '2017-03-08',
    endereco: { logradouro: 'Rua Cisplatina', numero: '340', bairro: 'Ipiranga', cidade: 'São Paulo', uf: 'SP', cep: '04211-040' },
    dependentes: [
      { nome: 'Osvaldo Prado', cpf: '75375375300', parentesco: 'Cônjuge', nascimento: '1950-05-15' },
    ],
    historico: [
      { quando: '2026-08-01T08:30:00', quem: 'Financeiro', oque: 'Alteração da forma de pagamento para Pix' },
      { quando: '2017-03-08T11:20:00', quem: 'Renato Aguiar', oque: 'Cadastro inicial do cliente' },
    ],
  },
  {
    id: 'CLI-0008', nome: 'Francisco das Chagas Souza', cpf: '19877600233', rg: '18.665.402-8',
    nascimento: '1941-02-03', telefone: '11985440008', email: 'francisco.souza@email.com',
    status: 'Ativo', cadastradoEm: '2016-07-19',
    endereco: { logradouro: 'Rua dos Trilhos', numero: '890', bairro: 'Mooca', cidade: 'São Paulo', uf: 'SP', cep: '03168-000' },
    dependentes: [],
    historico: [
      { quando: '2016-07-19T10:10:00', quem: 'Renato Aguiar', oque: 'Cadastro inicial do cliente' },
    ],
  },
  {
    id: 'CLI-0009', nome: 'Sandra Regina Duarte', cpf: '42198755021', rg: '29.041.887-5',
    nascimento: '1979-07-14', telefone: '11994100009', email: 'sandra.duarte@email.com',
    status: 'Ativo', cadastradoEm: '2024-01-22',
    endereco: { logradouro: 'Rua Taquari', numero: '210', bairro: 'Mooca', cidade: 'São Paulo', uf: 'SP', cep: '03166-000' },
    dependentes: [
      { nome: 'Rafael Duarte', cpf: '95195195100', parentesco: 'Filho', nascimento: '2008-09-09' },
    ],
    historico: [
      { quando: '2024-01-22T16:00:00', quem: 'Renato Aguiar', oque: 'Cadastro inicial do cliente' },
    ],
  },
  {
    id: 'CLI-0010', nome: 'Antônio Carlos Ferreira', cpf: '27655400199', rg: '20.118.774-6',
    nascimento: '1956-11-28', telefone: '11986220010', email: 'antonio.ferreira@email.com',
    status: 'Ativo', cadastradoEm: '2019-10-02',
    endereco: { logradouro: 'Av. Paes de Barros', numero: '2760', bairro: 'Mooca', cidade: 'São Paulo', uf: 'SP', cep: '03114-000' },
    dependentes: [
      { nome: 'Marli Ferreira', cpf: '85285285200', parentesco: 'Cônjuge', nascimento: '1959-04-04' },
    ],
    historico: [
      { quando: '2026-05-14T09:00:00', quem: 'Sandra Duarte', oque: 'Reemissão de carnê anual' },
      { quando: '2019-10-02T13:40:00', quem: 'Renato Aguiar', oque: 'Cadastro inicial do cliente' },
    ],
  },
  {
    id: 'CLI-0011', nome: 'Luiza Helena Barros', cpf: '31904822700', rg: '24.775.019-3',
    nascimento: '1963-08-30', telefone: '11991770011', email: 'luiza.barros@email.com',
    status: 'Ativo', cadastradoEm: '2022-12-05',
    endereco: { logradouro: 'Rua Javari', numero: '58', bairro: 'Mooca', cidade: 'São Paulo', uf: 'SP', cep: '03127-000' },
    dependentes: [],
    historico: [{ quando: '2022-12-05T10:25:00', quem: 'Sandra Duarte', oque: 'Cadastro inicial do cliente' }],
  },
  {
    id: 'CLI-0012', nome: 'Geraldo Magela Pinto', cpf: '16522088344', rg: '19.330.556-0',
    nascimento: '1947-05-06', telefone: '11985990012', email: 'geraldo.pinto@email.com',
    status: 'Inativo', cadastradoEm: '2015-09-21',
    endereco: { logradouro: 'Rua Antônio de Barros', numero: '1440', bairro: 'Tatuapé', cidade: 'São Paulo', uf: 'SP', cep: '03401-000' },
    dependentes: [],
    historico: [
      { quando: '2026-03-11T14:30:00', quem: 'Financeiro', oque: 'Inativação do cadastro após cancelamento do contrato' },
      { quando: '2015-09-21T09:00:00', quem: 'Renato Aguiar', oque: 'Cadastro inicial do cliente' },
    ],
  },
  {
    id: 'CLI-0013', nome: 'Cleuza Maria dos Santos', cpf: '28741900566', rg: '22.908.117-4',
    nascimento: '1950-12-19', telefone: '11994660013', email: 'cleuza.santos@email.com',
    status: 'Ativo', cadastradoEm: '2020-06-17',
    endereco: { logradouro: 'Rua Guaimbé', numero: '99', bairro: 'Vila Formosa', cidade: 'São Paulo', uf: 'SP', cep: '03355-000' },
    dependentes: [
      { nome: 'Juliana Santos', cpf: '35735735700', parentesco: 'Filha', nascimento: '1982-02-08' },
      { nome: 'Pedro Santos', cpf: '75775775700', parentesco: 'Filho', nascimento: '1984-07-16' },
    ],
    historico: [{ quando: '2020-06-17T11:30:00', quem: 'Sandra Duarte', oque: 'Cadastro inicial do cliente' }],
  },
  {
    id: 'CLI-0014', nome: 'Wilson Batista Rocha', cpf: '39028744011', rg: '27.550.913-8',
    nascimento: '1968-03-03', telefone: '11986780014', email: 'wilson.rocha@email.com',
    status: 'Ativo', cadastradoEm: '2023-04-28',
    endereco: { logradouro: 'Rua Emília Marengo', numero: '420', bairro: 'Anália Franco', cidade: 'São Paulo', uf: 'SP', cep: '03336-000' },
    dependentes: [
      { nome: 'Fabiana Rocha', cpf: '95795795700', parentesco: 'Cônjuge', nascimento: '1971-10-10' },
    ],
    historico: [{ quando: '2023-04-28T15:10:00', quem: 'Renato Aguiar', oque: 'Cadastro inicial do cliente' }],
  },
  {
    id: 'CLI-0015', nome: 'Neusa Aparecida Gomes', cpf: '12099455788', rg: '18.117.900-2',
    nascimento: '1945-09-12', telefone: '11991230015', email: 'neusa.gomes@email.com',
    status: 'Ativo', cadastradoEm: '2018-11-23',
    endereco: { logradouro: 'Rua Coelho Lisboa', numero: '733', bairro: 'Tatuapé', cidade: 'São Paulo', uf: 'SP', cep: '03323-040' },
    dependentes: [
      { nome: 'Ricardo Gomes', cpf: '15315315300', parentesco: 'Filho', nascimento: '1975-01-30' },
    ],
    historico: [
      { quando: '2026-08-24T10:40:00', quem: 'Sandra Duarte', oque: 'Registro de óbito da titular vinculado ao contrato' },
      { quando: '2018-11-23T09:30:00', quem: 'Renato Aguiar', oque: 'Cadastro inicial do cliente' },
    ],
  },
  {
    id: 'CLI-0016', nome: 'Sebastião Oliveira Cruz', cpf: '20388744900', rg: '19.775.002-6',
    nascimento: '1952-07-07', telefone: '11985110016', email: 'sebastiao.cruz@email.com',
    status: 'Ativo', cadastradoEm: '2017-08-14',
    endereco: { logradouro: 'Rua Tuiuti', numero: '1890', bairro: 'Tatuapé', cidade: 'São Paulo', uf: 'SP', cep: '03307-000' },
    dependentes: [],
    historico: [{ quando: '2017-08-14T14:20:00', quem: 'Renato Aguiar', oque: 'Cadastro inicial do cliente' }],
  },
  {
    id: 'CLI-0017', nome: 'Rosângela Martins Dias', cpf: '34871200455', rg: '25.104.887-1',
    nascimento: '1974-02-24', telefone: '11994880017', email: 'rosangela.dias@email.com',
    status: 'Ativo', cadastradoEm: '2024-07-09',
    endereco: { logradouro: 'Rua Apucarana', numero: '260', bairro: 'Tatuapé', cidade: 'São Paulo', uf: 'SP', cep: '03311-000' },
    dependentes: [
      { nome: 'Tiago Dias', cpf: '75175175100', parentesco: 'Filho', nascimento: '2005-05-05' },
      { nome: 'Amanda Dias', cpf: '85185185100', parentesco: 'Filha', nascimento: '2009-12-12' },
    ],
    historico: [{ quando: '2024-07-09T16:45:00', quem: 'Sandra Duarte', oque: 'Cadastro inicial do cliente (convertido de lead do site)' }],
  },
  {
    id: 'CLI-0018', nome: 'Manoel dos Reis Alencar', cpf: '17655433021', rg: '18.998.117-0',
    nascimento: '1943-11-11', telefone: '11986440018', email: 'manoel.alencar@email.com',
    status: 'Ativo', cadastradoEm: '2016-02-29',
    endereco: { logradouro: 'Rua Celso Ramos', numero: '54', bairro: 'Vila Prudente', cidade: 'São Paulo', uf: 'SP', cep: '03135-000' },
    dependentes: [
      { nome: 'Isabel Alencar', cpf: '95395395300', parentesco: 'Cônjuge', nascimento: '1946-06-06' },
    ],
    historico: [{ quando: '2016-02-29T10:00:00', quem: 'Renato Aguiar', oque: 'Cadastro inicial do cliente' }],
  },
  {
    id: 'CLI-0019', nome: 'Divina Aparecida Moraes', cpf: '29011788644', rg: '23.550.019-7',
    nascimento: '1959-05-18', telefone: '11991990019', email: 'divina.moraes@email.com',
    status: 'Ativo', cadastradoEm: '2021-10-30',
    endereco: { logradouro: 'Rua Vilela', numero: '990', bairro: 'Tatuapé', cidade: 'São Paulo', uf: 'SP', cep: '03314-000' },
    dependentes: [],
    historico: [{ quando: '2021-10-30T13:15:00', quem: 'Sandra Duarte', oque: 'Cadastro inicial do cliente' }],
  },
  {
    id: 'CLI-0020', nome: 'Edson Luís Carvalho', cpf: '40188755300', rg: '28.775.104-9',
    nascimento: '1970-09-02', telefone: '11986990020', email: 'edson.carvalho@email.com',
    status: 'Ativo', cadastradoEm: '2025-02-12',
    endereco: { logradouro: 'Rua Melo Freire', numero: '1500', bairro: 'Penha', cidade: 'São Paulo', uf: 'SP', cep: '03653-000' },
    dependentes: [
      { nome: 'Patrícia Carvalho', cpf: '15215215200', parentesco: 'Cônjuge', nascimento: '1973-03-19' },
    ],
    historico: [{ quando: '2025-02-12T09:50:00', quem: 'Sandra Duarte', oque: 'Cadastro inicial do cliente' }],
  },
];

export const clienteById = (id) => clientes.find((c) => c.id === id);
