import { defineConfig } from 'tsup'
import fs from 'fs'
import path from 'path'

async function copyDir(src: string, dest: string) {
  await fs.promises.mkdir(dest, { recursive: true })
  const entries = await fs.promises.readdir(src, { withFileTypes: true })
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath)
    } else {
      await fs.promises.copyFile(srcPath, destPath)
    }
  }
}

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  target: 'node18',
  outDir: 'dist',
  platform: 'node',
  onSuccess: async () => {
    // Copy template files to dist directory
    const srcTemplates = path.join('src', 'adapters', 'setup', 'templates')
    const destTemplates = path.join('dist', 'adapters', 'setup', 'templates')
    
    if (fs.existsSync(srcTemplates)) {
      await copyDir(srcTemplates, destTemplates)
      console.log('✅ Template files copied to dist directory')
    }
  }
}) 