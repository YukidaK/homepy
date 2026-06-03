// db.js — conexão MySQL do banco "casa_inteligente".
// Cria o banco e as tabelas do modelo ER (caso não existam) e faz o seed inicial.
// Credenciais configuráveis por variáveis de ambiente (com padrões de XAMPP/WAMP).

const mysql = require("mysql2/promise");

const config = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "casa_inteligente",
};

// Pool é criado em init() e reutilizado pelo server.js
let pool;

async function criarTabelas() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id_usuarios   INT AUTO_INCREMENT PRIMARY KEY,
      nome          VARCHAR(120) NOT NULL,
      email         VARCHAR(120) NOT NULL UNIQUE,
      senha         VARCHAR(120) NOT NULL,
      telefone      VARCHAR(30),
      data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
      tipo_usuario  VARCHAR(40)
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS clientes (
      id_clientes   INT AUTO_INCREMENT PRIMARY KEY,
      id_usuarios   INT,
      nome          VARCHAR(120) NOT NULL,
      cpf           VARCHAR(20),
      telefone      VARCHAR(30),
      email         VARCHAR(120),
      data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_usuarios) REFERENCES usuarios (id_usuarios)
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS casas (
      id_casas      INT AUTO_INCREMENT PRIMARY KEY,
      id_clientes   INT,
      nome_casa     VARCHAR(120) NOT NULL,
      endereco      VARCHAR(200),
      cidade        VARCHAR(80),
      estado        VARCHAR(40),
      data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_clientes) REFERENCES clientes (id_clientes)
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS dispositivos (
      id_dispositivos  INT AUTO_INCREMENT PRIMARY KEY,
      id_casas         INT,
      nome_dispositivo VARCHAR(120) NOT NULL,
      tipo_dispositivo VARCHAR(80),
      marca            VARCHAR(80),
      modelo           VARCHAR(80),
      status           VARCHAR(20) DEFAULT 'Ativo',
      data_instalacao  DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_casas) REFERENCES casas (id_casas)
    ) ENGINE=InnoDB
  `);
}

async function seed() {
  const [[{ n }]] = await pool.query("SELECT COUNT(*) AS n FROM usuarios");
  if (n > 0) return;

  // Usuários usados para o login do app
  const [admin] = await pool.execute(
    `INSERT INTO usuarios (nome, email, senha, telefone, tipo_usuario) VALUES (?, ?, ?, ?, ?)`,
    ["Administrador", "admin@casa.com", "123456", "(11) 90000-0000", "admin"]
  );
  const adminId = admin.insertId;
  await pool.execute(
    `INSERT INTO usuarios (nome, email, senha, telefone, tipo_usuario) VALUES (?, ?, ?, ?, ?)`,
    ["Vinicius Campos Operador", "vinicius@casa.com", "123456", "(11) 91111-1111", "operador"]
  );

  // Cliente -> Casa para vincular os dispositivos
  const [cliente] = await pool.execute(
    `INSERT INTO clientes (id_usuarios, nome, cpf, telefone, email) VALUES (?, ?, ?, ?, ?)`,
    [adminId, "Maria Souza", "123.456.789-00", "(11) 92222-2222", "maria@cliente.com"]
  );
  const clienteId = cliente.insertId;

  const [casa] = await pool.execute(
    `INSERT INTO casas (id_clientes, nome_casa, endereco, cidade, estado) VALUES (?, ?, ?, ?, ?)`,
    [clienteId, "Casa Principal", "Rua das Flores, 100", "São Paulo", "SP"]
  );
  const casaId = casa.insertId;

  // Dispositivos disponíveis: apenas LED e Cortina (hardware do projeto)
  const dispositivos = [
    ["LED", "Iluminação", "Raspberry", "Pico W", "Inativo"],
    ["Cortina", "Cortina", "Raspberry", "Pico W", "Inativo"],
  ];
  for (const [nome, tipo, marca, modelo, status] of dispositivos) {
    await pool.execute(
      `INSERT INTO dispositivos (id_casas, nome_dispositivo, tipo_dispositivo, marca, modelo, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [casaId, nome, tipo, marca, modelo, status]
    );
  }

  console.log("Banco populado com dados iniciais (seed).");
}

// Cria o banco (se necessário), o pool e as tabelas. Retorna o pool pronto.
async function init() {
  // Conexão inicial sem database, só para garantir que o schema existe
  const conn = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
  });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``);
  await conn.end();

  pool = mysql.createPool({
    ...config,
    waitForConnections: true,
    connectionLimit: 10,
  });

  await criarTabelas();
  await seed();
  return pool;
}

module.exports = { init, config };
