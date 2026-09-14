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
