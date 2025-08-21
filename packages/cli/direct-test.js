// Direct test without going through the CLI exports
const path = require('path')

async function testDirect() {
  console.log('🧪 Testing Modular Template System (Direct)...\n')

  // Import the modular generator directly
  const { ModularTemplateGenerator } = require('./dist/adapters/setup/templates/modular-generator')
  
  const testConfig = {
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
    console.log('1. Creating ModularTemplateGenerator...')
    const templatesDir = path.join(__dirname, 'src/adapters/setup/templates')
    const generator = new ModularTemplateGenerator(templatesDir)
    console.log('✅ Generator created successfully')

    console.log('\n2. Testing preview generation...')
    const preview = await generator.generatePreview(testConfig)
    
    console.log(`📁 Found ${preview.files.length} files to generate`)
    console.log(`📦 Dependencies: ${Object.keys(preview.dependencies).length}`)
    console.log(`📦 Dev Dependencies: ${Object.keys(preview.devDependencies).length}`)
    
    console.log('\n🎉 Direct test passed!')
    
  } catch (error) {
    console.error('❌ Direct test failed:', error.message)
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('\n🔍 Available modules in dist/:')
      const fs = require('fs')
      console.log(fs.readdirSync('./dist', { recursive: true }).filter(f => f.includes('modular')))
    }
    process.exit(1)
  }
}

testDirect()