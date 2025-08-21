import { volt } from '@/volt'
import { exampleController } from '@/features/example'

/**
 * @description Main application router configuration
 * @see https://github.com/andeerc/volt.js
 */
export const AppRouter = volt.router({
  controllers: {
    example: exampleController
  }
})

export type AppRouterType = typeof AppRouter
