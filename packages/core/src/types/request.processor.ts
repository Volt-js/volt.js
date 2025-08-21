
import type { RouterContext } from 'rou3'
import type { VoltAction } from './action.interface'
import type { VoltRouter } from './router.interface'
import { DocsConfig } from './builder.interface'

export interface RequestProcessorConfig<TConfig extends VoltRouter<any, any, any, any, any>> {
  baseURL?: TConfig['config']['baseURL'];
  basePATH?: TConfig['config']['basePATH'];
  controllers: TConfig['controllers'];
  context: TConfig['$context'];
  plugins?: Record<string, any>;
  docs?: DocsConfig;
}

export interface RequestProcessorInterface<TRouter extends VoltRouter<any, any, any, any, any>, TConfig extends RequestProcessorConfig<TRouter>> {
  router: RouterContext<VoltAction<any, any, any, any, any, any, any, any, any, any>>

  /**
   * Process an incoming HTTP request
   * @param request The incoming HTTP request
   */
  process(request: Request): Promise<Response>

  /**
   * Make a direct call to a specific controller action
   */
  call<
    TControllerKey extends keyof TConfig['controllers'],
    TActionKey extends keyof TConfig['controllers'][TControllerKey]["actions"],
    TAction extends TConfig['controllers'][TControllerKey]["actions"][TActionKey]
  >(
    controllerKey: TControllerKey,
    actionKey: TActionKey,
    input: TAction['$Infer']['$Input'] & { params?: Record<string, string | number> }
  ): Promise<TAction['$Infer']['$Output']>
}
