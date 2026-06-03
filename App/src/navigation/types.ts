// Tipos das rotas do native-stack.
import type { EntityKey } from "../entities/config";

export type RootStackParamList = {
  Login: undefined;
  Menu: undefined;
  EntityList: { entity: EntityKey };
  EntityForm: { entity: EntityKey; id?: number };
  Grupo: undefined;
};
