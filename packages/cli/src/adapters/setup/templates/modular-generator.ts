import fs from 'fs/promises'
import path from 'path'
import Handlebars from 'handlebars'
import type { ProjectSetupConfig, TemplateFile } from '../types'
import { TemplateLoader } from './loader'
import type { TemplateContext } from './types'

/**
 * New modular template generator that uses folder-based configurations
 */
export class ModularTemplateGenerator {
  private loader: TemplateLoader

  constructor(templatesDir?: string) {
    this.loader = new TemplateLoader(templatesDir)
    this.registerHandlebarsHelpers()
  }

  /**
   * Generate all templates for the project using the modular system
   */
  async generateAllTemplates(
    config: ProjectSetupConfig,
    isExistingProject: boolean
  ): Promise<TemplateFile[]> {
    // Convert config to template context
    const context = this.configToContext(config)
    
    // Create generation plan
    const plan = await this.loader.createGenerationPlan(context)
    
    // Check for conflicts
    this.checkConflicts(plan.conflicts)
    
    // Generate files
    const generatedFiles = await this.loader.generateFiles(plan, context)
    
    // Convert to TemplateFile format
    const templateFiles: TemplateFile[] = generatedFiles.map(file => ({
      path: file.path,
      content: file.content
    }))

    // Add dynamic package.json with merged dependencies
    if (!isExistingProject) {
      const packageJson = this.generatePackageJson(config, plan)
      if (packageJson) {
        templateFiles.push(packageJson)
      }
    }

    return templateFiles
  }

  /**
   * Convert ProjectSetupConfig to TemplateContext
   */
  private configToContext(config: ProjectSetupConfig): TemplateContext {
    return {
      projectName: config.projectName,
      framework: this.mapFramework(config.framework),
      features: config.features as unknown as Record<string, boolean>,
      database: {
        provider: config.database.provider,
        url: config.database.url
      },
      orm: config.orm,
      styling: config.styling,
      ui: config.ui,
      packageManager: config.packageManager,
      dockerCompose: config.dockerCompose,
      initGit: config.initGit,
      installDependencies: config.installDependencies,
      NODE_ENV: 'development'  // Default to development for template generation
    }
  }

  /**
   * Map framework names to normalized identifiers
   */
  private mapFramework(framework: string): string {
    const mapping: Record<string, string> = {
      'nextjs': 'nextjs',
      'tanstack-start': 'tanstack-start',
      // Legacy mappings for backward compatibility
      'starter-nextjs': 'nextjs',
      'starter-express-rest-api': 'express',
      'starter-bun-react-app': 'react',
      'starter-bun-rest-api': 'generic',
      'starter-deno-rest-api': 'generic',
      'starter-tanstack-start': 'tanstack-start'
    }
    
    return mapping[framework] || 'generic'
  }

  /**
   * Generate package.json with merged dependencies from all modules
   */
  private generatePackageJson(config: ProjectSetupConfig, plan: any): TemplateFile | null {
    try {
      const basePackage = {
        name: config.projectName,
        version: "0.1.0",
        private: true,
        scripts: {
          'type-check': 'tsc --noEmit',
          ...plan.mergedScripts
        },
        dependencies: {
          '@volt.js/core': 'latest',
          'zod': '^3.25.0',
          ...plan.mergedDependencies.dependencies
        },
        devDependencies: {
          'typescript': '^5.6.0',
          '@types/node': '^22.0.0',
          'tsx': '^4.7.0',
          ...plan.mergedDependencies.devDependencies
        }
      }

      // Add framework-specific dependencies
      this.addFrameworkDependencies(basePackage, config.framework)

      return {
        path: 'package.json',
        content: JSON.stringify(basePackage, null, 2)
      }
    } catch (error) {
      console.warn('Failed to generate package.json:', error)
      return null
    }
  }

  /**
   * Add framework-specific dependencies to package.json
   */
  private addFrameworkDependencies(packageJson: any, framework: string): void {
    const frameworkConfigs: Record<string, { dependencies: Record<string, string>, devDependencies: Record<string, string> }> = {
      'nextjs': {
        dependencies: {
          'next': '^15.0.0',
          'react': '^19.0.0',
          'react-dom': '^19.0.0'
        },
        devDependencies: {
          '@types/react': '^19.0.0',
          '@types/react-dom': '^19.0.0'
        }
      },
      'starter-bun-react-app': {
        dependencies: {
          'react': '^19.0.0',
          'react-dom': '^19.0.0'
        },
        devDependencies: {
          '@types/react': '^19.0.0',
          '@types/react-dom': '^19.0.0',
          '@vitejs/plugin-react': '^4.0.0',
          'vite': '^5.0.0'
        }
      },
      'tanstack-start': {
        dependencies: {
          '@tanstack/react-router': '^1.125.6',
          '@tanstack/react-router-devtools': '^1.125.6',
          '@tanstack/react-start': '^1.125.6',
          'react': '^19.0.0',
          'react-dom': '^19.0.0'
        },
        devDependencies: {
          '@types/react': '^19.0.8',
          '@types/react-dom': '^19.0.3',
          'vite': '^6.3.5',
          'vite-tsconfig-paths': '^5.1.4'
        }
      },
      // Legacy compatibility mappings
      'starter-nextjs': {
        dependencies: {
          'next': '^15.0.0',
          'react': '^19.0.0',
          'react-dom': '^19.0.0'
        },
        devDependencies: {
          '@types/react': '^19.0.0',
          '@types/react-dom': '^19.0.0'
        }
      },
      'starter-tanstack-start': {
        dependencies: {
          '@tanstack/react-router': '^1.125.6',
          '@tanstack/react-router-devtools': '^1.125.6',
          '@tanstack/react-start': '^1.125.6',
          'react': '^19.0.0',
          'react-dom': '^19.0.0'
        },
        devDependencies: {
          '@types/react': '^19.0.8',
          '@types/react-dom': '^19.0.3',
          'vite': '^6.3.5',
          'vite-tsconfig-paths': '^5.1.4'
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
      }
    }

    const frameworkConfig = frameworkConfigs[framework]
    if (frameworkConfig) {
      Object.assign(packageJson.dependencies, frameworkConfig.dependencies)
      Object.assign(packageJson.devDependencies, frameworkConfig.devDependencies)
    }
  }

  /**
   * Check for configuration conflicts
   */
  private checkConflicts(conflicts: string[]): void {
    if (conflicts.length > 0) {
      throw new Error(`Configuration conflicts detected: ${conflicts.join(', ')}`)
    }
  }

  /**
   * Register custom Handlebars helpers
   */
  private registerHandlebarsHelpers(): void {
    // Equality helper
    Handlebars.registerHelper('eq', function (a: any, b: any) {
      return a === b
    })

    // Not equal helper
    Handlebars.registerHelper('ne', function (a: any, b: any) {
      return a !== b
    })

    // If helper with condition
    Handlebars.registerHelper('if_eq', function (this: any, a: any, b: any, options: any) {
      if (a === b) {
        return options.fn(this)
      } else {
        return options.inverse(this)
      }
    })

    // Logical OR helper
    Handlebars.registerHelper('or', function (...args: any[]) {
      const options = args.pop()
      return args.some(arg => !!arg)
    })

    // Logical AND helper
    Handlebars.registerHelper('and', function (...args: any[]) {
      const options = args.pop()
      return args.every(arg => !!arg)
    })

    // JSON helper
    Handlebars.registerHelper('json', function (context: any) {
      return JSON.stringify(context, null, 2)
    })

    // Uppercase helper
    Handlebars.registerHelper('upperCase', function (str: string) {
      return str?.toUpperCase() || ''
    })

    // Lowercase helper
    Handlebars.registerHelper('lowerCase', function (str: string) {
      return str?.toLowerCase() || ''
    })

    // Capitalize helper
    Handlebars.registerHelper('capitalize', function (str: string) {
      return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
    })
  }

  /**
   * Get available templates for introspection
   */
  async getAvailableTemplates(): Promise<any> {
    return await this.loader.loadRegistry()
  }

  /**
   * Generate a preview of what would be created without actually writing files
   */
  async generatePreview(config: ProjectSetupConfig): Promise<{
    files: string[]
    dependencies: Record<string, string>
    devDependencies: Record<string, string>
    environmentVariables: Array<{ key: string; value: string; description?: string }>
    dockerServices: any[]
  }> {
    const context = this.configToContext(config)
    const plan = await this.loader.createGenerationPlan(context)
    const generatedFiles = await this.loader.generateFiles(plan, context)

    return {
      files: generatedFiles.map(f => f.path),
      dependencies: plan.mergedDependencies.dependencies,
      devDependencies: plan.mergedDependencies.devDependencies,
      environmentVariables: plan.environmentVariables,
      dockerServices: plan.dockerServices
    }
  }
}