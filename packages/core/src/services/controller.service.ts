import type { VoltControllerBaseAction, VoltControllerConfig } from "../types";

/**
 * Creates a controller configuration for the Volt Framework.
 * Controllers group related actions together and provide a common path prefix.
 * 
 * @template TControllerContext - The type of the controller context
 * @template TControllerActions - Record of actions belonging to this controller
 * 
 * @param config - The controller configuration object
 * @returns A configured controller object
 * 
 * @example
 * ```typescript
 * const userController = volt.controller({
 *   path: 'users',
 *   actions: {
 *     list: volt.query({
 *       path: '',
 *       handler: (ctx) => ctx.response.success({ users: [] })
 *     }),
 *     create: volt.mutation({
 *       path: '',
 *       method: 'POST',
 *       body: userSchema,
 *       handler: (ctx) => ctx.response.created({ id: 1 })
 *     })
 *   }
 * });
 * ```
 */
export const createVoltController = <
  TControllerActions extends Record<string, VoltControllerBaseAction>
>(
  config: VoltControllerConfig<TControllerActions>
) => {
  return config as VoltControllerConfig<TControllerActions>;
};