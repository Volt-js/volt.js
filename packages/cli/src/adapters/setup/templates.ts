import type {
  ProjectSetupConfig,
  TemplateFile,
} from './types'
import { getEnvironmentVariables, getDockerServices, DATABASE_CONFIGS, getAllDependencies } from './features'
import type { SupportedFramework } from '../framework'
import { ModularTemplateGenerator } from './templates/modular-generator'
import { installShadCNComponents } from './shadcn-installer'

/**
 * Map template names to framework types
 */
function mapTemplateToFramework(framework: string): SupportedFramework {
  const mapping: Record<string, SupportedFramework> = {
    'starter-nextjs': 'nextjs',
    'starter-express-rest-api': 'express',
    'starter-bun-react-app': 'vite',
    'starter-bun-rest-api': 'generic',
    'starter-deno-rest-api': 'generic',
    'starter-tanstack-start': 'tanstack-start'
  }

  return mapping[framework] || 'generic'
}

/**
 * Generate main volt.ts file with proper imports and configuration
 */
export function generateVoltRouter(config: ProjectSetupConfig): TemplateFile {
  const { features } = config

  let imports = [`import { Volt } from '@volt.js/core'`]
  let serviceImports: string[] = []

  // Add context import
  imports.push('import { createVoltAppContext } from "./volt.context"')

  // Add feature service imports based on enabled features
  if (features.store) {
    serviceImports.push('import { store } from "@/services/store"')
  }

  if (features.jobs) {
    serviceImports.push('import { REGISTERED_JOBS } from "@/services/jobs"')
  }

  if (features.logging) {
    serviceImports.push('import { logger } from "@/services/logger"')
  }

  // Telemetry service import
  if (features.telemetry) {
    serviceImports.push('import { telemetry } from "@/services/telemetry"')
  }

  const allImports = [...imports, ...serviceImports].join('\n')

  // Build configuration chain
  let configChain = ['export const volt = Volt', '  .context(createVoltAppContext)']

  if (features.store) configChain.push('  .store(store)')
  if (features.jobs) configChain.push('  .jobs(REGISTERED_JOBS)')
  if (features.logging) configChain.push('  .logger(logger)')
  if (features.telemetry) configChain.push('  .telemetry(telemetry)')

  configChain.push('  .create()')

  const content = `${allImports}

/**
 * @description Initialize the Volt.js
 * @see https://github.com/Volt-js/volt.js
 */
${configChain.join('\n')}
`

  return {
    path: 'src/volt.ts',
    content
  }
}

/**
 * Generate volt.context.ts file with proper type definitions
 */
export function generateVoltContext(config: ProjectSetupConfig): TemplateFile {
  const { database } = config

  let serviceImports: string[] = []
  let contextProperties: string[] = []

  if (database.provider !== 'none') {
    serviceImports.push('import { database } from "@/services/database"')
    contextProperties.push('    database,')
  }

  const allImports = serviceImports.join('\n')

  const content = `${allImports}

/**
 * @description Create the context of the Volt.js application
 * @see https://github.com/Volt-js/volt.js
 */
export const createVoltAppContext = () => {
  return {
${contextProperties.join('\n')}
  }
}

/**
 * @description The context of the Volt.js application
 * @see https://github.com/Volt-js/volt.js
 */
export type VoltAppContext = Awaited<ReturnType<typeof createVoltAppContext>>
`

  return {
    path: 'src/volt.context.ts',
    content
  }
}

/**
 * Generate example controller following the new feature structure
 */
export function generateExampleController(config: ProjectSetupConfig): TemplateFile {
  const { features } = config

  let imports = `import { volt } from '@/volt'
import { z } from 'zod'`

  let exampleActions = `    // Health check action
    health: volt.query({
      name: 'health',
      description: 'Health check',
      path: '/',
      handler: async ({ request, response, context }) => {
        ${features.logging ? 'context.logger.info(\'Health check requested\')' : ''}
        return response.success({
          status: 'ok',
          timestamp: new Date().toISOString(),
          features: {
            store: ${features.store},
            jobs: ${features.jobs},
            mcp: ${features.mcp},
            logging: ${features.logging}
          }
        })
      }
    })`

  // Add store example if enabled
  if (features.store) {
    exampleActions += `,

    // Cache demonstration action
    cacheDemo: volt.query({
      name: 'cacheDemo',
      description: 'Demonstrate caching',
      path: '/cache/:key' as const,
      handler: async ({ request, response, context }) => {
        const { key } = request.params
        const cached = await context.store.get(key)

        if (cached) {
          return response.success({
            data: cached,
            source: 'cache'
          })
        }

        // Generate sample data
        const data = {
          message: \`Hello from \${key}\`,
          timestamp: new Date().toISOString()
        }

        // Cache for 1 hour
        await context.store.set(key, data, { ttl: 3600 })

        return response.success({
          data,
          source: 'generated'
        })
      }
    })`
  }

  // Add jobs example if enabled
  if (features.jobs) {
    exampleActions += `,

    // Background job scheduling action
    scheduleJob: volt.mutation({
      name: 'scheduleJob',
      description: 'Schedule a background job',
      path: '/schedule-job',
      method: 'POST',
      body: z.object({
        message: z.string(),
        delay: z.number().optional()
      }),
      handler: async ({ request, response, context }) => {
        const { message, delay = 0 } = request.body

        const jobId = await context.jobs.add('processMessage', {
          message,
          timestamp: new Date().toISOString()
        }, { delay })

        ${features.logging ? 'context.logger.info(\'Job scheduled\', { jobId, message })' : ''}

        return response.success({
          jobId,
          message: 'Job scheduled successfully',
          delay
        })
      }
    })`
  }

  const content = `${imports}

/**
 * @description Example controller demonstrating Volt.js features
 * @see https://github.com/Volt-js/volt.js
 */
export const exampleController = volt.controller({
  name: 'example',
  path: '/example',
  actions: {
${exampleActions}
  }
})
`

  return {
    path: 'src/features/example/controllers/example.controller.ts',
    content
  }
}

/**
 * Generate main router configuration
 */
export function generateMainRouter(config: ProjectSetupConfig): TemplateFile {
  const content = `import { volt } from '@/volt'
import { exampleController } from '@/features/example'

/**
 * @description Main application router configuration
 * @see https://github.com/Volt-js/volt.js
 */
export const AppRouter = volt.router({
  controllers: {
    example: exampleController
  }
})

export type AppRouterType = typeof AppRouter
`

  return {
    path: 'src/volt.router.ts',
    content
  }
}

/**
 * Generate feature index file
 */
export function generateFeatureIndex(config: ProjectSetupConfig): TemplateFile {
  const content = `export { exampleController } from './controllers/example.controller'
export * from './example.interfaces'
`

  return {
    path: 'src/features/example/index.ts',
    content
  }
}

/**
 * Generates service files based on enabled features and database provider.
 *
 * @param config - The project setup configuration.
 * @returns An array of TemplateFile objects representing service files.
 *
 * @see https://github.com/Volt-js/volt.js
 */
export function generateServiceFiles(config: ProjectSetupConfig): TemplateFile[] {
  const { features, database } = config
  const files: TemplateFile[] = []

  files.push({
    path: 'src/app/api/v1/[[...all]]/route.ts',
    content: `import { AppRouter } from '@/volt.router'
import { nextRouteHandlerAdapter } from '@volt.js/core/adapters'

export const { GET, POST, PUT, DELETE } = nextRouteHandlerAdapter(AppRouter)
`
  })

  // Initialize Redis service if store or jobs feature is enabled
  if (features.store || features.jobs) {
    files.push({
      path: 'src/services/redis.ts',
      content: `import { Redis } from 'ioredis'

/**
  * Redis client instance for caching, session storage, and pub/sub.
  *
  * @remarks
  * Used for caching, session management, and real-time messaging.
  *
  * @see https://github.com/luin/ioredis
  */
export const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
})
`
    })
  }

  // Store service (requires Redis)
  if (features.store) {
    files.push({
      path: 'src/services/store.ts',
      content: `import { createRedisStoreAdapter } from '@volt.js/adapter-redis'
import { redis } from './redis'

/**
  * Store adapter for data persistence.
  *
  * @remarks
  * Provides a unified interface for data storage operations using Redis.
  *
  * @see https://github.com/Volt-js/volt.js/tree/main/packages/adapter-redis
  */
export const store = createRedisStoreAdapter(redis)
`
    })
  }

  // Jobs service (requires Redis)
  if (features.jobs) {
    files.push({
      path: 'src/services/jobs.ts',
      content: `import { store } from './store'
import { createBullMQAdapter } from '@volt.js/adapter-bullmq'
import { z } from 'zod'

/**
  * Job queue adapter for background processing.
  *
  * @remarks
  * Handles asynchronous job processing with BullMQ.
  *
  * @see https://github.com/Volt-js/volt.js/tree/main/packages/adapter-bullmq
  */
export const jobs = createBullMQAdapter({
  store,
  autoStartWorker: {
    concurrency: 1,
    queues: ['*']
  }
})

export const REGISTERED_JOBS = jobs.merge({
  system: jobs.router({
    jobs: {
      sampleJob: jobs.register({
        name: 'sampleJob',
        input: z.object({
          message: z.string()
        }),
        handler: async ({ input }) => {
          console.log(input.message)
        }
      })
    }
  })
})
`
    })
  }

  // Logger service
  if (features.logging) {
    files.push({
      path: 'src/services/logger.ts',
      content: `import { createConsoleLogger, VoltLogLevel } from '@volt.js/core'

/**
  * Logger instance for application logging.
  *
  * @remarks
  * Provides structured logging with configurable log levels.
  *
  * @see https://github.com/Volt-js/volt.js/tree/main/packages/core
  */
export const logger = createConsoleLogger({
  level: VoltLogLevel.INFO,
  showTimestamp: true,
})
`
    })
  }

  // Database service (Prisma)
  if (database.provider !== 'none') {
    files.push({
      path: 'src/services/database.ts',
      content: `import { PrismaClient } from '@prisma/client'

/**
 * Prisma client instance for database operations.
 *
 * @remarks
 * Provides type-safe database access with Prisma ORM.
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client
 */
export const database = new PrismaClient()
`
    })
  }

  // Telemetry service
  if (features.telemetry) {
    files.push({
      path: 'src/services/telemetry.ts',
      content: `import { createConsoleTelemetryAdapter } from '@volt.js/core/adapters'
      import { store } from './store'

      /**
       * Telemetry service for tracking requests and errors.
       *
       * @remarks
       * Provides telemetry tracking with configurable options.
       *
       * @see https://github.com/Volt-js/volt.js/tree/main/packages/core
       */
      export const telemetry = createConsoleTelemetryAdapter({
        serviceName: 'my-volt-app',
        enableEvents: process.env.VOLT_TELEMETRY_ENABLE_EVENTS === 'true',
        enableMetrics: process.env.VOLT_TELEMETRY_ENABLE_METRICS === 'true',
        enableTracing: process.env.VOLT_TELEMETRY_ENABLE_TRACING === 'true',
      }, {
        enableCliIntegration: process.env.VOLT_TELEMETRY_ENABLE_CLI_INTEGRATION === 'true',
        store: store
      })
`
    })
  }

  // MCP service

  // MCP service
  if (features.mcp) {
    files.push({
      path: 'src/app/api/mcp/[transport].ts',
      content: `import { createMcpAdapter } from '@volt.js/adapter-mcp'
import { AppRouter } from '@/volt.router'

/**
 * MCP server instance for exposing API as a MCP server.
 *
 * @see https://github.com/Volt-js/volt.js/tree/main/packages/adapter-mcp
 */
export default createMcpAdapter(AppRouter, {
  serverInfo: {
    name: 'Volt.js MCP Server',
    version: '1.0.0',
  },
  adapter: {
    redis: {
      url: process.env.REDIS_URL!,
      maxRetriesPerRequest: null,
    },
    basePath: process.env.VOLT_MCP_SERVER_BASE_PATH || '/api/mcp',
    maxDuration: process.env.VOLT_MCP_SERVER_TIMEOUT || 60,
  },
})
`
    })
  }

  return files
}

/**
 * Generate client file for frontend usage
 */
export function generateVoltClient(config: ProjectSetupConfig): TemplateFile {
  const content = `import { createVoltClient, useVoltQueryClient } from '@volt.js/core/client'
import type { AppRouterType } from './volt.router'

/**
  * Type-safe API client generated from your Volt router
  *
  * Usage in Server Components:
  * const users = await api.users.list.query()
  *
  * Usage in Client Components:
  * const { data } = api.users.list.useQuery()
  */
export const api = createVoltClient<AppRouterType>({
  baseURL: 'http://localhost:3000',
  basePath: '/api/v1/',
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
`

  return {
    path: 'src/volt.client.ts',
    content
  }
}

/**
 * Generate example interfaces file
 */
export function generateExampleInterfaces(): TemplateFile {
  const content = `/**
 * Example feature interfaces and types
 * @description Define your feature's types here
 */

export interface ExampleUser {
  id: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}

export interface ExampleCreateUserInput {
  name: string
  email: string
}

export interface ExampleCacheItem {
  message: string
  timestamp: string
}

export interface ExampleJobPayload {
  message: string
  timestamp: string
}
`

  return {
    path: 'src/features/example/example.interfaces.ts',
    content
  }
}

/**
 * Generate dynamic package.json based on user selections
 */
export function generatePackageJson(config: ProjectSetupConfig): TemplateFile {
  // Get all dependencies dynamically
  const enabledFeatures = Object.entries(config.features)
    .filter(([_, enabled]) => enabled)
    .map(([key]) => key)

  const allDeps = getAllDependencies(
    enabledFeatures,
    config.database.provider,
    config.orm,
    config.styling,
    config.ui.shadcn
  )

  // Base dependencies for all projects
  const baseDependencies = {
    '@volt.js/core': 'latest',
    'zod': '^3.25.0'
  }

  // Framework-specific dependencies
  const frameworkDeps = getFrameworkDependencies(config.framework)

  // Combine all dependencies
  const dependencies = {
    ...baseDependencies,
    ...frameworkDeps.dependencies,
    ...allDeps.dependencies.reduce((acc, dep) => ({ ...acc, [dep.name]: dep.version }), {})
  }

  const devDependencies = {
    'typescript': '^5.6.0',
    '@types/node': '^22.0.0',
    'tsx': '^4.7.0',
    ...frameworkDeps.devDependencies,
    ...allDeps.devDependencies.reduce((acc, dep) => ({ ...acc, [dep.name]: dep.version }), {})
  }

  // Generate scripts dynamically
  const scripts = generateScripts(config)

  const packageJson = {
    name: config.projectName,
    version: "0.1.0",
    private: true,
    scripts,
    dependencies,
    devDependencies
  }

  return {
    path: 'package.json',
    content: JSON.stringify(packageJson, null, 2)
  }
}

/**
 * Get framework-specific dependencies
 */
function getFrameworkDependencies(framework: string) {
  const frameworkType = mapTemplateToFramework(framework)
  const reactFrameworks = ['nextjs', 'vite', 'tanstack-start']

  const frameworkConfigs: Record<string, { dependencies: Record<string, string>, devDependencies: Record<string, string> }> = {
    'starter-nextjs': {
      dependencies: {
        'next': '^15.0.0',
        'react': '^19.0.0',
        'react-dom': '^19.0.0',
        '@volt.js/core': 'latest' // Add core client dependency for React frameworks
      },
      devDependencies: {
        '@types/react': '^19.0.0',
        '@types/react-dom': '^19.0.0',
        'eslint': '^9.0.0',
        'eslint-config-next': '^15.0.0'
      }
    },
    'starter-express-rest-api': {
      dependencies: {
        'express': '^4.18.0',
        'cors': '^2.8.5'
      },
      devDependencies: {
        '@types/express': '^4.17.0',
        '@types/cors': '^2.8.0',
        'nodemon': '^3.0.0'
      }
    },
    'starter-bun-react-app': {
      dependencies: {
        'react': '^19.0.0',
        'react-dom': '^19.0.0',
        'vite': '^5.0.0',
        '@volt.js/core': 'latest' // Add core client dependency for React frameworks
      },
      devDependencies: {
        '@types/react': '^19.0.0',
        '@types/react-dom': '^19.0.0',
        '@vitejs/plugin-react': '^4.0.0'
      }
    },
    'starter-bun-rest-api': {
      dependencies: {},
      devDependencies: {
        '@types/bun': 'latest'
      }
    },
    'starter-deno-rest-api': {
      dependencies: {},
      devDependencies: {}
    },
    'starter-tanstack-start': {
      dependencies: {
        '@tanstack/react-router': '^1.0.0',
        '@tanstack/start': '^1.0.0',
        'react': '^19.0.0',
        'react-dom': '^19.0.0',
        '@volt.js/core': 'latest' // Add core client dependency for React frameworks
      },
      devDependencies: {
        '@types/react': '^19.0.0',
        '@types/react-dom': '^19.0.0',
        'vite': '^5.0.0'
      }
    }
  }

  return frameworkConfigs[framework] || { dependencies: {}, devDependencies: {} }
}

/**
 * Generate scripts based on configuration
 */
function generateScripts(config: ProjectSetupConfig): Record<string, string> {
  const scripts: Record<string, string> = {
    'type-check': 'tsc --noEmit'
  }

  // Framework-specific scripts
  const frameworkType = mapTemplateToFramework(config.framework)
  switch (frameworkType) {
    case 'nextjs':
      scripts.dev = 'next dev'
      scripts.build = 'next build'
      scripts.start = 'next start'
      scripts.lint = 'next lint'
      break
    case 'express':
      scripts.dev = 'tsx watch src/index.ts'
      scripts.build = 'tsc'
      scripts.start = 'node dist/index.js'
      break
    case 'vite':
      scripts.dev = 'vite'
      scripts.build = 'vite build'
      scripts.start = 'vite preview'
      break
    case 'tanstack-start':
      scripts.dev = 'vinxi dev'
      scripts.build = 'vinxi build'
      scripts.start = 'vinxi start'
      break
    case 'generic':
      if (config.framework.includes('bun')) {
        scripts.dev = 'bun run --watch src/index.ts'
        scripts.build = 'bun build src/index.ts --outdir dist'
        scripts.start = 'bun run dist/index.js'
      } else if (config.framework.includes('deno')) {
        scripts.dev = 'deno run --allow-net --watch src/index.ts'
        scripts.start = 'deno run --allow-net src/index.ts'
      } else {
        scripts.dev = 'tsx watch src/index.ts'
        scripts.build = 'tsc'
        scripts.start = 'node dist/index.js'
      }
      break
  }

  // Database scripts - dynamic based on ORM choice
  if (config.database.provider !== 'none') {
    if (config.orm === 'prisma') {
      scripts['db:generate'] = 'prisma generate'
      scripts['db:push'] = 'prisma db push'
      scripts['db:studio'] = 'prisma studio'
      scripts['db:migrate'] = 'prisma migrate dev'
    } else if (config.orm === 'drizzle') {
      scripts['db:generate'] = 'drizzle-kit generate'
      scripts['db:push'] = 'drizzle-kit push'
      scripts['db:studio'] = 'drizzle-kit studio'
      scripts['db:migrate'] = 'drizzle-kit migrate'
    }
  }

  return scripts
}

/**
 * Generate Tailwind configuration if needed
 */
export function generateTailwindConfig(config: ProjectSetupConfig): TemplateFile | null {
  if (config.styling !== 'tailwind' && !config.ui.shadcn) {
    return null
  }

  const tailwindConfig = config.ui.shadcn
    ? generateShadcnTailwindConfig(config.framework)
    : generateBaseTailwindConfig(config.framework)

  return {
    path: 'tailwind.config.js',
    content: tailwindConfig
  }
}

function generateShadcnTailwindConfig(framework: string): string {
  const contentPaths = getFrameworkContentPaths(framework)

  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [${contentPaths.map(p => `"${p}"`).join(', ')}],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}`
}

function generateBaseTailwindConfig(framework: string): string {
  const contentPaths = getFrameworkContentPaths(framework)

  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [${contentPaths.map(p => `"${p}"`).join(', ')}],
  theme: {
    extend: {},
  },
  plugins: [],
}`
}

function getFrameworkContentPaths(framework: string): string[] {
  const frameworkType = mapTemplateToFramework(framework)
  const frameworkPaths: Record<string, string[]> = {
    'nextjs': [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}'
    ],
    'vite': [
      './src/**/*.{js,ts,jsx,tsx}',
      './src/index.html'
    ],
    'tanstack-start': [
      './src/**/*.{js,ts,jsx,tsx}'
    ],
    'generic': [
      './src/**/*.{js,ts,jsx,tsx}'
    ]
  }

  return frameworkPaths[frameworkType] || frameworkPaths.generic
}

/**
 * Generate ShadCN components.json if needed
 */
export function generateShadcnConfig(config: ProjectSetupConfig): TemplateFile | null {
  if (!config.ui.shadcn) return null

  const componentsConfig = {
    $schema: "https://ui.shadcn.com/schema.json",
    style: "default",
    rsc: mapTemplateToFramework(config.framework) === 'nextjs',
    tsx: true,
    tailwind: {
      config: "tailwind.config.js",
      css: getGlobalCssPath(config.framework),
      baseColor: "slate",
      cssVariables: true
    },
    aliases: {
      components: "@/components",
      utils: "@/lib/utils"
    }
  }

  return {
    path: 'components.json',
    content: JSON.stringify(componentsConfig, null, 2)
  }
}

function getGlobalCssPath(framework: string): string {
  const frameworkType = mapTemplateToFramework(framework)
  const cssPaths: Record<string, string> = {
    'nextjs': 'src/app/globals.css',
    'vite': 'src/index.css',
    'tanstack-start': 'src/styles/app.css',
    'generic': 'src/index.css'
  }

  return cssPaths[frameworkType] || cssPaths.generic
}

/**
 * Generate PostCSS config for Tailwind projects
 */
export function generatePostCssConfig(config: ProjectSetupConfig): TemplateFile | null {
  if (config.styling !== 'tailwind' && !config.ui.shadcn) {
    return null
  }

  const postCssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`

  return {
    path: 'postcss.config.js',
    content: postCssConfig
  }
}

/**
 * Generate global CSS with Tailwind imports
 */
export function generateGlobalCSS(config: ProjectSetupConfig): TemplateFile | null {
  if (config.styling !== 'tailwind' && !config.ui.shadcn) {
    return null
  }

  const cssPath = getGlobalCssPath(config.framework)

  const cssContent = config.ui.shadcn
    ? generateShadcnGlobalCSS()
    : generateBaseTailwindCSS()

  return {
    path: cssPath,
    content: cssContent
  }
}

function generateShadcnGlobalCSS(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;
 
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 224 71.4% 4.1%;
    --card: 0 0% 100%;
    --card-foreground: 224 71.4% 4.1%;
    --popover: 0 0% 100%;
    --popover-foreground: 224 71.4% 4.1%;
    --primary: 262.1 83.3% 57.8%;
    --primary-foreground: 210 20% 98%;
    --secondary: 220 14.3% 95.9%;
    --secondary-foreground: 220.9 39.3% 11%;
    --muted: 220 14.3% 95.9%;
    --muted-foreground: 220 8.9% 46.1%;
    --accent: 220 14.3% 95.9%;
    --accent-foreground: 220.9 39.3% 11%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 20% 98%;
    --border: 220 13% 91%;
    --input: 220 13% 91%;
    --ring: 262.1 83.3% 57.8%;
    --radius: 0.5rem;
  }
 
  .dark {
    --background: 224 71.4% 4.1%;
    --foreground: 210 20% 98%;
    --card: 224 71.4% 4.1%;
    --card-foreground: 210 20% 98%;
    --popover: 224 71.4% 4.1%;
    --popover-foreground: 210 20% 98%;
    --primary: 263.4 70% 50.4%;
    --primary-foreground: 210 20% 98%;
    --secondary: 215 27.9% 16.9%;
    --secondary-foreground: 210 20% 98%;
    --muted: 215 27.9% 16.9%;
    --muted-foreground: 217.9 10.6% 64.9%;
    --accent: 215 27.9% 16.9%;
    --accent-foreground: 210 20% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 20% 98%;
    --border: 215 27.9% 16.9%;
    --input: 215 27.9% 16.9%;
    --ring: 263.4 70% 50.4%;
  }
}
 
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`
}

function generateBaseTailwindCSS(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;`
}

/**
 * Generate framework-specific base files
 */
export function generateFrameworkFiles(config: ProjectSetupConfig): TemplateFile[] {
  const files: TemplateFile[] = []
  const frameworkType = mapTemplateToFramework(config.framework)

  switch (frameworkType) {
    case 'nextjs':
      files.push(...generateNextJSFiles(config))
      break
    case 'express':
      files.push(...generateExpressFiles(config))
      break
    case 'vite':
      files.push(...generateViteFiles(config))
      break
    case 'tanstack-start':
      files.push(...generateTanStackFiles(config))
      break
  }

  return files
}

function generateNextJSFiles(config: ProjectSetupConfig): TemplateFile[] {
  const files: TemplateFile[] = []

  // next.config.ts
  files.push({
    path: 'next.config.ts',
    content: `import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true
  }
}

export default nextConfig`
  })

  // app/layout.tsx
  files.push({
    path: 'src/app/layout.tsx',
    content: `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
${config.styling === 'tailwind' || config.ui.shadcn ? `import './globals.css'` : ''}

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '${config.projectName}',
  description: 'Built with Volt.js'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}`
  })

  // app/page.tsx
  files.push({
    path: 'src/app/page.tsx',
    content: `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center">
          Welcome to ${config.projectName}
        </h1>
        <p className="text-xl text-center mt-4 text-gray-600">
          Built with Volt.js ${config.database.provider !== 'none' ? `and ${config.orm === 'prisma' ? 'Prisma' : 'Drizzle'}` : ''}
        </p>
      </div>
    </main>
  )
}`
  })

  // API route for Volt
  files.push({
    path: 'src/app/api/v1/[[...all]]/route.ts',
    content: `import { volt } from '@/volt'

export const GET = volt.handler
export const POST = volt.handler
export const PUT = volt.handler
export const PATCH = volt.handler
export const DELETE = volt.handler`
  })

  return files
}

function generateExpressFiles(config: ProjectSetupConfig): TemplateFile[] {
  return [{
    path: 'src/index.ts',
    content: `import express from 'express'
import cors from 'cors'
import { volt } from './volt'

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Volt.js API routes
app.use('/api/v1', volt.handler)

app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to ${config.projectName}',
    powered: 'Volt.js' 
  })
})

app.listen(port, () => {
  console.log(\`🚀 Server running on http://localhost:\${port}\`)
})`
  }]
}

function generateViteFiles(config: ProjectSetupConfig): TemplateFile[] {
  const files: TemplateFile[] = []

  // vite.config.ts
  files.push({
    path: 'vite.config.ts',
    content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000
  }
})`
  })

  // index.html
  files.push({
    path: 'index.html',
    content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${config.projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
  })

  // src/main.tsx
  files.push({
    path: 'src/main.tsx',
    content: `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Providers } from './components/providers'
${config.styling === 'tailwind' || config.ui.shadcn ? `import './index.css'` : ''}
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>
)`
  })

  // src/App.tsx
  files.push({
    path: 'src/App.tsx',
    content: `function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ${config.projectName}
        </h1>
        <p className="text-xl text-gray-600">
          Built with Volt.js ${config.database.provider !== 'none' ? `and ${config.orm === 'prisma' ? 'Prisma' : 'Drizzle'}` : ''}
        </p>
      </div>
    </div>
  )
}

export default App`
  })

  return files
}

function generateTanStackFiles(config: ProjectSetupConfig): TemplateFile[] {
  return [{
    path: 'app.config.ts',
    content: `import { defineConfig } from '@tanstack/start/config'

export default defineConfig({
  server: {
    preset: 'node-server'
  }
})`
  }]
}

/**
 * Generate database service based on ORM choice
 */
export function generateDatabaseService(config: ProjectSetupConfig): TemplateFile | null {
  if (config.database.provider === 'none') return null

  const content = config.orm === 'prisma'
    ? generatePrismaDatabaseService()
    : generateDrizzleDatabaseService(config.database.provider)

  return {
    path: 'src/services/database.ts',
    content
  }
}

function generatePrismaDatabaseService(): string {
  return `import { PrismaClient } from '@prisma/client'

/**
 * Prisma client instance for database operations.
 * 
 * @remarks
 * Provides type-safe database access with Prisma ORM.
 * 
 * @see https://www.prisma.io/docs/concepts/components/prisma-client
 */
export const database = new PrismaClient()`
}

function generateDrizzleDatabaseService(provider: string): string {
  return `import { db } from '../db'

/**
 * Database instance using Drizzle ORM.
 * 
 * @remarks
 * Provides type-safe database access with Drizzle ORM for ${provider}.
 * 
 * @see https://orm.drizzle.team/
 */
export const database = db`
}

/**
 * Generate Redis store service if store feature is enabled
 */
export function generateStoreService(config: ProjectSetupConfig): TemplateFile | null {
  if (!config.features.store) return null

  const content = `import { createRedisAdapter } from '@volt.js/adapter-redis'

/**
 * Redis store instance for caching and session management.
 * 
 * @remarks
 * Provides Redis-backed key-value storage, caching, and pub/sub messaging.
 */
export const store = createRedisAdapter({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  }
})`

  return {
    path: 'src/services/store.ts',
    content
  }
}

/**
 * Generate BullMQ jobs service if jobs feature is enabled
 */
export function generateJobsService(config: ProjectSetupConfig): TemplateFile | null {
  if (!config.features.jobs) return null

  const content = `import { createBullMQAdapter } from '@volt.js/adapter-bullmq'

/**
 * BullMQ job queue instance for background task processing.
 * 
 * @remarks
 * Provides Redis-backed job queues with retry logic and monitoring.
 */
export const jobQueue = createBullMQAdapter({
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  }
})

/**
 * Register all job processors here
 */
export const REGISTERED_JOBS = {
  // Add your job processors here
  // Example:
  // 'send-email': async (data: EmailJobData) => {
  //   // Process email sending
  // }
}`

  return {
    path: 'src/services/jobs.ts',
    content
  }
}

/**
 * Generate enhanced logger service if logging feature is enabled
 */
export function generateLoggerService(config: ProjectSetupConfig): TemplateFile | null {
  if (!config.features.logging) return null

  const content = `import { createVoltLogger } from '@volt.js/core'

/**
 * Enhanced logger instance with structured output.
 * 
 * @remarks
 * Provides advanced logging capabilities with context and structured output.
 */
export const logger = createVoltLogger({
  level: process.env.VOLT_LOG_LEVEL || 'info',
  pretty: process.env.NODE_ENV !== 'production'
})`

  return {
    path: 'src/services/logger.ts',
    content
  }
}

/**
 * Generate telemetry service if telemetry feature is enabled
 */
export function generateTelemetryService(config: ProjectSetupConfig): TemplateFile | null {
  if (!config.features.telemetry) return null

  const content = `import { createVoltTelemetry } from '@volt.js/core'

/**
 * Telemetry instance for tracking requests and errors.
 * 
 * @remarks
 * Provides observability features including tracing, metrics, and events.
 */
export const telemetry = createVoltTelemetry({
  tracing: process.env.VOLT_TELEMETRY_ENABLE_TRACING === 'true',
  metrics: process.env.VOLT_TELEMETRY_ENABLE_METRICS === 'true',
  events: process.env.VOLT_TELEMETRY_ENABLE_EVENTS === 'true',
  cliIntegration: process.env.VOLT_TELEMETRY_ENABLE_CLI_INTEGRATION === 'true'
})`

  return {
    path: 'src/services/telemetry.ts',
    content
  }
}

/**
 * Generate MCP server route if MCP feature is enabled
 */
export function generateMCPRoute(config: ProjectSetupConfig): TemplateFile | null {
  if (!config.features.mcp || mapTemplateToFramework(config.framework) !== 'nextjs') return null

  const content = `import { createMCPServerAdapter } from '@volt.js/adapter-mcp-server'
import { volt } from '@/volt'

const mcpAdapter = createMCPServerAdapter({
  volt,
  basePath: '/api/mcp',
  timeout: parseInt(process.env.VOLT_MCP_SERVER_TIMEOUT || '3600000')
})

export const GET = mcpAdapter.handler
export const POST = mcpAdapter.handler`

  return {
    path: 'src/app/api/mcp/[transport]/route.ts',
    content
  }
}

/**
 * Generate Providers component for React-based frameworks with VoltProvider
 */
export function generateProvidersComponent(config: ProjectSetupConfig): TemplateFile | null {
  const frameworkType = mapTemplateToFramework(config.framework)
  const reactFrameworks = ['nextjs', 'vite', 'tanstack-start']

  if (!reactFrameworks.includes(frameworkType)) {
    return null
  }

  const isNextJS = frameworkType === 'nextjs'
  const clientDirective = isNextJS ? '"use client"\n\n' : ''

  const content = `${clientDirective}import { VoltProvider } from '@volt.js/core/client'
import { type ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <VoltProvider
      ${isNextJS ? `baseUrl={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}` : `baseUrl={'http://localhost:3000'}`}
      basePath="/api/v1"
      enableRealtime={true}
      debug={process.env.NODE_ENV === 'development'}
    >
      {children}
    </VoltProvider>
  )
}`

  return {
    path: 'src/components/providers.tsx',
    content
  }
}

/**
 * Generate lib/utils.ts for ShadCN projects
 */
export function generateLibUtils(config: ProjectSetupConfig): TemplateFile | null {
  if (!config.ui.shadcn) return null

  const content = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`

  return {
    path: 'src/lib/utils.ts',
    content
  }
}

/**
 * Generate TypeScript configuration
 */
export function generateTsConfig(framework: SupportedFramework): TemplateFile {
  let compilerOptions: any = {
    target: "ES2020",
    lib: ["ES2020", "DOM"],
    allowJs: true,
    skipLibCheck: true,
    strict: true,
    forceConsistentCasingInFileNames: true,
    noEmit: true,
    esModuleInterop: true,
    module: "esnext",
    moduleResolution: "node",
    resolveJsonModule: true,
    isolatedModules: true,
    jsx: "preserve",
    incremental: true,
    baseUrl: ".",
    paths: {
      "@/*": ["./src/*"]
    }
  }

  // Framework-specific adjustments
  switch (framework) {
    case 'nextjs':
      compilerOptions.plugins = [{ name: "next" }]
      break
    case 'vite':
      compilerOptions.types = ["vite/client"]
      break
    case 'nuxt':
      compilerOptions.paths["~/*"] = ["./src/*"]
      break
  }

  const tsConfig = {
    compilerOptions,
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    exclude: ["node_modules"]
  }

  return {
    path: 'tsconfig.json',
    content: JSON.stringify(tsConfig, null, 2)
  }
}

/**
 * Generate environment variables file
 */
export function generateEnvFile(config: ProjectSetupConfig): TemplateFile {
  const envVars = getEnvironmentVariables(
    Object.entries(config.features).filter(([_, enabled]) => enabled).map(([key, _]) => key),
    config.database.provider,
    config.projectName
  )

  let content = `# Environment variables for ${config.projectName}
# Generated by @volt.js/cli

`

  // Add Volt.js client configuration for React frameworks
  const frameworkType = mapTemplateToFramework(config.framework)
  const reactFrameworks = ['nextjs', 'vite', 'tanstack-start']

  if (reactFrameworks.includes(frameworkType)) {
    if (frameworkType === 'nextjs') {
      content += `# Next.js App URL for VoltProvider\n`
      content += `NEXT_PUBLIC_APP_URL=http://localhost:3000\n\n`
    }
  }

  envVars.forEach(envVar => {
    if (envVar.description) {
      content += `# ${envVar.description}\n`
    }
    content += `${envVar.key}=${envVar.value}\n\n`
  })

  return {
    path: '.env.example',
    content
  }
}

/**
 * Generate Docker Compose configuration
 */
export function generateDockerCompose(config: ProjectSetupConfig): TemplateFile | null {
  if (!config.dockerCompose) return null

  const services = getDockerServices(
    Object.entries(config.features).filter(([_, enabled]) => enabled).map(([key, _]) => key),
    config.database.provider
  )

  if (services.length === 0) return null

  const dockerCompose = {
    version: '3.8',
    services: services.reduce((acc, service) => {
      acc[service.name] = {
        image: service.image,
        ports: service.ports,
        environment: service.environment,
        volumes: service.volumes
      }
      return acc
    }, {} as any),
    volumes: services.some(s => s.volumes) ?
      services.reduce((acc, service) => {
        service.volumes?.forEach(volume => {
          const volumeName = volume.split(':')[0]
          if (!volumeName.startsWith('/')) {
            acc[volumeName] = {}
          }
        })
        return acc
      }, {} as any) : undefined
  }

  return {
    path: 'docker-compose.yml',
    content: `# Docker Compose for ${config.projectName}
# Generated by @volt.js/cli

version: '3.8'

services:
${Object.entries(dockerCompose.services).map(([name, service]: [string, any]) => `
  ${name}:
    image: ${service.image}
${service.ports ? `    ports:\n${service.ports.map((port: string) => `      - "${port}"`).join('\n')}` : ''}
${service.environment ? `    environment:\n${Object.entries(service.environment).map(([key, value]) => `      ${key}: ${value}`).join('\n')}` : ''}
${service.volumes ? `    volumes:\n${service.volumes.map((volume: string) => `      - ${volume}`).join('\n')}` : ''}
`).join('')}
${dockerCompose.volumes ? `\nvolumes:\n${Object.keys(dockerCompose.volumes).map(volume => `  ${volume}:`).join('\n')}` : ''}
`
  }
}

/**
 * Generate .gitignore file
 */
export function generateGitIgnore(): TemplateFile {
  const content = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.npm
.yarn/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
.next/
.nuxt/
.svelte-kit/

# Database
*.db
*.sqlite
prisma/migrations/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Coverage
coverage/
.nyc_output/

# Cache
.cache/
.tmp/
.temp/
`

  return {
    path: '.gitignore',
    content
  }
}

/**
 * Generate README.md
 */
export function generateReadme(config: ProjectSetupConfig): TemplateFile {
  const enabledFeatures = Object.entries(config.features)
    .filter(([_, enabled]) => enabled)
    .map(([key, _]) => `- **${key}**: Enabled`)

  const content = `# ${config.projectName}

A modern, type-safe API built with [Volt.js](https://github.com/Volt-js/volt.js) and ${config.framework}.

## Features

${enabledFeatures.join('\n')}
${config.database.provider !== 'none' ? `- **Database**: ${config.database.provider}` : ''}
${config.dockerCompose ? '- **Docker**: Compose setup included' : ''}

## Development

### Prerequisites

- Node.js 18+
- ${config.packageManager}
${config.dockerCompose ? '- Docker and Docker Compose' : ''}

### Getting Started

1. **Install dependencies:**
   \`\`\`bash
   ${config.packageManager} install
   \`\`\`

${config.dockerCompose ? `2. **Start services with Docker:**
   \`\`\`bash
   docker-compose up -d
   \`\`\`

` : ''}${config.database.provider !== 'none' ? `3. **Setup database:**
   \`\`\`bash
   ${config.packageManager} run db:push
   \`\`\`

` : ''}4. **Start development server:**
   \`\`\`bash
   ${config.packageManager} run dev
   \`\`\`

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## Project Structure

\`\`\`
src/
├── volt.ts                     # Core initialization
├── volt.client.ts              # Client implementation
├── volt.context.ts             # Context management
├── volt.router.ts              # Router configuration
├── volt.schema.ts             # Schemas configuration
├── features/                      # Application features
│   └── example/
│       ├── controllers/           # Feature controllers
│       ├── procedures/            # Feature procedures/middleware
│       ├── example.interfaces.ts  # Type definitions
│       └── index.ts               # Feature exports
└── providers/                     # Providers layer
\`\`\`

## API Endpoints

- \`GET /api/v1/example\` - Health check
${config.features.store ? '- `GET /api/v1/example/cache/:key` - Cache example' : ''}
${config.features.jobs ? '- `POST /api/v1/example/schedule-job` - Schedule background job' : ''}

## Learn More

- [Volt.js Documentation](https://github.com/Volt-js/volt.js)
- [${config.framework} Documentation](https://docs.${config.framework === 'nextjs' ? 'nextjs.org' : config.framework + '.dev'})
${config.database.provider !== 'none' ? '- [Prisma Documentation](https://prisma.io/docs)' : ''}

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
`

  return {
    path: 'README.md',
    content
  }
}

/**
 * Generate all template files for the project - MODULAR VERSION (NEW)
 */
export async function generateAllTemplatesModular(
  config: ProjectSetupConfig,
  isExistingProject: boolean
): Promise<TemplateFile[]> {
  const generator = new ModularTemplateGenerator()
  return await generator.generateAllTemplates(config, isExistingProject)
}

/**
 * Generate preview of what would be created with modular system
 */
export async function generateModularPreview(config: ProjectSetupConfig) {
  const generator = new ModularTemplateGenerator()
  return await generator.generatePreview(config)
}

/**
 * Generate all template files for the project - DYNAMIC VERSION (LEGACY)
 */
export async function generateAllTemplates(
  config: ProjectSetupConfig,
  isExistingProject: boolean
): Promise<TemplateFile[]> {
  const templates: TemplateFile[] = []

  // Core Volt files - always generate
  templates.push(
    generateVoltRouter(config),
    generateVoltContext(config),
    generateMainRouter(config),
    generateVoltClient(config)
  )

  // Example/boilerplate files
  templates.push(
    generateExampleController(config),
    generateFeatureIndex(config),
    generateExampleInterfaces()
  )

  // Providers component for React-based frameworks
  const providersComponent = generateProvidersComponent(config)
  if (providersComponent) templates.push(providersComponent)

  // Project configuration files - DYNAMIC based on user choices
  if (!isExistingProject) {
    templates.push(generatePackageJson(config))
    templates.push(generateTsConfig(config.framework))
    templates.push(generateGitIgnore())

    // Framework-specific base files
    const frameworkFiles = generateFrameworkFiles(config)
    templates.push(...frameworkFiles)
  }

  // Environment file
  templates.push(generateEnvFile(config))

  // Database service - only if database is selected
  const databaseService = generateDatabaseService(config)
  if (databaseService) templates.push(databaseService)

  // Feature services - only generate what's needed
  const storeService = generateStoreService(config)
  if (storeService) templates.push(storeService)

  const jobsService = generateJobsService(config)
  if (jobsService) templates.push(jobsService)

  const loggerService = generateLoggerService(config)
  if (loggerService) templates.push(loggerService)

  const telemetryService = generateTelemetryService(config)
  if (telemetryService) templates.push(telemetryService)

  // MCP route - only for NextJS with MCP feature
  const mcpRoute = generateMCPRoute(config)
  if (mcpRoute) templates.push(mcpRoute)

  // Styling configuration files - only generate what's needed
  const tailwindConfig = generateTailwindConfig(config)
  if (tailwindConfig) templates.push(tailwindConfig)

  const postCssConfig = generatePostCssConfig(config)
  if (postCssConfig) templates.push(postCssConfig)

  const globalCSS = generateGlobalCSS(config)
  if (globalCSS) templates.push(globalCSS)

  const shadcnConfig = generateShadcnConfig(config)
  if (shadcnConfig) templates.push(shadcnConfig)

  const libUtils = generateLibUtils(config)
  if (libUtils) templates.push(libUtils)

  // ShadCN components - install actual component files if enabled
  if (config.ui.shadcn) {
    try {
      const { templates: shadcnComponents } = await installShadCNComponents(config.framework, '')
      templates.push(...shadcnComponents)
    } catch (error) {
      console.warn('Failed to install ShadCN components:', error)
      // Continue without ShadCN components
    }
  }

  // Docker Compose - only if enabled
  if (config.dockerCompose) {
    const dockerCompose = generateDockerCompose(config)
    if (dockerCompose) templates.push(dockerCompose)
  }

  // Filter out any null values and return
  return templates.filter(Boolean)
}
