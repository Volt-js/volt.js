import type { RequestProcessor } from "../processors";
import type { ContextCallback, VoltBaseConfig, VoltControllerBaseAction, VoltControllerConfig, VoltRouter, VoltRouterCaller, MutationActionCallerResult, QueryActionCallerResult, RealtimeActionCallerResult } from "../types";

/**
 * Creates a proxy-based caller for invoking actions via controller namespace (server-only).
 * Usage: caller.users.create({ ...input }) instead of caller('users', 'create', input)
 */
export function createServerCaller<
  TContext extends object | ContextCallback,
  TConfig extends VoltBaseConfig,
  TPlugins extends Record<string, any>,
  TControllers extends Record<string, VoltControllerConfig<any>>,
>(
  controllers: TControllers,
  processor: RequestProcessor<VoltRouter<TContext, TControllers, TConfig, TPlugins>>
): VoltRouterCaller<TControllers> {
  const caller = new Proxy({} as VoltRouterCaller<TControllers>, {
    get(_, controllerName: string) {
      const controller = controllers[controllerName as keyof TControllers];
      if (!controller) {
        throw new Error(`Controller "${controllerName}" not found in router.`);
      }
      return new Proxy({}, {
        get(_, actionName: string) {
          const action = controller.actions[actionName] as VoltControllerBaseAction;
          if (!action) {
            throw new Error(`Action "${actionName}" not found in controller "${controllerName}".`);
          }

          if (action.method === 'GET') {
            return {
              useRealtime: (...args: any[]) => ({} as RealtimeActionCallerResult<typeof action>),
              useQuery: (...args: any[]) => ({} as QueryActionCallerResult<typeof action>),
              query: async (input: any) => {
                if (!processor) {
                  throw new Error('Processor is required to call actions on server');
                }
                return processor.call(controllerName, actionName, input);
              }
            }
          }

          return {
            useMutation: (...args: any[]) => ({} as MutationActionCallerResult<typeof action>),
            mutate: async (input: any) => {
              if (!processor) {
                throw new Error('Processor is required to call actions on server');
              }

              return processor.call(controllerName, actionName, input);
            }
          }
        }
      });
    }
  });

  return caller;
}
