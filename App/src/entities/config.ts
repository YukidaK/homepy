// Configuração declarativa de cada entidade do banco Casa_Inteligente.
// As telas genéricas de Lista e Formulário se montam a partir destes metadados,
// evitando criar 4 telas quase idênticas.

export type FieldKind = "text" | "email" | "password" | "phone" | "number" | "status";

export type FieldConfig = {
  key: string;
  label: string;
  kind: FieldKind;
};

export type EntityConfig = {
  endpoint: string; // rota na API (ex.: "/dispositivos")
  pk: string; // nome da chave primária
  title: string; // título no cabeçalho
  singular: string; // usado em "Novo X" / "Editar X"
  nameField: string; // campo mostrado como "Nome" na lista e na busca
  statusField?: string; // campo de status (badge na lista)
  hasLed?: boolean; // entidade controla LED (Dispositivos)
  fields: FieldConfig[]; // campos do formulário
};

export const ENTITIES: Record<string, EntityConfig> = {
  dispositivos: {
    endpoint: "/dispositivos",
    pk: "id_dispositivos",
    title: "Dispositivos",
    singular: "Dispositivo",
    nameField: "nome_dispositivo",
    statusField: "status",
    hasLed: true,
    fields: [
      { key: "nome_dispositivo", label: "Nome", kind: "text" },
      { key: "tipo_dispositivo", label: "Tipo", kind: "text" },
      { key: "marca", label: "Marca", kind: "text" },
      { key: "modelo", label: "Modelo", kind: "text" },
      { key: "status", label: "Status", kind: "status" },
      { key: "id_casas", label: "ID da Casa", kind: "number" },
    ],
  },
  casas: {
    endpoint: "/casas",
    pk: "id_casas",
    title: "Casas",
    singular: "Casa",
    nameField: "nome_casa",
    fields: [
      { key: "nome_casa", label: "Nome da Casa", kind: "text" },
      { key: "endereco", label: "Endereço", kind: "text" },
      { key: "cidade", label: "Cidade", kind: "text" },
      { key: "estado", label: "Estado", kind: "text" },
      { key: "id_clientes", label: "ID do Cliente", kind: "number" },
    ],
  },
  clientes: {
    endpoint: "/clientes",
    pk: "id_clientes",
    title: "Clientes",
    singular: "Cliente",
    nameField: "nome",
    fields: [
      { key: "nome", label: "Nome", kind: "text" },
      { key: "cpf", label: "CPF", kind: "text" },
      { key: "telefone", label: "Telefone", kind: "phone" },
      { key: "email", label: "E-mail", kind: "email" },
      { key: "id_usuarios", label: "ID do Usuário", kind: "number" },
    ],
  },
  usuarios: {
    endpoint: "/usuarios",
    pk: "id_usuarios",
    title: "Usuários",
    singular: "Usuário",
    nameField: "nome",
    fields: [
      { key: "nome", label: "Nome", kind: "text" },
      { key: "email", label: "E-mail", kind: "email" },
      { key: "senha", label: "Senha", kind: "password" },
      { key: "telefone", label: "Telefone", kind: "phone" },
      { key: "tipo_usuario", label: "Tipo de Usuário", kind: "text" },
    ],
  },
};

export type EntityKey = keyof typeof ENTITIES;
