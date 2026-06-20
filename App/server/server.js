// server.js — API Node.js (Express + MySQL) do app Casa Automática.
// Fornece: autenticação (login), CRUD das 4 entidades e a rota que liga/desliga
// o LED físico no Pico W/Arduino (integração demonstrada no vídeo da prova).

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// IP do Pico W / Arduino que controla o LED.
// Ajuste para o IP do seu microcontrolador na rede onde o vídeo será gravado.
const PICO_IP = process.env.PICO_IP || "10.183.183.114";

// Pool MySQL — preenchido em db.init() antes do servidor subir.
let pool;

// ---------------------------------------------------------------------------
// Metadados das entidades (tabela + chave primária + colunas editáveis).
// Tudo no mesmo padrão para gerar o CRUD de forma uniforme.
// ---------------------------------------------------------------------------
const ENTITIES = {
  usuarios: {
    table: "usuarios",
    pk: "id_usuarios",
    fields: ["nome", "email", "senha", "telefone", "tipo_usuario"],
  },
  clientes: {
    table: "clientes",
    pk: "id_clientes",
    fields: ["id_usuarios", "nome", "cpf", "telefone", "email"],
  },
  casas: {
    table: "casas",
    pk: "id_casas",
    fields: ["id_clientes", "nome_casa", "endereco", "cidade", "estado"],
  },
  dispositivos: {
    table: "dispositivos",
    pk: "id_dispositivos",
    fields: ["id_casas", "nome_dispositivo", "tipo_dispositivo", "marca", "modelo", "status"],
  },
};

// ---------------------------------------------------------------------------
// Autenticação
// ---------------------------------------------------------------------------
app.post("/login", async (req, res) => {
  const { email, senha } = req.body || {};
  if (!email || !senha) {
    return res.status(400).json({ erro: "Informe e-mail e senha." });
  }
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM usuarios WHERE email = ? AND senha = ?",
      [email, senha]
    );
    const usuario = rows[0];
    if (!usuario) {
      return res.status(401).json({ erro: "E-mail ou senha inválidos." });
    }
    delete usuario.senha; // nunca devolve a senha
    res.json({ usuario });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// ---------------------------------------------------------------------------
// CRUD genérico para cada entidade
// ---------------------------------------------------------------------------
function registerCrud(resource, meta) {
  const { table, pk, fields } = meta;

  // GET lista completa
  app.get(`/${resource}`, async (_req, res) => {
    try {
      const [rows] = await pool.query(`SELECT * FROM ${table} ORDER BY ${pk} DESC`);
      res.json(rows);
    } catch (e) {
      res.status(500).json({ erro: e.message });
    }
  });

  // GET por id
  app.get(`/${resource}/:id`, async (req, res) => {
    try {
      const [rows] = await pool.execute(`SELECT * FROM ${table} WHERE ${pk} = ?`, [req.params.id]);
      if (!rows[0]) return res.status(404).json({ erro: "Registro não encontrado." });
      res.json(rows[0]);
    } catch (e) {
      res.status(500).json({ erro: e.message });
    }
  });

  // POST cria
  app.post(`/${resource}`, async (req, res) => {
    const cols = fields.filter((f) => req.body[f] !== undefined);
    if (cols.length === 0) {
      return res.status(400).json({ erro: "Nenhum campo informado." });
    }
    const placeholders = cols.map(() => "?").join(", ");
    const values = cols.map((c) => req.body[c]);
    try {
      const [result] = await pool.execute(
        `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${placeholders})`,
        values
      );
      const [rows] = await pool.execute(`SELECT * FROM ${table} WHERE ${pk} = ?`, [result.insertId]);
      res.status(201).json(rows[0]);
    } catch (e) {
      res.status(400).json({ erro: e.message });
    }
  });

  // PUT atualiza
  app.put(`/${resource}/:id`, async (req, res) => {
    const cols = fields.filter((f) => req.body[f] !== undefined);
    if (cols.length === 0) {
      return res.status(400).json({ erro: "Nenhum campo informado." });
    }
    const setClause = cols.map((c) => `${c} = ?`).join(", ");
    const values = cols.map((c) => req.body[c]);
    try {
      const [result] = await pool.execute(
        `UPDATE ${table} SET ${setClause} WHERE ${pk} = ?`,
        [...values, req.params.id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ erro: "Registro não encontrado." });
      }
      const [rows] = await pool.execute(`SELECT * FROM ${table} WHERE ${pk} = ?`, [req.params.id]);
      res.json(rows[0]);
    } catch (e) {
      res.status(400).json({ erro: e.message });
    }
  });

  // DELETE remove
  app.delete(`/${resource}/:id`, async (req, res) => {
    try {
      const [result] = await pool.execute(`DELETE FROM ${table} WHERE ${pk} = ?`, [req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ erro: "Registro não encontrado." });
      }
      res.json({ ok: true });
    } catch (e) {
      res.status(400).json({ erro: e.message });
    }
  });
}

for (const [resource, meta] of Object.entries(ENTITIES)) {
  registerCrud(resource, meta);
}

// ---------------------------------------------------------------------------
// Integração com o LED do Arduino / Pico W
// O app chama esta rota; a API atualiza o status do dispositivo no banco e
// repassa o comando HTTP ao microcontrolador (led/on ou led/off).
// ---------------------------------------------------------------------------
app.post("/dispositivos/:id/led", async (req, res) => {
  const { on } = req.body || {};
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM dispositivos WHERE id_dispositivos = ?",
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ erro: "Dispositivo não encontrado." });

    const novoStatus = on ? "Ativo" : "Inativo";
    const endpoint = on ? "led/on" : "led/off";

    // Atualiza o estado no banco
    await pool.execute("UPDATE dispositivos SET status = ? WHERE id_dispositivos = ?", [
      novoStatus,
      req.params.id,
    ]);

    // Repassa o comando ao hardware (não derruba a resposta se o Pico estiver offline)
    let hardware = "ok";
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      await fetch(`http://${PICO_IP}/${endpoint}`, { signal: controller.signal });
      clearTimeout(timeout);
    } catch {
      hardware = "sem-conexao";
    }

    res.json({ id: Number(req.params.id), status: novoStatus, hardware });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// Integração com a cortina do Pico W
app.post("/dispositivos/:id/door", async (req, res) => {
  const { open } = req.body || {};
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM dispositivos WHERE id_dispositivos = ?",
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ erro: "Dispositivo não encontrado." });

    const novoStatus = open ? "Ativo" : "Inativo";
    const endpoint = open ? "door/open" : "door/close";

    await pool.execute("UPDATE dispositivos SET status = ? WHERE id_dispositivos = ?", [
      novoStatus,
      req.params.id,
    ]);

    let hardware = "ok";
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      await fetch(`http://${PICO_IP}/${endpoint}`, { signal: controller.signal });
      clearTimeout(timeout);
    } catch {
      hardware = "sem-conexao";
    }

    res.json({ id: Number(req.params.id), status: novoStatus, hardware });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

app.get("/", (_req, res) => {
  res.json({ api: "Casa Automática", status: "online" });
});

// Sobe o servidor só depois que o banco/tabelas/seed estão prontos.
db.init()
  .then((createdPool) => {
    pool = createdPool;
    app.listen(PORT, () => {
      console.log(`API Casa Automática rodando em http://localhost:${PORT}`);
      console.log(`MySQL: ${db.config.user}@${db.config.host}:${db.config.port}/${db.config.database}`);
      console.log(`LED será repassado para o Pico W em http://${PICO_IP}/led/{on,off}`);
    });
  })
  .catch((e) => {
    console.error("Falha ao conectar no MySQL:", e.message);
    console.error("Confira se o MySQL está rodando e as credenciais (DB_USER/DB_PASSWORD).");
    process.exit(1);
  });
