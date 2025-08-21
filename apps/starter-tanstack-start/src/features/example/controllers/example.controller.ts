import { volt } from '@/volt'
import { z } from 'zod'

/**
 * @description Example controller demonstrating Volt.js features.
 * This file serves as a starting point for your application's logic.
 *
 * @see https://github.com/andeerc/volt.js
 */
export const exampleController = volt.controller({
  // The base path for all actions in this controller.
  // e.g., /api/v1/example
  path: '/example',

  // Actions are the individual endpoints of your controller.
  actions: {
    /**
     * A simple health-check endpoint to verify the API is running.
     */
    health: volt.query({
      // The sub-path for this action. Combined with the controller path,
      // the full path is /api/v1/example
      path: '/',
      handler: async ({ response, context }) => {
        // You can use the logger from the context if it's enabled.
        context.logger.info('Health check endpoint was called.');

        return response.success({
          status: 'ok',
          timestamp: new Date().toISOString(),
          framework: 'tanstack-start',
        });
      },
    }),
  },
});
