// Estado global "modo offline": ligado quando a API/banco não respondem e o app
// passa a usar dados locais (de demonstração). Um banner avisa o usuário.
import { useEffect, useReducer } from "react";

let _offline = false;
const listeners = new Set<() => void>();

export function setOffline(value: boolean) {
  if (_offline !== value) {
    _offline = value;
    listeners.forEach((fn) => fn());
  }
}

export function isOffline() {
  return _offline;
}

// Hook reativo para componentes que querem reagir à mudança de modo.
export function useOffline() {
  const [, force] = useReducer((x) => x + 1, 0);
  useEffect(() => {
    const fn = () => force();
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return _offline;
}
