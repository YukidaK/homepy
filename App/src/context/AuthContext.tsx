// Estado global de autenticação: guarda o usuário logado e expõe login/logout.
import React, { createContext, useContext, useState } from "react";
import { apiPost } from "../api/client";

export type Usuario = {
  id_usuarios: number;
  nome: string;
  email: string;
  telefone?: string;
  tipo_usuario?: string;
};

type AuthContextType = {
  usuario: Usuario | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  async function login(email: string, senha: string) {
    const { usuario } = await apiPost<{ usuario: Usuario }>("/login", { email, senha });
    setUsuario(usuario);
  }

  function logout() {
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return ctx;
}
