import type { VoltRouter, ClientConfig, InferRouterCaller } from '../types';

/**
 * Creates a server-side client for Volt Router
 * This version uses router.$caller directly (zero browser dependencies)
 * @param config Client configuration
 * @returns A typed client for calling server actions
 */
export const createVoltClient = <TRouter extends VoltRouter<any, any, any, any, any>>(
  {
    router,
  }: ClientConfig<TRouter>
): InferRouterCaller<TRouter> => {
  if (!router) {
    throw new Error('Router is required to create an Volt client');
  }

  if (typeof router === 'function') {
    router = router();
  }

  // Server-side: Use direct router.$caller (zero browser dependencies)
  return router.$caller as unknown as InferRouterCaller<TRouter>;
}; 