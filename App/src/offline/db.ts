// Banco de dados LOCAL de demonstração — usado SOMENTE quando a API/MySQL não
// responde. Os dados ficam em memória (não persistem) e espelham o seed do servidor.
// Isto permite navegar pelo app mesmo sem o backend no ar, deixando claro (via banner)
// que NÃO está usando o banco de dados real.

type Row = Record<string, any>;

const HOJE = "2026-06-01";

const data: Record<string, Row[]> = {
  usuarios: [
    { id_usuarios: 1, nome: "Administrador", email: "admin@casa.com", senha: "123456", telefone: "(11) 90000-0000", tipo_usuario: "admin", data_cadastro: HOJE },
    { id_usuarios: 2, nome: "Vinicius Campos Operador", email: "vinicius@casa.com", senha: "123456", telefone: "(11) 91111-1111", tipo_usuario: "operador", data_cadastro: HOJE },
  ],
  clientes: [
    { id_clientes: 1, id_usuarios: 1, nome: "Maria Souza", cpf: "123.456.789-00", telefone: "(11) 92222-2222", email: "maria@cliente.com", data_cadastro: HOJE },
  ],
  casas: [
    { id_casas: 1, id_clientes: 1, nome_casa: "Casa Principal", endereco: "Rua das Flores, 100", cidade: "São Paulo", estado: "SP", data_cadastro: HOJE },
  ],
  dispositivos: [
    { id_dispositivos: 1, id_casas: 1, nome_dispositivo: "LED", tipo_dispositivo: "Iluminação", marca: "Raspberry", modelo: "Pico W", status: "Inativo", data_instalacao: HOJE },
    { id_dispositivos: 2, id_casas: 1, nome_dispositivo: "Cortina", tipo_dispositivo: "Cortina", marca: "Raspberry", modelo: "Pico W", status: "Inativo", data_instalacao: HOJE },
  ],
};

const PK: Record<string, string> = {
  usuarios: "id_usuarios",
  clientes: "id_clientes",
  casas: "id_casas",
  dispositivos: "id_dispositivos",
};

const seq: Record<string, number> = { usuarios: 2, clientes: 1, casas: 1, dispositivos: 2 };

function erro(msg: string): never {
  throw new Error(msg);
}

// Simula as respostas da API a partir dos dados locais.
export function handleOffline<T>(method: string, path: string, body?: any): T {
  const clean = path.split("?")[0].replace(/^\//, "");
  const seg = clean.split("/");
  const resource = seg[0];

  // POST /login
  if (resource === "login" && method === "POST") {
    const u = data.usuarios.find((r) => r.email === body?.email && r.senha === body?.senha);
    if (!u) erro("E-mail ou senha inválidos.");
    const { senha, ...semSenha } = u;
    return { usuario: semSenha } as T;
  }

  const table = data[resource];
  if (!table) erro("Recurso indisponível no modo offline.");
  const pk = PK[resource];

  // /dispositivos/:id/led
  if (seg.length === 3 && seg[2] === "led" && method === "POST") {
    const item = table.find((r) => String(r[pk]) === seg[1]);
    if (!item) erro("Dispositivo não encontrado.");
    item.status = body?.on ? "Ativo" : "Inativo";
    return { id: Number(seg[1]), status: item.status, hardware: "offline" } as T;
  }

  // Coleção: /recurso
  if (seg.length === 1) {
    if (method === "GET") return [...table].sort((a, b) => b[pk] - a[pk]) as T;
    if (method === "POST") {
      const novo: Row = { [pk]: ++seq[resource], ...body, data_cadastro: HOJE, data_instalacao: HOJE };
      table.push(novo);
      return novo as T;
    }
  }

  // Item: /recurso/:id
  if (seg.length === 2) {
    const idx = table.findIndex((r) => String(r[pk]) === seg[1]);
    if (method === "GET") {
      if (idx < 0) erro("Registro não encontrado.");
      return table[idx] as T;
    }
    if (method === "PUT") {
      if (idx < 0) erro("Registro não encontrado.");
      table[idx] = { ...table[idx], ...body };
      return table[idx] as T;
    }
    if (method === "DELETE") {
      if (idx < 0) erro("Registro não encontrado.");
      table.splice(idx, 1);
      return { ok: true } as T;
    }
  }

  return erro("Operação não suportada no modo offline.");
}
