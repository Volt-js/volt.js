import fs from 'fs/promises'
import path from 'path'
import { execa } from 'execa'
import ora from 'ora'
import chalk from 'chalk'
import type { ProjectSetupConfig } from './types'
import {
  getFeatureDependencies,
  getAllDependencies,
  DATABASE_CONFIGS
} from './features'
import { generateAllTemplates, generateAllTemplatesModular } from './templates'
import { ShadCNInstaller } from './shadcn-installer'
import { createChildLogger } from '../logger'

const logger = createChildLogger({ component: 'project-generator' })

/**
 * Main project generator class
 */
export class ProjectGenerator {
  private config: ProjectSetupConfig
  private targetDir: string
  private isExistingProject: boolean
  private spinner = ora()
  private useModularSystem: boolean

  constructor(config: ProjectSetupConfig, targetDir: string, isExistingProject: boolean, useModularSystem = false) {
    this.config = config
    this.targetDir = path.resolve(targetDir)
    this.isExistingProject = isExistingProject
    this.useModularSystem = useModularSystem
  }

  /**
   * Map template names to framework types
   */
  private mapTemplateToFramework(framework: string): string {
    const mapping: Record<string, string> = {
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
   * Generate the complete project
   */
  async generate(): Promise<void> {
    try {
      logger.info('Starting project generation', {
        project: this.config.projectName,
        targetDir: this.targetDir,
        isExisting: this.isExistingProject,
      })

      if (!this.isExistingProject) {
        await this.createProjectStructure()
      } else {
        this.spinner.succeed(chalk.dim('✓ Existing project detected, skipping structure creation.'))
      }

      await this.generateFiles()

      if (this.config.installDependencies) {
        await this.installDependencies()
      }

      if (this.config.initGit && !this.isExistingProject) {
        await this.initializeGit()
      }

      await this.runPostSetupTasks()

      this.showSuccessMessage()

    } catch (error) {
      this.spinner.fail(chalk.red('Project generation failed'))
      logger.error('Project generation failed', { error })
      throw error
    }
  }

  private async downloadTemplate(): Promise<{ isStarter: boolean, success: boolean }> {
    const { framework } = this.config
    const templateUrl = `https://github.com/Volt-js/volt.js.git`
    const branch = 'main'
    const tempDir = path.join(this.targetDir, '__volt_tmp__')
    const starterDir = path.join(tempDir, 'apps', framework)
    const destDir = this.targetDir

    let isValidStarter = false

    this.spinner.start(`Baixando apenas o conteúdo da pasta starter (${framework}) do branch ${branch}...`)

    try {
      // Remove tempDir if exists
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => { })
      // Clone repo to tempDir
      await execa('git', [
        'clone',
        '--depth', '1',
        '--branch', branch,
        '--single-branch',
        templateUrl,
        tempDir
      ])
      // Verifica se starterDir existe
      const stat = await fs.stat(starterDir).catch(() => null)
      if (!stat || !stat.isDirectory()) {
        throw new Error('Diretório starter não encontrado no template clonado.')
      }

      isValidStarter = true

      // Copia todo o conteúdo de starterDir para destDir
      // Função recursiva para copiar arquivos e pastas
      const copyRecursive = async (src: string, dest: string) => {
        const entries = await fs.readdir(src, { withFileTypes: true })
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name)
          const destPath = path.join(dest, entry.name)
          if (entry.isDirectory()) {
            await fs.mkdir(destPath, { recursive: true })
            await copyRecursive(srcPath, destPath)
          } else if (entry.isFile()) {
            await fs.copyFile(srcPath, destPath)
          }
        }
      }

      await copyRecursive(starterDir, destDir)

      // Remove tempDir
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => { })

      this.spinner.succeed(chalk.dim('✓ Conteúdo da pasta starter copiado com sucesso'))
      return { isStarter: isValidStarter, success: true }
    } catch (error) {
      // try check from error if is valid

      console.error('Template download/copy failed', error)
      this.spinner.fail(chalk.red('Falha ao baixar/copiar o template starter'))
      logger.error('Template download/copy failed', { error })
      // Remove tempDir se deu erro
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => { })
      return { isStarter: isValidStarter, success: false }
    }
  }

  /**
   * Create project directory structure based on README.md structure
   */
  private async createProjectStructure(): Promise<void> {
    this.spinner.start('Creating project structure...')

    try {
      // Skip template copying - we'll generate everything dynamically
      console.log('🚀 Creating project structure dynamically...')

      // Ensure target directory exists
      await fs.mkdir(this.targetDir, { recursive: true })

      // Create subdirectories dynamically based on configuration
      const dirs = [
        'src',
        'src/features',
        'src/features/example',
        'src/features/example/controllers',
        'src/features/example/procedures'
      ]

      // Add services directory only if any services are needed
      const needsServices = Object.values(this.config.features).some(enabled => enabled) ||
        this.config.database.provider !== 'none'

      if (needsServices) {
        dirs.push('src/services')
      }

      // Add presentation layers if framework supports it (React-based)
      const frameworkType = this.mapTemplateToFramework(this.config.framework)
      const reactFrameworks = ['nextjs', 'vite', 'tanstack-start']
      if (reactFrameworks.includes(frameworkType)) {
        dirs.push(
          'src/features/example/presentation',
          'src/features/example/presentation/components',
          'src/features/example/presentation/hooks',
          'src/features/example/presentation/contexts',
          'src/features/example/presentation/utils'
        )

        // Add lib directory for ShadCN utils
        if (this.config.ui.shadcn) {
          dirs.push('src/lib')
        }
      }

      // Add database directories based on ORM choice
      if (this.config.database.provider !== 'none') {
        if (this.config.orm === 'prisma') {
          dirs.push('prisma')
        } else if (this.config.orm === 'drizzle') {
          dirs.push('src/db', 'drizzle')
        }
      }

      // Add app directory structure for NextJS with specific features
      if (frameworkType === 'nextjs') {
        dirs.push('src/app', 'src/app/api', 'src/app/api/v1', 'src/app/api/v1/[[...all]]')

        // Add MCP directory if MCP is enabled
        if (this.config.features.mcp) {
          dirs.push('src/app/api/mcp', 'src/app/api/mcp/[transport]')
        }
      }

      for (const dir of dirs) {
        await fs.mkdir(path.join(this.targetDir, dir), { recursive: true })
      }

      this.spinner.succeed(chalk.green('✓ Project structure created'))
      logger.info('Project structure created successfully')

    } catch (error) {
      this.spinner.fail(chalk.red('✗ Failed to create project structure'))
      throw error
    }
  }

  /**
   * Generate all project files
   */
  private async generateFiles(): Promise<void> {
    this.spinner.start('Generating project files...')

    try {
      const enabledFeatures = Object.entries(this.config.features)
        .filter(([_, enabled]) => enabled)
        .map(([key]) => key)

      const allDeps = getAllDependencies(
        enabledFeatures,
        this.config.database.provider,
        this.config.orm,
        this.config.styling,
        this.config.ui.shadcn
      )

      const coreDependencies = [
        { name: '@volt.js/core', version: '*' },
        { name: 'zod', version: '3.25.48' },
      ]

      const coreDevDependencies = [
        { name: 'typescript', version: '^5.6.3' },
        { name: '@types/node', version: '^22.9.0' },
        { name: 'tsx', version: '^4.7.0' },
      ]

      // We only need the dependencies for updating an existing package.json
      if (this.isExistingProject) {
        const deps = [...coreDependencies, ...allDeps.dependencies]
        const devDeps = [...coreDevDependencies, ...allDeps.devDependencies]
        await this.updatePackageJson(deps, devDeps)
      }

      // Generate templates using the selected system
      const allTemplates = this.useModularSystem
        ? await generateAllTemplatesModular(this.config, this.isExistingProject)
        : await generateAllTemplates(this.config, this.isExistingProject)

      let writtenCount = 0
      for (const template of allTemplates) {
        const filePath = path.join(this.targetDir, template.path)

        // For existing projects, be careful about overwriting files
        if (this.isExistingProject) {
          if (template.path === 'package.json') continue // Handled by updatePackageJson

          const fileExists = await fs.stat(filePath).catch(() => null)
          if (fileExists && ['.gitignore', 'README.md', 'tsconfig.json'].includes(path.basename(filePath))) {
            this.spinner.info(chalk.dim(`Skipping existing file: ${template.path}`))
            continue
          }
        }

        // Ensure directory exists
        await fs.mkdir(path.dirname(filePath), { recursive: true })

        // Write the file
        await fs.writeFile(filePath, template.content, 'utf8')

        // Set executable permission if needed
        if (template.executable) {
          await fs.chmod(filePath, 0o755)
        }

        writtenCount++
        this.spinner.text = `Generating files... (${writtenCount}/${allTemplates.length})`
      }

      if (this.config.database.provider !== 'none') {
        if (this.config.orm === 'prisma') {
          await this.generatePrismaSchema()
        } else {
          await this.generateDrizzleSchema()
        }
      }

      this.spinner.succeed(chalk.green(`✓ Generated ${writtenCount} files`))
      logger.info('Project files generated successfully', { fileCount: writtenCount })
    } catch (error) {
      this.spinner.fail(chalk.red('✗ Failed to generate files'))
      throw error
    }
  }

  /**
   * Updates an existing package.json file with new dependencies and scripts.
   */
  private async updatePackageJson(
    dependencies: { name: string; version: string }[],
    devDependencies: { name: string; version: string }[],
  ): Promise<void> {
    const pkgJsonPath = path.join(this.targetDir, 'package.json')
    try {
      const pkgJsonContent = await fs.readFile(pkgJsonPath, 'utf-8')
      const pkgJson = JSON.parse(pkgJsonContent)

      this.spinner.text = 'Updating package.json...'

      // Add dependencies
      pkgJson.dependencies = pkgJson.dependencies || {}
      for (const dep of dependencies) {
        if (!pkgJson.dependencies[dep.name]) {
          pkgJson.dependencies[dep.name] = dep.version
        }
      }

      // Add dev dependencies
      pkgJson.devDependencies = pkgJson.devDependencies || {}
      for (const dep of devDependencies) {
        if (!pkgJson.devDependencies[dep.name]) {
          pkgJson.devDependencies[dep.name] = dep.version
        }
      }

      // Add database scripts if needed, without overwriting existing ones
      if (this.config.database.provider !== 'none') {
        pkgJson.scripts = pkgJson.scripts || {}
        let newScripts: Record<string, string> = {}

        if (this.config.orm === 'prisma') {
          newScripts = {
            'db:generate': 'prisma generate',
            'db:push': 'prisma db push',
            'db:studio': 'prisma studio',
            'db:migrate': 'prisma migrate dev',
          }
        } else if (this.config.orm === 'drizzle') {
          newScripts = {
            'db:generate': 'drizzle-kit generate',
            'db:push': 'drizzle-kit push',
            'db:studio': 'drizzle-kit studio',
            'db:migrate': 'drizzle-kit migrate',
          }
        }

        for (const [name, command] of Object.entries(newScripts)) {
          if (!pkgJson.scripts[name]) {
            pkgJson.scripts[name] = command
          }
        }
      }

      await fs.writeFile(pkgJsonPath, JSON.stringify(pkgJson, null, 2))
      this.spinner.succeed(chalk.green('✓ package.json updated'))
    } catch (error) {
      this.spinner.warn(chalk.yellow('Could not update package.json. Please add dependencies manually.'))
      logger.warn('Failed to update package.json', { error })
    }
  }

  /**
   * Generate Prisma schema file
   */
  private async generatePrismaSchema(): Promise<void> {
    const { provider } = this.config.database

    let datasourceUrl = 'env("DATABASE_URL")'
    let providerName = provider === 'postgresql' ? 'postgresql' : provider === 'mysql' ? 'mysql' : 'sqlite'

    const schema = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${providerName}"
  url      = ${datasourceUrl}
}
`

    const schemaPath = path.join(this.targetDir, 'prisma', 'schema.prisma')
    await fs.mkdir(path.dirname(schemaPath), { recursive: true })
    await fs.writeFile(schemaPath, schema, 'utf8')
  }

  /**
   * Generate Drizzle schema files
   */
  private async generateDrizzleSchema(): Promise<void> {
    const { provider } = this.config.database

    // Create src/db directory
    const dbDir = path.join(this.targetDir, 'src', 'db')
    await fs.mkdir(dbDir, { recursive: true })

    // Generate schema file
    let schemaContent = ''
    let configContent = ''

    switch (provider) {
      case 'postgresql':
        schemaContent = `import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow()
})
`
        configContent = `import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
`
        break
      case 'mysql':
        schemaContent = `import { mysqlTable, int, varchar, timestamp } from 'drizzle-orm/mysql-core'

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow()
})
`
        configContent = `import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
`
        break
      case 'sqlite':
        schemaContent = `import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' })
})
`
        configContent = `import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
`
        break
    }

    // Generate connection file
    let connectionContent = ''
    switch (provider) {
      case 'postgresql':
        connectionContent = `import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const db = drizzle(pool, { schema })
`
        break
      case 'mysql':
        connectionContent = `import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from './schema'

const connection = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
})

export const db = drizzle(connection, { schema })
`
        break
      case 'sqlite':
        connectionContent = `import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'

const sqlite = new Database(process.env.DATABASE_URL!.replace('file:', ''))

export const db = drizzle(sqlite, { schema })
`
        break
    }

    // Write files
    await fs.writeFile(path.join(dbDir, 'schema.ts'), schemaContent, 'utf8')
    await fs.writeFile(path.join(dbDir, 'index.ts'), connectionContent, 'utf8')
    await fs.writeFile(path.join(this.targetDir, 'drizzle.config.ts'), configContent, 'utf8')
  }

  /**
   * Install project dependencies
   */
  private async installDependencies(): Promise<void> {
    this.spinner.start(`Installing dependencies with ${this.config.packageManager}...`)

    try {
      const { command, args } = this.getInstallCommand()

      await execa(command, args, {
        cwd: this.targetDir,
        stdio: 'pipe'
      })

      this.spinner.succeed(chalk.green('✓ Dependencies installed'))

    } catch (error) {
      this.spinner.fail(chalk.red('✗ Failed to install dependencies'))
      throw error
    }
  }

  /**
   * Get install command based on package manager
   */
  private getInstallCommand(): { command: string; args: string[] } {
    switch (this.config.packageManager) {
      case 'yarn':
        return { command: 'yarn', args: ['install'] }
      case 'pnpm':
        return { command: 'pnpm', args: ['install'] }
      case 'bun':
        return { command: 'bun', args: ['install'] }
      default:
        return { command: 'npm', args: ['install'] }
    }
  }

  /**
   * Initialize git repository
   */
  private async initializeGit(): Promise<void> {
    this.spinner.start('Initializing Git repository...')

    try {
      await execa('git', ['init'], {
        cwd: this.targetDir,
        stdio: 'pipe'
      })

      await execa('git', ['add', '.'], {
        cwd: this.targetDir,
        stdio: 'pipe'
      })

      await execa('git', ['commit', '-m', 'Initial commit'], {
        cwd: this.targetDir,
        stdio: 'pipe'
      })

      this.spinner.succeed(chalk.green('✓ Git repository initialized'))

    } catch (error) {
      this.spinner.fail(chalk.red('✗ Failed to initialize Git repository'))
      logger.warn('Git initialization failed', { error })
    }
  }

  /**
   * Run post-setup tasks like Prisma/Drizzle generation
   */
  private async runPostSetupTasks(): Promise<void> {
    // Install ShadCN components if enabled
    if (this.config.ui.shadcn && this.config.installDependencies) {
      this.spinner.start('Installing ShadCN components...')

      try {
        const installer = new ShadCNInstaller(this.targetDir)
        await installer.installComponentsPostGeneration()
        this.spinner.succeed(chalk.green('✓ ShadCN components installed'))
      } catch (error) {
        this.spinner.fail(chalk.red('✗ Failed to install ShadCN components'))
        logger.warn('ShadCN component installation failed', { error })
        // Continue execution even if ShadCN fails
      }
    }

    if (this.config.database.provider !== 'none') {
      const ormName = this.config.orm === 'prisma' ? 'Prisma' : 'Drizzle'
      this.spinner.start(`Generating ${ormName} client...`)

      try {
        const { command, args } = this.getRunCommand('db:generate')

        await execa(command, args, {
          cwd: this.targetDir,
          stdio: 'pipe'
        })

        this.spinner.succeed(chalk.green(`✓ ${ormName} client generated`))

      } catch (error) {
        this.spinner.fail(chalk.red(`✗ Failed to generate ${ormName} client`))
        logger.warn(`${ormName} client generation failed`, { error })
      }
    }
  }

  /**
   * Get run command based on package manager
   */
  private getRunCommand(script: string): { command: string; args: string[] } {
    switch (this.config.packageManager) {
      case 'yarn':
        return { command: 'yarn', args: [script] }
      case 'pnpm':
        return { command: 'pnpm', args: ['run', script] }
      case 'bun':
        return { command: 'bun', args: ['run', script] }
      default:
        return { command: 'npm', args: ['run', script] }
    }
  }

  /**
   * Show success message with next steps
   */
  private showSuccessMessage(): void {
    console.log()
    if (this.isExistingProject) {
      console.log(chalk.green('✓ Success! Volt.js has been added to your project!'))
    } else {
      console.log(chalk.green('✓ Success! Your Volt.js project is ready!'))
    }
    console.log()

    console.log(chalk.bold('Next steps:'))
    if (!this.isExistingProject) {
      console.log(`  ${chalk.cyan('cd')} ${this.config.projectName}`)
    }

    if (!this.config.installDependencies) {
      console.log(`  ${chalk.cyan(this.config.packageManager)} install`)
    }

    if (this.config.dockerCompose) {
      console.log(`  ${chalk.cyan('docker-compose')} up -d`)
    }

    if (this.config.database.provider !== 'none') {
      console.log(`  ${chalk.cyan(this.config.packageManager)} run db:push`)
    }

    console.log(`  ${chalk.cyan(this.config.packageManager)} run dev`)
    console.log()

    console.log(chalk.bold('Helpful commands:'))
    console.log(`  ${chalk.dim('Start development:')} ${chalk.cyan(`${this.config.packageManager} run dev`)}`)
    console.log(`  ${chalk.dim('Build for production:')} ${chalk.cyan(`${this.config.packageManager} run build`)}`)

    if (this.config.database.provider !== 'none') {
      console.log(`  ${chalk.dim('Database operations:')} ${chalk.cyan(`${this.config.packageManager} run db:studio`)}`)
    }

    if (this.isExistingProject) {
      console.log()
      console.log(chalk.yellow('Remember to integrate the Volt router into your existing server setup!'))
    }

    console.log()
    console.log(chalk.dim('Happy coding!'))
  }
}

/**
 * Generate project with given configuration
 */
export async function generateProject(
  config: ProjectSetupConfig,
  targetDir: string,
  isExistingProject: boolean,
  useModularSystem = false
): Promise<void> {
  const generator = new ProjectGenerator(config, targetDir, isExistingProject, useModularSystem)
  await generator.generate()
}

/**
 * Generate project using the new modular template system
 */
export async function generateProjectModular(
  config: ProjectSetupConfig,
  targetDir: string,
  isExistingProject: boolean
): Promise<void> {
  const generator = new ProjectGenerator(config, targetDir, isExistingProject, true)
  await generator.generate()
}
