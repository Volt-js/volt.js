/**
 * Configuration types for the modular template system
 */

export interface ModuleConfig {
  name: string
  description: string
  dependencies?: {
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
  }
  scripts?: Record<string, string>
  environmentVariables?: EnvVariable[]
  dockerServices?: DockerService[]
  requiredDirectories?: string[]
  conflicts?: string[]
  requires?: string[]
  conditions?: ModuleCondition[]
}

export interface EnvVariable {
  key: string
  value: string
  description?: string
  required?: boolean
}

export interface DockerService {
  name: string
  image: string
  ports?: string[]
  environment?: Record<string, string>
  volumes?: string[]
  dependsOn?: string[]
}

export interface ModuleCondition {
  when: string  // JavaScript expression to evaluate
  then: Partial<ModuleConfig>  // Config changes to apply
}

export interface TemplateContext {
  projectName: string
  framework: string
  features: Record<string, boolean>
  database: {
    provider: string
    url?: string
  }
  orm?: string
  styling?: string
  ui: {
    shadcn: boolean
  }
  packageManager: string
  [key: string]: any  // Allow additional context
}

export interface ModuleTemplate {
  path: string
  content: string
  condition?: string  // JavaScript expression - only include if true
}

export interface LoadedModule {
  id: string
  config: ModuleConfig
  templates: ModuleTemplate[]
  basePath: string
}

export interface ModuleRegistry {
  core: LoadedModule[]
  databases: Record<string, LoadedModule[]>
  features: Record<string, LoadedModule>
  frameworks: Record<string, LoadedModule>
  styling: Record<string, LoadedModule>
  common: LoadedModule[]
}

export interface GenerationPlan {
  modules: LoadedModule[]
  templates: ModuleTemplate[]
  mergedDependencies: {
    dependencies: Record<string, string>
    devDependencies: Record<string, string>
  }
  mergedScripts: Record<string, string>
  environmentVariables: EnvVariable[]
  dockerServices: DockerService[]
  requiredDirectories: Set<string>
  conflicts: string[]
}