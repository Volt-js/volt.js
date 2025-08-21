// Test the main exports
async function testExports() {
  console.log('🧪 Testing Main Exports...\n')

  try {
    console.log('1. Loading main module...')
    const main = require('./dist/index.js')
    console.log('✅ Main module loaded')
    
    console.log('\n2. Checking available exports:')
    console.log('Available exports:', Object.keys(main))
    
    console.log('\n3. Testing ModularTemplateGenerator...')
    if (main.ModularTemplateGenerator) {
      const { ModularTemplateGenerator } = main
      console.log('✅ ModularTemplateGenerator found in exports')
      
      // Try to create instance
      const generator = new ModularTemplateGenerator()
      console.log('✅ Generator instance created')
      
      // Try to get available templates (this might fail due to missing template directory)
      try {
        const registry = await generator.getAvailableTemplates()
        console.log('✅ Registry loaded:', Object.keys(registry))
      } catch (error) {
        console.log('⚠️  Registry load failed (expected):', error.message)
      }
      
    } else {
      console.log('❌ ModularTemplateGenerator not found in exports')
    }
    
    console.log('\n🎉 Export test completed!')
    
  } catch (error) {
    console.error('❌ Export test failed:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

testExports()