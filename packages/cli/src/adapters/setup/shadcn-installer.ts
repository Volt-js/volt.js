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
    const isTanStackStart = framework.includes('tanstack-start')

    let cssPath = "src/index.css"
    if (isNextJS) {
      cssPath = "src/app/globals.css"
    } else if (isTanStackStart) {
      cssPath = "src/styles/app.css"
    }

    const config = {
      "$schema": "https://ui.shadcn.com/schema.json",
      "style": "default",
      "rsc": isNextJS,
      "tsx": true,
      "tailwind": {
        "config": "tailwind.config.js",
        "css": cssPath,
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
   * Install all ShadCN components using add -a flag
   */
  async installAllComponentsAtOnce(): Promise<void> {
    try {
      await execa('npx', [
        'shadcn-ui@latest',
        'add',
        'button',
        'card',
        'input',
        'label',
        'textarea',
        '--yes'  // Skip confirmation prompts
      ], {
        cwd: this.projectDir,
        stdio: 'inherit', // Show progress to user
        timeout: 120000 // 2 minute timeout for all components
      })
    } catch (error) {
      if (error.timedOut) {
        throw new Error('ShadCN installation timed out after 2 minutes. You can install components manually later.')
      }
      console.warn('Failed to install ShadCN components:', error)
      throw error
    }
  }

  /**
   * Install ShadCN components after project is generated
   */
  async installComponentsPostGeneration(): Promise<void> {
    try {
      await this.installAllComponentsAtOnce()
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