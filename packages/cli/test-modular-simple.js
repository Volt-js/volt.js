const { ModularTemplateGenerator } = require('./dist/index.js')

async function testModular() {
  console.log('🧪 Testing Modular Template System...\n')

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
    // Test if we can create the generator
    console.log('1. Creating ModularTemplateGenerator...')
    const generator = new ModularTemplateGenerator()
    console.log('✅ Generator created successfully')

    // Test preview generation
    console.log('\n2. Testing preview generation...')
    const preview = await generator.generatePreview(testConfig)
    
    console.log(`📁 Found ${preview.files.length} files to generate:`)
    preview.files.slice(0, 5).forEach(file => console.log(`  - ${file}`))
    if (preview.files.length > 5) {
      console.log(`  ... and ${preview.files.length - 5} more`)
    }
    
    console.log(`\n📦 Dependencies: ${Object.keys(preview.dependencies).length}`)
    console.log(`📦 Dev Dependencies: ${Object.keys(preview.devDependencies).length}`)
    console.log(`🌍 Environment Variables: ${preview.environmentVariables.length}`)
    console.log(`🐳 Docker Services: ${preview.dockerServices.length}`)

    console.log('\n🎉 Basic modular system test passed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

testModular()