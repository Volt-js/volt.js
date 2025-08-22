import prompts from 'prompts'
import chalk from 'chalk'
import path from 'path'
import { detectFramework, detectPackageManager, getFrameworkList, type SupportedFramework } from '../framework/framework-detector'
import type {
  ProjectSetupConfig,
  VoltFeatures,
  DatabaseProvider,
  PackageManager,
  StylingProvider,
  UIOptions
} from './types'

/**
 * ANSI Art and branding for Volt.js
 */
const VOLT_LOGO = `
${chalk.blue('┌')}${chalk.blue('─'.repeat(60))}${chalk.blue('┐')}
${chalk.blue('│')}${' '.repeat(20)}${chalk.bold.blue('⚡ VOLT.JS')}${' '.repeat(30)}${chalk.blue('│')}
${chalk.blue('│')}${' '.repeat(15)}${chalk.dim('Type-safe API framework')}${' '.repeat(22)}${chalk.blue('│')}
${chalk.blue('└')}${chalk.blue('─'.repeat(60))}${chalk.blue('┘')}
`
/**
 * Welcome message with beautiful styling
 */
function showWelcome(): void {
  console.clear()
  console.log(VOLT_LOGO)
  console.log()
  console.log(chalk.bold('Welcome to Volt.js!'))
  console.log()
  console.log(chalk.dim('Let\'s setup your type-safe API layer with modern tooling.'))
  console.log(chalk.dim('This process will configure your project with everything you need.'))
  console.log()
}

/**
 * CLI options that can be passed to skip prompts
 */
export interface CLIOptions {
  template?: string
  framework?: string
  features?: string
  database?: string
  orm?: string
  styling?: string
  ui?: string
  shadcn?: boolean
  packageManager?: string
  git?: boolean
  install?: boolean
  docker?: boolean
  force?: boolean
}

/**
 * Enhanced prompts with better UX and validation
 */
export async function runSetupPrompts(
  targetDir?: string,
  isExistingProject = false,
  cliOptions: CLIOptions = {}
): Promise<ProjectSetupConfig> {
  showWelcome()

  // Auto-detect current environment
  const detectedFramework = detectFramework()
  const detectedPackageManager = detectPackageManager()
  const projectName = targetDir ? path.basename(path.resolve(targetDir)) : 'my-volt-app'

  // Parse CLI features if provided
  const cliFeatures = cliOptions.features ? cliOptions.features.split(',').map(f => f.trim()) : []

  try {
    const answers = await prompts([
      {
        type: (isExistingProject || projectName) ? null : 'text',
        name: 'projectName',
        message: chalk.bold('• What will your project be called?'),
        initial: projectName,
        validate: (value: string) => {
          if (!value.trim()) return 'Project name is required'
          if (!/^[a-z0-9-_]+$/i.test(value.trim())) {
            return 'Project name can only contain letters, numbers, hyphens, and underscores'
          }
          return true
        },
        format: (value: string) => value.trim().toLowerCase().replace(/\s+/g, '-')
      },
      {
        type: (!cliOptions.template && !cliOptions.framework) ? 'select' : null,
        name: 'framework',
        message: '• Which starter would you like to use?',
        choices: [
          {
            title: `${chalk.green('Next.js')} ${chalk.dim('(Fullstack React Framework)')}`,
            value: 'nextjs'
          },
          {
            title: `${chalk.magenta('TanStack Start')} ${chalk.dim('(Modern Fullstack Framework)')}`,
            value: 'tanstack-start'
          }
        ],
      },
      {
        type: cliOptions.features ? null : 'multiselect',
        name: 'features',
        message: chalk.bold('• Which Volt.js features would you like to enable?'),
        choices: [
          {
            title: `${chalk.blue('Store (Redis)')}`,
            description: 'Caching, sessions, and pub/sub messaging',
            value: 'store'
          },
          {
            title: `${chalk.green('Jobs (BullMQ)')}`,
            description: 'Background task processing and job queues',
            value: 'jobs'
          },
          {
            title: `${chalk.magenta('MCP Server')}`,
            description: 'AI assistant integration with Model Context Protocol',
            value: 'mcp'
          },
          {
            title: `${chalk.yellow('Enhanced Logging')}`,
            description: 'Advanced console logging with structured output',
            value: 'logging',
            selected: true // Default selected
          },
          {
            title: `${chalk.yellow('Telemetry')}`,
            description: 'Telemetry for tracking requests and errors',
            value: 'telemetry',
            selected: true // Default selected
          }
        ],
        instructions: chalk.dim('Use ↑↓ to navigate, space to select, enter to confirm')
      },
      {
        type: cliOptions.database ? null : 'select',
        name: 'database',
        message: chalk.bold('• Choose your database (optional):'),
        choices: [
          {
            title: `${chalk.gray('None')} ${chalk.dim('- Start without database')}`,
            value: 'none'
          },
          {
            title: `${chalk.blue('PostgreSQL')} ${chalk.dim('- Production-ready')}`,
            value: 'postgresql'
          },
          {
            title: `${chalk.blue('MySQL')} ${chalk.dim('- Wide compatibility')}`,
            value: 'mysql'
          },
          {
            title: `${chalk.green('SQLite')} ${chalk.dim('- Local development')}`,
            value: 'sqlite'
          },
        ],
        initial: 0
      },
      {
        type: (prev: DatabaseProvider) => {
          const dbValue = (cliOptions.database as DatabaseProvider) || prev;
          return (cliOptions.orm || dbValue === 'none') ? null : 'select';
        },
        name: 'orm',
        message: chalk.bold('• Which ORM would you like to use?'),
        choices: [
          {
            title: `${chalk.blue('Prisma')} ${chalk.dim('- Type-safe database toolkit')}`,
            value: 'prisma'
          },
          {
            title: `${chalk.green('Drizzle')} ${chalk.dim('- Lightweight TypeScript ORM')}`,
            value: 'drizzle'
          }
        ],
        initial: 0
      },
      {
        type: (cliOptions.ui !== undefined || cliOptions.shadcn === false) ? null : 'confirm',
        name: 'shadcn',
        message: chalk.bold('• Would you like to use ShadCN/UI components?'),
        hint: chalk.dim('Automatically includes Tailwind CSS'),
        initial: false
      },
      {
        type: (prev: boolean) => {
          // Skip if ShadCN is enabled (auto-uses Tailwind) or if styling is set via CLI
          const useShadcn = cliOptions.ui ? cliOptions.ui.includes('shadcn') : prev;
          return (useShadcn || cliOptions.styling !== undefined) ? null : 'select';
        },
        name: 'styling',
        message: chalk.bold('• Choose your styling solution:'),
        choices: [
          {
            title: `${chalk.gray('None')} ${chalk.dim('- Plain CSS')}`,
            value: 'none'
          },
          {
            title: `${chalk.cyan('Tailwind CSS')} ${chalk.dim('- Utility-first framework')}`,
            value: 'tailwind'
          },
          {
            title: `${chalk.magenta('Styled Components')} ${chalk.dim('- CSS-in-JS')}`,
            value: 'styled-components'
          },
          {
            title: `${chalk.red('Emotion')} ${chalk.dim('- CSS-in-JS with performance')}`,
            value: 'emotion'
          }
        ],
        initial: 0
      },
      {
        type: (prev: DatabaseProvider) => {
          // Skip if docker explicitly set via CLI (either --docker or --no-docker)
          if (cliOptions.docker === true || cliOptions.docker === false) return null;

          // Get database value from CLI or prompt answer
          const dbValue = (cliOptions.database as DatabaseProvider) || prev;

          // Only show docker prompt if database is not 'none'
          return dbValue !== 'none' ? 'confirm' : null;
        },
        name: 'dockerCompose',
        message: chalk.bold('• Setup Docker Compose for development?'),
        hint: chalk.dim('Includes Redis and your selected database'),
        initial: cliOptions.docker !== false
      },
      {
        type: cliOptions.packageManager ? null : 'select',
        name: 'packageManager',
        message: isExistingProject
          ? `We detected ${chalk.cyan(detectedPackageManager)}. Please confirm or select another.`
          : chalk.bold('• Which package manager?'),
        choices: [
          {
            title: `${chalk.red('npm')} ${detectedPackageManager === 'npm' ? chalk.dim('(detected)') : ''}`,
            value: 'npm'
          },
          {
            title: `${chalk.blue('yarn')} ${detectedPackageManager === 'yarn' ? chalk.dim('(detected)') : ''}`,
            value: 'yarn'
          },
          {
            title: `${chalk.yellow('pnpm')} ${detectedPackageManager === 'pnpm' ? chalk.dim('(detected)') : ''}`,
            value: 'pnpm'
          },
          {
            title: `${chalk.white('bun')} ${detectedPackageManager === 'bun' ? chalk.dim('(detected)') : ''}`,
            value: 'bun'
          }
        ],
        initial: getPackageManagerChoiceIndex(cliOptions.packageManager || detectedPackageManager)
      },
      {
        type: (isExistingProject || cliOptions.git === false) ? null : 'confirm',
        name: 'initGit',
        message: chalk.bold('• Initialize Git repository?'),
        initial: cliOptions.git !== false
      },
      {
        type: cliOptions.install === false ? null : 'confirm',
        name: 'installDependencies',
        message: chalk.bold('• Install dependencies automatically?'),
        initial: cliOptions.install !== false
      }
    ], {
      onCancel: () => {
        console.log(chalk.red('\n✗ Setup cancelled'))
        process.exit(0)
      }
    })

    // Convert features array to object, prioritizing CLI options
    const selectedFeatures = cliOptions.features ? cliFeatures : (answers.features || []);

    // Set defaults for logging and telemetry if no features were explicitly chosen
    const hasExplicitFeatures = cliOptions.features || (answers.features && answers.features.length > 0);

    const featuresObj: VoltFeatures = {
      store: selectedFeatures.includes('store'),
      jobs: selectedFeatures.includes('jobs'),
      mcp: selectedFeatures.includes('mcp'),
      logging: selectedFeatures.includes('logging') || !hasExplicitFeatures,
      telemetry: selectedFeatures.includes('telemetry') || !hasExplicitFeatures
    }

    // Determine styling and UI options
    const useShadcn = cliOptions.shadcn === false ? false : (cliOptions.ui ? cliOptions.ui.includes('shadcn') : (answers.shadcn || false))
    const styling: StylingProvider = useShadcn ? 'tailwind' : (cliOptions.styling as StylingProvider) || (answers.styling || 'none')
    const ui: UIOptions = { shadcn: useShadcn }

    const config: ProjectSetupConfig = {
      projectName: answers.projectName || projectName,
      framework: cliOptions.template || cliOptions.framework || answers.framework,
      features: featuresObj,
      database: { provider: (cliOptions.database as DatabaseProvider) || answers.database || 'none' },
      orm: (cliOptions.orm as 'prisma' | 'drizzle') || (answers.orm as 'prisma' | 'drizzle') || 'prisma',
      styling,
      ui,
      packageManager: (cliOptions.packageManager as PackageManager) || answers.packageManager || detectedPackageManager,
      initGit: cliOptions.git !== false && (answers.initGit !== undefined ? answers.initGit : !isExistingProject),
      installDependencies: cliOptions.install !== false && (answers.installDependencies !== false),
      dockerCompose: cliOptions.docker === true || (cliOptions.docker !== false && (answers.dockerCompose || false)),
    }

    // Show configuration summary
    showConfigSummary(config)

    return config

  } catch (error) {
    if (error instanceof Error && error.message === 'canceled') {
      console.log(chalk.red('\n✗ Setup interrupted'))
      process.exit(0)
    }
    throw error
  }
}

/**
 * Show configuration summary to user
 */
function showConfigSummary(config: ProjectSetupConfig): void {
  console.log()
  console.log(chalk.bold('Configuration Summary:'))
  console.log(chalk.dim('─'.repeat(40)))
  console.log(`${chalk.cyan('Project:')} ${config.projectName}`)
  console.log(`${chalk.cyan('Framework:')} ${config.framework}`)

  const enabledFeatures = Object.entries(config.features)
    .filter(([_, enabled]) => enabled)
    .map(([key, _]) => key)

  if (enabledFeatures.length > 0) {
    console.log(`${chalk.cyan('Features:')} ${enabledFeatures.join(', ')}`)
  }

  if (config.database.provider !== 'none') {
    console.log(`${chalk.cyan('Database:')} ${config.database.provider} + ${config.orm}`)
  }

  if (config.ui.shadcn) {
    console.log(`${chalk.cyan('UI:')} ShadCN/UI (with Tailwind CSS)`)
  } else if (config.styling !== 'none') {
    console.log(`${chalk.cyan('Styling:')} ${config.styling}`)
  }

  console.log(`${chalk.cyan('Package Manager:')} ${config.packageManager}`)
  console.log(`${chalk.cyan('Git:')} ${config.initGit ? 'Yes' : 'No'}`)
  console.log(`${chalk.cyan('Install Dependencies:')} ${config.installDependencies ? 'Yes' : 'No'}`)

  if (config.dockerCompose) {
    console.log(`${chalk.cyan('Docker Compose:')} Yes`)
  }

  console.log()
}

/**
 * Helper to get framework choice index
 */
function getFrameworkChoiceIndex(detected: SupportedFramework): number {
  const frameworks = ['nextjs', 'vite', 'nuxt', 'sveltekit', 'remix', 'astro', 'express', 'tanstack-start', 'generic']
  return Math.max(0, frameworks.indexOf(detected))
}

/**
 * Helper to get package manager choice index
 */
function getPackageManagerChoiceIndex(detected: PackageManager): number {
  const managers = ['npm', 'yarn', 'pnpm', 'bun']
  return Math.max(0, managers.indexOf(detected))
}

export async function selectStarterPrompt(starters: string[]): Promise<string | null> {
  const { useStarter } = await prompts({
    type: 'confirm',
    name: 'useStarter',
    message: 'The directory is empty. Would you like to use one of our official starters?',
    initial: true,
  })

  if (!useStarter) {
    return null
  }

  const { selectedStarter } = await prompts({
    type: 'select',
    name: 'selectedStarter',
    message: 'Which starter would you like to use?',
    choices: starters.map(starter => ({
      title: starter.replace('starter-', '').replace(/-/g, ' '),
      value: starter,
    })),
  })

  return selectedStarter
}

export async function confirmOverwrite(message: string): Promise<boolean> {
  const { overwrite } = await prompts({
    type: 'confirm',
    name: 'overwrite',
    message,
    initial: false,
  })

  return overwrite
}
