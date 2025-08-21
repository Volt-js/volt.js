import { execa } from 'execa'
import type { TemplateFile } from './types'

/**
 * ShadCN component installer for Volt.js projects
 */
export class ShadCNInstaller {
  private projectDir: string
  
  constructor(projectDir: string) {
    this.projectDir = projectDir
  }

  /**
   * Install ShadCN components using the native CLI
   */
  async installComponentsViaCLI(): Promise<void> {
    const components = [
      'button',
      'card', 
      'input',
      'label',
      'separator',
      'skeleton',
      'badge',
      'alert',
      'avatar',
      'checkbox',
      'dialog',
      'dropdown-menu',
      'form',
      'navigation-menu',
      'popover',
      'progress',
      'radio-group',
      'select',
      'slider',
      'switch',
      'table',
      'tabs',
      'textarea',
      'toast',
      'tooltip'
    ]

    try {
      // Install all components at once
      await execa('npx', [
        'shadcn@latest', 
        'add', 
        '--yes',
        ...components
      ], {
        cwd: this.projectDir,
        stdio: 'pipe'
      })
    } catch (error) {
      console.warn('Failed to install ShadCN components via CLI:', error)
      // Fall back to manual installation if CLI fails
      throw error
    }
  }

  /**
   * Get lib/utils.ts for ShadCN
   */
  async getLibUtils(): Promise<TemplateFile> {
    return {
      path: 'src/lib/utils.ts',
      content: `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`
    }
  }

  /**
   * Get components.json configuration
   */
  getComponentsConfig(framework: string): TemplateFile {
    const isNextJS = framework.includes('nextjs')
    
    const config = {
      "$schema": "https://ui.shadcn.com/schema.json",
      "style": "default",
      "rsc": isNextJS,
      "tsx": true,
      "tailwind": {
        "config": "tailwind.config.js",
        "css": isNextJS ? "src/app/globals.css" : "src/index.css",
        "baseColor": "slate",
        "cssVariables": true
      },
      "aliases": {
        "components": "@/components",
        "utils": "@/lib/utils"
      }
    }

    return {
      path: 'components.json',
      content: JSON.stringify(config, null, 2)
    }
  }

  /**
   * Install all ShadCN files (components + config + utils)
   */
  async installAll(framework: string): Promise<TemplateFile[]> {
    const files: TemplateFile[] = []
    
    // Add lib/utils.ts
    const utilsFile = await this.getLibUtils()
    files.push(utilsFile)
    
    // Add components.json
    const configFile = this.getComponentsConfig(framework)
    files.push(configFile)
    
    return files
  }

  /**
   * Install ShadCN components after project is generated
   */
  async installComponentsPostGeneration(): Promise<void> {
    try {
      await this.installComponentsViaCLI()
    } catch (error) {
      console.warn('ShadCN component installation failed, but project generation continues')
    }
  }
}

/**
 * Create and install ShadCN components for a project
 */
export async function installShadCNComponents(framework: string, projectDir: string): Promise<{ templates: TemplateFile[], installer: ShadCNInstaller }> {
  const installer = new ShadCNInstaller(projectDir)
  const templates = await installer.installAll(framework)
  
  return { templates, installer }
}