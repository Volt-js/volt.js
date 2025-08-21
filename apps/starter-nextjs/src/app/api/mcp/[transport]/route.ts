import { createMcpAdapter } from '@volt.js/adapter-mcp-server'
import { AppRouter } from '@/volt.router'

/**
 * MCP server instance for exposing API as a MCP server.
 *
 * @see https://github.com/andeerc/volt.js/tree/main/packages/adapter-mcp
 */
export const { GET, POST, DELETE } = createMcpAdapter(AppRouter, {
  serverInfo: {
    name: 'Volt.js MCP Server',
    version: '1.0.0',
  },
  context: (request: Request) => {
    return {
      context: {
        user: request.headers.get('user') || 'anonymous',
      },
      tools: [],
      request,
      timestamp: Date.now(),
    }
  },
  adapter: {
    basePath: '/api/mcp',
    verboseLogs: true,
    redis: {
      url: process.env.REDIS_URL!,
      keyPrefix: 'volt:mcp:',
    },
  },
})
