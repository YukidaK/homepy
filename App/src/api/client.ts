// Wrapper genérico de chamadas HTTP para a API Node.js.
// Mantém timeout de 5s. Se a API/banco não responderem (rede caiu, servidor fora),
// cai automaticamente no MODO OFFLINE: usa os dados locais de demonstração e
// liga o aviso visual (setOffline) de que NÃO está usando o banco de dados real.
import { API_URL } from "../config";
import { handleOffline } from "../offline/db";
import { setOffline } from "../offline/state";

const useOfflineOnly = !API_URL?.trim();

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  if (useOfflineOnly) {
    const data = handleOffline<T>(method, path, body);
    setOffline(true);
    return data;
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    // Servidor/banco inacessível -> modo offline com dados locais.
    clearTimeout(timeout);
    const data = handleOffline<T>(method, path, body);
    setOffline(true);
    return data;
  }
  clearTimeout(timeout);

  const text = await res.text();
  let parsed: any = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    const data = handleOffline<T>(method, path, body);
    setOffline(true);
    return data;
  }

  if (!res.ok) {
    if (res.status >= 500) {
      const data = handleOffline<T>(method, path, body);
      setOffline(true);
      return data;
    }
    throw new Error((parsed && parsed.erro) || "Erro na requisição.");
  }

  setOffline(false); // conexão com o banco confirmada
  return parsed as T;
}

export const apiGet = <T>(path: string) => request<T>("GET", path);
export const apiPost = <T>(path: string, body?: unknown) => request<T>("POST", path, body);
export const apiPut = <T>(path: string, body?: unknown) => request<T>("PUT", path, body);
export const apiDelete = <T>(path: string) => request<T>("DELETE", path);
