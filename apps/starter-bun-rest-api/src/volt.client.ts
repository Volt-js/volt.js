/* eslint-disable */
/* prettier-ignore */

import { createVoltClient, useVoltQueryClient } from "@volt.js/core/client"
import type { AppRouterType } from "./volt.router"

/**
* Type-safe API client generated from your Volt router
*
* Usage in Server Components:
* const users = await api.users.list.query()
*
* Usage in Client Components:
* const { data } = api.users.list.useQuery()
*
* Note: Adjust environment variable prefixes (e.g., NEXT_PUBLIC_, BUN_PUBLIC_, DENO_PUBLIC_, REACT_APP_)
*       according to your project's framework/runtime (Next.js, Bun, Deno, React/Vite, etc.).
*/
export const api = createVoltClient<AppRouterType>({
  baseURL: process.env.VOLT_API_URL || 'http://localhost:3000',
  basePATH: process.env.VOLT_API_BASE_PATH || '/api/v1',
  router: () => {
    if (typeof window === 'undefined') {
      return require('./volt.router').AppRouter
    }

    return require('./volt.schema').AppRouterSchema
  },
})

/**
  * Type-safe API client generated from your Volt router
  *
  * Usage in Server Components:
  * const users = await api.users.list.query()
  *
  * Usage in Client Components:
  * const { data } = api.users.list.useQuery()
  */
export type ApiClient = typeof api

/**
  * Type-safe query client generated from your Volt router
  *
  * Usage in Client Components:
  * const { invalidate } = useQueryClient()
  */
export const useQueryClient = useVoltQueryClient<AppRouterType>;
