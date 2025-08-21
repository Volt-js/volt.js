import { volt } from '@/volt'
import { z } from 'zod'

/**
 * @description Example controller demonstrating Volt.js features
 * @see https://github.com/Volt-js/volt.js
 */
export const exampleController = volt.controller({
  name: 'Example',
  path: '/example',
  actions: {
    // Health check action
    health: volt.query({
      path: '/health',
      handler: async ({ response }) => {
        volt.logger.info('Health check requested')
        return response.success({
          status: 'ok',
          timestamp: new Date().toISOString(),
          features: {
            store: true,
            jobs: true,
            mcp: true,
            logging: true
          }
        })
      }
    }),
  }
})
