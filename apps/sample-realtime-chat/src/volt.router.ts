import { volt } from '@/volt'
import { messageController } from './features/message'

/**
 * @description Main application router configuration
 * @see https://github.com/Volt-js/volt.js
 */
export const AppRouter = volt.router({
  controllers: {
    message: messageController
  }
})

export type AppRouterType = typeof AppRouter
