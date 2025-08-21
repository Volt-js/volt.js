import { ModularTemplateGenerator } from './modular-generator'
import type { ProjectSetupConfig } from '../types'

/**
 * Test script for the new modular template system
 */
async function testModularSystem() {
  console.log('🧪 Testing Modular Template System...\n')

  // Test configuration with Drizzle + Store + NextJS
  const testConfig: ProjectSetupConfig = {
    projectName: 'test-volt-app',
    framework: 'starter-nextjs',
    features: {
      store: true,
      jobs: false,
      mcp: false,
      logging: true,
      telemetry: false
    },
    database: {
      provider: 'postgresql',
      url: 'postgresql://user:pass@localhost:5432/testdb'
    },
    orm: 'drizzle',
    styling: 'tailwind',
    ui: {
      shadcn: true
    },
    packageManager: 'npm',
    initGit: true,
    installDependencies: false,
    dockerCompose: true
  }

  try {
    const generator = new ModularTemplateGenerator()
    
    console.log('1. Testing preview generation...')
    const preview = await generator.generatePreview(testConfig)
    
    console.log('📁 Files that would be generated:')
    preview.files.forEach(file => console.log(`  - ${file}`))
    
    console.log('\n📦 Dependencies:')
    Object.entries(preview.dependencies).forEach(([name, version]) => {
      console.log(`  - ${name}: ${version}`)
    })
    
    console.log('\n📦 Dev Dependencies:')
    Object.entries(preview.devDependencies).forEach(([name, version]) => {
      console.log(`  - ${name}: ${version}`)
    })
    
    console.log('\n🌍 Environment Variables:')
    preview.environmentVariables.forEach(env => {
      console.log(`  - ${env.key}=${env.value} ${env.description ? `(${env.description})` : ''}`)
    })
    
    console.log('\n🐳 Docker Services:')
    preview.dockerServices.forEach(service => {
      console.log(`  - ${service.name}: ${service.image}`)
    })

    console.log('\n2. Testing actual template generation...')
    const templates = await generator.generateAllTemplates(testConfig, false)
    
    console.log(`\n✅ Successfully generated ${templates.length} template files!`)
    console.log('\nGenerated files:')
    templates.forEach(template => {
      console.log(`  📄 ${template.path} (${template.content.length} chars)`)
    })

    // Test with Prisma instead
    console.log('\n3. Testing with Prisma ORM...')
    const prismaConfig = {
      ...testConfig,
      orm: 'prisma' as const,
      features: {
        ...testConfig.features,
        jobs: true,
        mcp: true
      }
    }

    const prismaPreview = await generator.generatePreview(prismaConfig)
    console.log(`📁 Prisma setup would generate ${prismaPreview.files.length} files`)
    
    console.log('\n🎉 All tests passed! Modular system is working correctly.')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run the test
if (require.main === module) {
  testModularSystem()
}

export { testModularSystem }