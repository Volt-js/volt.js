import fs from 'fs/promises'
import path from 'path'
import Handlebars from 'handlebars'
import type {
  ModuleConfig,
  ModuleTemplate,
  LoadedModule,
  ModuleRegistry,
  GenerationPlan,
  TemplateContext
} from './types'

/**
 * Template module loader and processor
 */
export class TemplateLoader {
  private templatesDir: string
  private registry: ModuleRegistry | null = null

  constructor(templatesDir?: string) {
    this.templatesDir = templatesDir || path.join(__dirname, 'templates')
  }

  /**
   * Load all available template modules
   */
  async loadRegistry(): Promise<ModuleRegistry> {
    if (this.registry) {
      return this.registry
    }

    const registry: ModuleRegistry = {
      core: [],
      databases: {},
      features: {},
      frameworks: {},
      styling: {},
      common: []
    }

    // Load core modules
    registry.core = await this.loadModulesFromDirectory(
      path.join(this.templatesDir, 'core')
    )

    // Load common modules
    registry.common = await this.loadModulesFromDirectory(
      path.join(this.templatesDir, 'common')
    )

    // Load database modules
    const databasesDir = path.join(this.templatesDir, 'databases')
    if (await this.directoryExists(databasesDir)) {
      const dbTypes = await fs.readdir(databasesDir)
      for (const dbType of dbTypes) {
        const dbPath = path.join(databasesDir, dbType)
        if (await this.isDirectory(dbPath)) {
          registry.databases[dbType] = await this.loadModulesFromDirectory(dbPath)
        }
      }
    }

    // Load feature modules
    const featuresDir = path.join(this.templatesDir, 'features')
    if (await this.directoryExists(featuresDir)) {
      const features = await fs.readdir(featuresDir)
      for (const feature of features) {
        const featurePath = path.join(featuresDir, feature)
        if (await this.isDirectory(featurePath)) {
          const modules = await this.loadModulesFromDirectory(featurePath)
          if (modules.length > 0) {
            registry.features[feature] = modules[0] // Single module per feature
          }
        }
      }
    }

    // Load framework modules
    const frameworksDir = path.join(this.templatesDir, 'frameworks')
    if (await this.directoryExists(frameworksDir)) {
      const frameworks = await fs.readdir(frameworksDir)
      for (const framework of frameworks) {
        const frameworkPath = path.join(frameworksDir, framework)
        if (await this.isDirectory(frameworkPath)) {
          const modules = await this.loadModulesFromDirectory(frameworkPath)
          if (modules.length > 0) {
            registry.frameworks[framework] = modules[0] // Single module per framework
          }
        }
      }
    }

    // Load styling modules
    const stylingDir = path.join(this.templatesDir, 'styling')
    if (await this.directoryExists(stylingDir)) {
      const stylingTypes = await fs.readdir(stylingDir)
      for (const stylingType of stylingTypes) {
        const stylingPath = path.join(stylingDir, stylingType)
        if (await this.isDirectory(stylingPath)) {
          const modules = await this.loadModulesFromDirectory(stylingPath)
          if (modules.length > 0) {
            registry.styling[stylingType] = modules[0] // Single module per styling type
          }
        }
      }
    }

    this.registry = registry
    return registry
  }

  /**
   * Create a generation plan based on user configuration
   */
  async createGenerationPlan(context: TemplateContext): Promise<GenerationPlan> {
    const registry = await this.loadRegistry()
    const selectedModules: LoadedModule[] = []

    // Always include core modules
    selectedModules.push(...registry.core)

    // Include common modules
    selectedModules.push(...registry.common)

    // Include framework module
    const frameworkModule = registry.frameworks[context.framework]
    if (frameworkModule) {
      selectedModules.push(frameworkModule)
    }

    // Include database modules if configured
    if (context.database.provider && context.database.provider !== 'none') {
      const dbModules = registry.databases[context.database.provider]
      if (dbModules) {
        selectedModules.push(...dbModules)
      }

      // Include ORM-specific modules
      if (context.orm) {
        const ormModules = registry.databases[context.orm]
        if (ormModules) {
          selectedModules.push(...ormModules)
        }
      }
    }

    // Include feature modules
    for (const [featureKey, enabled] of Object.entries(context.features)) {
      if (enabled) {
        const featureModule = registry.features[featureKey]
        if (featureModule) {
          selectedModules.push(featureModule)
        }
      }
    }

    // Include styling modules
    if (context.styling && context.styling !== 'none') {
      const stylingModule = registry.styling[context.styling]
      if (stylingModule) {
        selectedModules.push(stylingModule)
      }
    }

    // Include ShadCN if enabled
    if (context.ui.shadcn) {
      const shadcnModule = registry.styling['shadcn']
      if (shadcnModule) {
        selectedModules.push(shadcnModule)
      }
    }

    // Process modules and create plan
    return this.processModules(selectedModules, context)
  }

  /**
   * Generate files from a generation plan
   */
  async generateFiles(plan: GenerationPlan, context: TemplateContext): Promise<Array<{ path: string; content: string }>> {
    const files: Array<{ path: string; content: string }> = []

    for (const template of plan.templates) {
      // Check condition if present
      if (template.condition) {
        const shouldInclude = this.evaluateCondition(template.condition, context)
        if (!shouldInclude) {
          continue
        }
      }

      // Process template with Handlebars
      const compiledTemplate = Handlebars.compile(template.content)
      const processedContent = compiledTemplate(context)

      files.push({
        path: template.path,
        content: processedContent
      })
    }

    return files
  }

  /**
   * Load modules from a directory
   */
  private async loadModulesFromDirectory(dirPath: string): Promise<LoadedModule[]> {
    if (!(await this.directoryExists(dirPath))) {
      return []
    }

    const modules: LoadedModule[] = []
    
    // Check if this directory contains a config.json (single module)
    const configPath = path.join(dirPath, 'config.json')
    if (await this.fileExists(configPath)) {
      const module = await this.loadModule(dirPath)
      if (module) {
        modules.push(module)
      }
    } else {
      // Check for subdirectories with modules
      const entries = await fs.readdir(dirPath)
      for (const entry of entries) {
        const entryPath = path.join(dirPath, entry)
        if (await this.isDirectory(entryPath)) {
          const subConfigPath = path.join(entryPath, 'config.json')
          if (await this.fileExists(subConfigPath)) {
            const module = await this.loadModule(entryPath)
            if (module) {
              modules.push(module)
            }
          }
        }
      }
    }

    return modules
  }

  /**
   * Load a single module from a directory
   */
  private async loadModule(modulePath: string): Promise<LoadedModule | null> {
    try {
      const configPath = path.join(modulePath, 'config.json')
      const configContent = await fs.readFile(configPath, 'utf-8')
      const config: ModuleConfig = JSON.parse(configContent)

      const templates = await this.loadTemplatesFromDirectory(modulePath)
      const moduleId = path.basename(modulePath)

      return {
        id: moduleId,
        config,
        templates,
        basePath: modulePath
      }
    } catch (error) {
      console.warn(`Failed to load module from ${modulePath}:`, error)
      return null
    }
  }

  /**
   * Load all template files from a directory recursively
   */
  private async loadTemplatesFromDirectory(dirPath: string): Promise<ModuleTemplate[]> {
    const templates: ModuleTemplate[] = []
    
    const loadFromDir = async (currentPath: string, relativePath = '') => {
      const entries = await fs.readdir(currentPath)
      
      for (const entry of entries) {
        const entryPath = path.join(currentPath, entry)
        const relativeEntryPath = relativePath ? path.join(relativePath, entry) : entry
        
        if (await this.isDirectory(entryPath)) {
          // Skip config files and metadata directories
          if (entry === 'node_modules' || entry === '.git') {
            continue
          }
          
          await loadFromDir(entryPath, relativeEntryPath)
        } else if (entry.endsWith('.hbs') || entry.endsWith('.handlebars')) {
          // Template file
          const content = await fs.readFile(entryPath, 'utf-8')
          const targetPath = relativeEntryPath.replace(/\.(hbs|handlebars)$/, '')
          
          templates.push({
            path: targetPath,
            content,
            condition: this.extractCondition(content)
          })
        } else if (entry !== 'config.json' && !entry.startsWith('.')) {
          // Static file (copy as-is)
          const content = await fs.readFile(entryPath, 'utf-8')
          
          templates.push({
            path: relativeEntryPath,
            content
          })
        }
      }
    }
    
    await loadFromDir(dirPath)
    return templates
  }

  /**
   * Process modules and merge configurations
   */
  private async processModules(modules: LoadedModule[], context: TemplateContext): Promise<GenerationPlan> {
    const templates: ModuleTemplate[] = []
    const mergedDependencies = { dependencies: {}, devDependencies: {} }
    const mergedScripts: Record<string, string> = {}
    const environmentVariables: any[] = []
    const dockerServices: any[] = []
    const requiredDirectories = new Set<string>()
    const conflicts: string[] = []

    for (const module of modules) {
      // Add templates
      templates.push(...module.templates)

      // Merge dependencies
      if (module.config.dependencies?.dependencies) {
        Object.assign(mergedDependencies.dependencies, module.config.dependencies.dependencies)
      }
      if (module.config.dependencies?.devDependencies) {
        Object.assign(mergedDependencies.devDependencies, module.config.dependencies.devDependencies)
      }

      // Merge scripts (last one wins)
      if (module.config.scripts) {
        Object.assign(mergedScripts, module.config.scripts)
      }

      // Collect environment variables
      if (module.config.environmentVariables) {
        environmentVariables.push(...module.config.environmentVariables)
      }

      // Collect Docker services
      if (module.config.dockerServices) {
        dockerServices.push(...module.config.dockerServices)
      }

      // Collect required directories
      if (module.config.requiredDirectories) {
        module.config.requiredDirectories.forEach(dir => requiredDirectories.add(dir))
      }

      // Collect conflicts
      if (module.config.conflicts) {
        conflicts.push(...module.config.conflicts)
      }
    }

    return {
      modules,
      templates,
      mergedDependencies,
      mergedScripts,
      environmentVariables,
      dockerServices,
      requiredDirectories,
      conflicts
    }
  }

  /**
   * Extract conditional logic from template content
   */
  private extractCondition(content: string): string | undefined {
    const conditionMatch = content.match(/^{{!-- condition: (.+?) --}}/)
    return conditionMatch ? conditionMatch[1] : undefined
  }

  /**
   * Evaluate a JavaScript condition string with the given context
   */
  private evaluateCondition(condition: string, context: TemplateContext): boolean {
    try {
      // Create a safe evaluation function
      const func = new Function('context', `
        with (context) {
          return ${condition};
        }
      `)
      return Boolean(func(context))
    } catch (error) {
      console.warn(`Failed to evaluate condition "${condition}":`, error)
      return false
    }
  }

  /**
   * Helper methods
   */
  private async directoryExists(dirPath: string): Promise<boolean> {
    try {
      const stat = await fs.stat(dirPath)
      return stat.isDirectory()
    } catch {
      return false
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      const stat = await fs.stat(filePath)
      return stat.isFile()
    } catch {
      return false
    }
  }

  private async isDirectory(path: string): Promise<boolean> {
    try {
      const stat = await fs.stat(path)
      return stat.isDirectory()
    } catch {
      return false
    }
  }
}