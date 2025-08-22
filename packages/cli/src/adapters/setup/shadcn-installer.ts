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
    let tailwindConfig = "tailwind.config.ts"
    
    if (isNextJS) {
      cssPath = "src/app/globals.css"
    } else if (isTanStackStart) {
      cssPath = "src/styles/app.css"
    }

    const config = {
      "$schema": "https://ui.shadcn.com/schema.json",
      "style": "new-york",
      "rsc": isNextJS,
      "tsx": true,
      "tailwind": {
        "config": tailwindConfig,
        "css": cssPath,
        "baseColor": "zinc",
        "cssVariables": true,
        "prefix": ""
      },
      "aliases": {
        "components": "@/components",
        "utils": "@/lib/utils",
        "ui": "@/components/ui",
        "lib": "@/lib",
        "hooks": "@/hooks"
      },
      "iconLibrary": "lucide"
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
   * Get all ShadCN UI components
   */
  getAllShadCNComponents(): string[] {
    return [
      'accordion',
      'alert',
      'alert-dialog',
      'aspect-ratio',
      'avatar',
      'badge',
      'breadcrumb',
      'button',
      'calendar',
      'card',
      'carousel',
      'chart',
      'checkbox',
      'collapsible',
      'command',
      'context-menu',
      'dialog',
      'drawer',
      'dropdown-menu',
      'form',
      'hover-card',
      'input',
      'input-otp',
      'label',
      'menubar',
      'navigation-menu',
      'pagination',
      'popover',
      'progress',
      'radio-group',
      'resizable',
      'scroll-area',
      'select',
      'separator',
      'sheet',
      'sidebar',
      'skeleton',
      'slider',
      'sonner',
      'switch',
      'table',
      'tabs',
      'textarea',
      'toggle',
      'toggle-group',
      'tooltip'
    ]
  }

  /**
   * Install all ShadCN components using templates instead of external command
   */
  async installAllComponentsAtOnce(): Promise<void> {
    // This method is now handled by the template system
    // All components are generated from templates in common/components/ui/
    console.log('ShadCN UI components will be generated from templates')
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