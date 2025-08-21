import type { VoltAction } from "./action.interface";
import type { VoltBaseContext } from "./context.interface";
import type { VoltPlugin } from "./plugin.interface";
import type { HTTPMethod, VoltActionHandler } from "./action.interface";

/**
 * Constraint que valida estrutura de action sem achatar tipos específicos
 */
export type VoltControllerBaseAction = {
  name?: string;
  type: "query" | "mutation";
  path: string;
  method: HTTPMethod;
  description?: string;
  body?: any;
  query?: any;
  use?: readonly any[];
  handler: VoltActionHandler<any, any>;
  $Infer: any; // Esta é a chave - preservamos o tipo específico aqui
};

/**
 * Constraint inteligente que valida sem perder tipos
 */
type ValidateActions<T> = {
  [K in keyof T]: T[K] extends VoltControllerBaseAction
  ? T[K]  // ✅ Mantém o tipo específico se é válido
  : never // ❌ Erro se não é uma action válida
};

export type VoltControllerConfig<
  TControllerActions extends Record<string, VoltControllerBaseAction> // 🔄 Nova constraint
> = {
  name: string;
  path: string;
  description?: string;
  actions: ValidateActions<TControllerActions>; // 🔄 Validação com preservação de tipos
}