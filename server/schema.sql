-- Canaã — Fase 1: Auth, Clientes, Parceiros, Unidades, Usuários
-- Rodar uma vez contra u912946284_db_saascanaa via SSH:
--   mysql -u u912946284_db_saascanaa -p u912946284_db_saascanaa < schema.sql

CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  perfil ENUM('Administrador','Atendente','Financeiro','Operacional') NOT NULL DEFAULT 'Atendente',
  status ENUM('Ativo','Inativo') NOT NULL DEFAULT 'Ativo',
  dois_fatores TINYINT(1) NOT NULL DEFAULT 0,
  ultimo_acesso DATETIME NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS auth_tokens (
  token CHAR(64) PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expira_em DATETIME NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS unidades (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nome VARCHAR(120) NOT NULL,
  tipo ENUM('Matriz','Filial','Escritório') NOT NULL,
  cnpj VARCHAR(20), responsavel VARCHAR(120), telefone VARCHAR(20), email VARCHAR(160),
  logradouro VARCHAR(160), numero VARCHAR(20), bairro VARCHAR(80),
  cidade VARCHAR(80), uf CHAR(2), cep VARCHAR(10),
  horario VARCHAR(120), alvara VARCHAR(80),
  salas_velorio TINYINT UNSIGNED DEFAULT 0, capela TINYINT(1) DEFAULT 0,
  foto VARCHAR(255),
  status ENUM('Ativa','Inativa') NOT NULL DEFAULT 'Ativa',
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS clientes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nome VARCHAR(160) NOT NULL,
  cpf CHAR(11) NOT NULL UNIQUE,
  rg VARCHAR(20), nascimento DATE, telefone VARCHAR(20), email VARCHAR(160),
  status ENUM('Ativo','Inativo') NOT NULL DEFAULT 'Ativo',
  logradouro VARCHAR(160), numero VARCHAR(20), bairro VARCHAR(80),
  cidade VARCHAR(80), uf CHAR(2), cep VARCHAR(10),
  cadastrado_em DATE NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS dependentes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NULL UNIQUE,
  cliente_id INT UNSIGNED NOT NULL,
  nome VARCHAR(160) NOT NULL, cpf CHAR(11), rg VARCHAR(20), telefone VARCHAR(20),
  parentesco VARCHAR(40), nascimento DATE,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cliente_historico (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT UNSIGNED NOT NULL,
  usuario_id INT UNSIGNED NULL,
  quando DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  oque TEXT NOT NULL,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS parceiros (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  razao_social VARCHAR(160) NOT NULL, nome_fantasia VARCHAR(160),
  cnpj VARCHAR(20) NOT NULL UNIQUE, tipo_parceria VARCHAR(60), responsavel VARCHAR(120),
  cidade VARCHAR(80), uf CHAR(2),
  status ENUM('Ativo','Inativo') NOT NULL DEFAULT 'Ativo',
  dados_bancarios TEXT,
  acordo_tipo VARCHAR(40), acordo_valor DECIMAL(10,2), acordo_vigencia VARCHAR(60),
  acordo_servicos JSON,
  portal_login VARCHAR(120), portal_ativo TINYINT(1) DEFAULT 0, portal_ultimo_acesso DATETIME NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS parceiro_contatos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  parceiro_id INT UNSIGNED NOT NULL,
  nome VARCHAR(120), funcao VARCHAR(80), telefone VARCHAR(20), email VARCHAR(160),
  FOREIGN KEY (parceiro_id) REFERENCES parceiros(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Fase 2: Planos, Contratos, Parcelas

CREATE TABLE IF NOT EXISTS planos_produto (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nome VARCHAR(120) NOT NULL,
  valor_mensal DECIMAL(10,2) NOT NULL,
  carencia_dias SMALLINT UNSIGNED DEFAULT 0,
  limite_dependentes SMALLINT UNSIGNED DEFAULT 0,
  reajuste VARCHAR(80),
  coberturas JSON,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS contratos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  cliente_id INT UNSIGNED NOT NULL,
  plano_id INT UNSIGNED NOT NULL,
  inicio DATE NOT NULL,
  dia_vencimento TINYINT UNSIGNED NOT NULL,
  forma_pagamento ENUM('Boleto','Pix','Cartão recorrente') NOT NULL,
  vendedor_usuario_id INT UNSIGNED NULL,
  situacao ENUM('Ativo','Em atraso','Suspenso','Cancelado','Encerrado') NOT NULL DEFAULT 'Ativo',
  cancelado_em DATE NULL,
  motivo_cancelamento TEXT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (plano_id) REFERENCES planos_produto(id),
  FOREIGN KEY (vendedor_usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS contrato_parcelas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  contrato_id INT UNSIGNED NOT NULL,
  numero TINYINT UNSIGNED NOT NULL,
  competencia DATE NOT NULL,
  vencimento DATE NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  status ENUM('Em aberto','Pago','Cancelado','Negociado') NOT NULL DEFAULT 'Em aberto',
  pago_em DATETIME NULL,
  forma VARCHAR(40) NULL,
  FOREIGN KEY (contrato_id) REFERENCES contratos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Fase 3: Pagamentos (baixa manual)

CREATE TABLE IF NOT EXISTS pagamentos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  parcela_id INT UNSIGNED NULL,
  cliente_nome VARCHAR(160),
  valor DECIMAL(10,2) NOT NULL,
  meio ENUM('Boleto','Pix','Dinheiro','Transferência','Cartão recorrente') NOT NULL,
  recebido_em DATE NOT NULL,
  status ENUM('Conciliado','Exceção','Baixa manual') NOT NULL DEFAULT 'Baixa manual',
  identificador VARCHAR(255) NULL,
  observacao TEXT NULL,
  usuario_id INT UNSIGNED NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parcela_id) REFERENCES contrato_parcelas(id) ON DELETE SET NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Fase 4: Registro de Óbito + Guias de Atendimento

CREATE TABLE IF NOT EXISTS obitos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  status ENUM('Aberto','Em andamento','Concluído') NOT NULL DEFAULT 'Aberto',
  aberto_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responsavel_usuario_id INT UNSIGNED NULL,
  falecido_nome VARCHAR(160) NOT NULL,
  falecido_cpf CHAR(11) NULL,
  falecido_nascimento DATE NULL,
  falecido_obito_em DATETIME NOT NULL,
  falecido_local_obito VARCHAR(160) NULL,
  falecido_causa_declarada VARCHAR(255) NULL,
  falecido_numero_do VARCHAR(80) NULL,
  falecido_cartorio VARCHAR(160) NULL,
  vinculo_tipo ENUM('Titular','Dependente','Particular') NOT NULL,
  cliente_id INT UNSIGNED NULL,
  contrato_id INT UNSIGNED NULL,
  dependente_id INT UNSIGNED NULL,
  solicitante_nome VARCHAR(160) NULL, solicitante_parentesco VARCHAR(60) NULL, solicitante_telefone VARCHAR(20) NULL,
  local_velorio VARCHAR(160) NULL, local_sepultamento VARCHAR(160) NULL,
  cobertura_plano_ativo TINYINT(1) NULL, cobertura_carencia_cumprida TINYINT(1) NULL,
  cobertura_dependente_incluido TINYINT(1) NULL, cobertura_adimplente TINYINT(1) NULL,
  valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (contrato_id) REFERENCES contratos(id),
  FOREIGN KEY (dependente_id) REFERENCES dependentes(id),
  FOREIGN KEY (responsavel_usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS obito_servicos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  obito_id INT UNSIGNED NOT NULL,
  nome VARCHAR(160) NOT NULL, coberto TINYINT(1) NOT NULL DEFAULT 0, valor DECIMAL(10,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (obito_id) REFERENCES obitos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS guias (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  obito_id INT UNSIGNED NULL,
  parceiro_id INT UNSIGNED NOT NULL,
  cliente_id INT UNSIGNED NULL,
  cliente_nome_snapshot VARCHAR(160) NULL,
  cliente_vinculo_snapshot VARCHAR(20) NULL,
  servico VARCHAR(160) NOT NULL,
  valor_acordado DECIMAL(10,2) NOT NULL,
  emitida_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  emitida_por_usuario_id INT UNSIGNED NULL,
  status ENUM('Emitida','Enviada','Aceita','Em execução','Concluída','Faturada','Cancelada') NOT NULL DEFAULT 'Emitida',
  coberto TINYINT(1) NOT NULL DEFAULT 0,
  cancelada_justificativa TEXT NULL,
  FOREIGN KEY (obito_id) REFERENCES obitos(id) ON DELETE SET NULL,
  FOREIGN KEY (parceiro_id) REFERENCES parceiros(id),
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (emitida_por_usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS guia_historico (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  guia_id INT UNSIGNED NOT NULL,
  status VARCHAR(40) NOT NULL, quando DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, quem VARCHAR(160) NULL,
  FOREIGN KEY (guia_id) REFERENCES guias(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Fase 5: Equipamentos (catálogo, inventário unitário, empréstimos, vendas)

CREATE TABLE IF NOT EXISTS equipamentos_produto (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  descricao VARCHAR(160) NOT NULL,
  categoria VARCHAR(60) NOT NULL,
  preco_custo DECIMAL(10,2) NOT NULL DEFAULT 0,
  preco_venda DECIMAL(10,2) NOT NULL DEFAULT 0,
  estoque INT NOT NULL DEFAULT 0,
  estoque_minimo INT NOT NULL DEFAULT 0,
  locavel TINYINT(1) NOT NULL DEFAULT 0,
  foto VARCHAR(255) NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS equipamentos_unidade (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patrimonio VARCHAR(30) NOT NULL UNIQUE,
  produto_id INT UNSIGNED NOT NULL,
  status ENUM('Disponível','Emprestado','Em manutenção','Baixado') NOT NULL DEFAULT 'Disponível',
  estado_conservacao ENUM('Ótimo','Bom','Regular') NOT NULL DEFAULT 'Ótimo',
  aquisicao DATE NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (produto_id) REFERENCES equipamentos_produto(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS emprestimos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  unidade_id INT UNSIGNED NOT NULL,
  cliente_id INT UNSIGNED NOT NULL,
  responsavel_retirada VARCHAR(160) NOT NULL,
  saida_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  previsao_devolucao DATE NOT NULL,
  devolucao_em DATETIME NULL,
  estado_saida ENUM('Ótimo','Bom','Regular') NOT NULL,
  estado_devolucao ENUM('Ótimo','Bom','Regular') NULL,
  vinculo_tipo ENUM('Cobertura de plano','Locação') NOT NULL,
  contrato_id INT UNSIGNED NULL,
  valor_locacao DECIMAL(10,2) NOT NULL DEFAULT 0,
  observacoes TEXT NULL,
  status ENUM('Em vigência','Devolvido','Atrasado') NOT NULL DEFAULT 'Em vigência',
  criado_por_usuario_id INT UNSIGNED NULL,
  FOREIGN KEY (unidade_id) REFERENCES equipamentos_unidade(id),
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (contrato_id) REFERENCES contratos(id),
  FOREIGN KEY (criado_por_usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS vendas_equipamento (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  data DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cliente_id INT UNSIGNED NULL,
  comprador_nome VARCHAR(160) NOT NULL,
  comprador_cpf CHAR(11) NOT NULL,
  comprador_telefone VARCHAR(20) NOT NULL,
  endereco_cep VARCHAR(9) NULL, endereco_logradouro VARCHAR(160) NULL, endereco_numero VARCHAR(20) NULL,
  endereco_bairro VARCHAR(120) NULL, endereco_cidade VARCHAR(120) NULL, endereco_uf CHAR(2) NULL,
  vendedor_usuario_id INT UNSIGNED NULL,
  forma_pagamento VARCHAR(40) NOT NULL,
  desconto DECIMAL(10,2) NOT NULL DEFAULT 0,
  custo DECIMAL(10,2) NOT NULL DEFAULT 0,
  parcelas INT NULL,
  nota_fiscal_id VARCHAR(20) NULL,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (vendedor_usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS venda_itens (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  venda_id INT UNSIGNED NOT NULL,
  produto_id INT UNSIGNED NULL,
  descricao VARCHAR(160) NOT NULL,
  qtd INT NOT NULL DEFAULT 1,
  valor_unit DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (venda_id) REFERENCES vendas_equipamento(id) ON DELETE CASCADE,
  FOREIGN KEY (produto_id) REFERENCES equipamentos_produto(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Fase 6: Notas Fiscais

CREATE TABLE IF NOT EXISTS notas_fiscais (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  tipo ENUM('NFS-e','NF-e') NOT NULL,
  origem_tipo ENUM('Atendimento','Contrato','Venda de equipamento','Emissão manual') NOT NULL,
  origem_ref VARCHAR(80) NOT NULL,
  cliente_nome VARCHAR(160) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  impostos DECIMAL(10,2) NOT NULL DEFAULT 0,
  status ENUM('Pendente','Autorizada','Rejeitada','Cancelada') NOT NULL DEFAULT 'Pendente',
  emitida_em DATETIME NULL,
  numero VARCHAR(40) NULL,
  motivo_rejeicao TEXT NULL,
  criado_por_usuario_id INT UNSIGNED NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (criado_por_usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Fase 7: Portal do Parceiro (baixas) e Carnês

CREATE TABLE IF NOT EXISTS baixas_parceiro (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  parceiro_id INT UNSIGNED NOT NULL,
  cliente_id INT UNSIGNED NOT NULL,
  cliente_nome VARCHAR(160) NOT NULL,
  contrato_id INT UNSIGNED NOT NULL,
  servico_prestado VARCHAR(160) NOT NULL,
  data_hora DATETIME NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  observacoes TEXT NULL,
  comprovante TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('Aprovado','Aguardando aprovação','Estornado') NOT NULL DEFAULT 'Aprovado',
  ip VARCHAR(45) NULL,
  usuario_portal VARCHAR(160) NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parceiro_id) REFERENCES parceiros(id),
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (contrato_id) REFERENCES contratos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS carnes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  contrato_id INT UNSIGNED NOT NULL,
  cliente_nome VARCHAR(160) NOT NULL,
  competencia_inicial DATE NOT NULL,
  parcelas INT NOT NULL,
  valor_parcela DECIMAL(10,2) NOT NULL,
  gerado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  enviado_em DATETIME NULL,
  canal_envio VARCHAR(40) NULL,
  lote VARCHAR(40) NULL,
  criado_por_usuario_id INT UNSIGNED NULL,
  FOREIGN KEY (contrato_id) REFERENCES contratos(id),
  FOREIGN KEY (criado_por_usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
