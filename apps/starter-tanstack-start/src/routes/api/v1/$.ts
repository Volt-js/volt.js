import { createFileRoute } from '@tanstack/react-router'
import { AppRouter } from '@/volt.router'

/**
 * API route handler for Volt.js using TanStack Start.
 *
 * This file acts as a "catch-all" for any requests made to `/api/v1/*`.
 * It intercepts the incoming web standard `Request` object and passes it
 * to the Volt.js router for processing.
 *
 * @see https://github.com/Volt-js/volt.js
 * @see https://tanstack.com/start/latest/docs/framework/api-routes
 */

/**
 * The core handler function that bridges TanStack Start and Volt.js.
 * @param request - The incoming `Request` object from the client.
 * @returns A standard `Response` object.
 */
const voltApiHandler = async ({ request }: { request: Request }) => {
  // 1. Pass the incoming request to the Volt router's handler.
  const voltResponse = await AppRouter.handler(request)

  // 2. The Volt handler returns a standardized response object.
  // We need to convert its body to a string for the Response constructor.
  const body = voltResponse.body ? JSON.stringify(voltResponse.body) : null

  // 3. Construct and return a standard Web API Response object.
  return new Response(body, {
    status: voltResponse.status,
    headers: voltResponse.headers,
  })
}

// Create the route using TanStack's file-based routing system.
// The path `/api/v1/$` is automatically inferred from this file's location.
export const Route = createFileRoute('/api/v1/$')({
  /**
   * The `loader` function handles GET and HEAD requests.
   * We assign our universal handler to it.
   */
  loader: voltApiHandler,

  /**
   * The `action` function handles POST, PUT, PATCH, DELETE requests.
   * We assign the same universal handler to it.
   */
  action: voltApiHandler,
})
