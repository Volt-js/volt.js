// Import directly from src since it's bundled in the dist
const { generateAllTemplates } = require('./src/adapters/setup/templates.ts');
const { installShadCNComponents } = require('./src/adapters/setup/shadcn-installer.ts');
const fs = require('fs');

async function testShadCNGeneration() {
  console.log('Testing ShadCN component generation...');
  
  const config = {
    projectName: 'test-app',
    framework: 'starter-nextjs',
    features: {
      store: false,
      jobs: false,
      mcp: false,
      logging: true,
      telemetry: false
    },
    database: { provider: 'none' },
    orm: 'prisma',
    styling: 'tailwind',
    ui: { shadcn: true },
    packageManager: 'npm',
    initGit: false,
    installDependencies: false,
    dockerCompose: false
  };

  try {
    const templates = await generateAllTemplates(config, false);
    
    console.log(`Generated ${templates.length} files`);
    
    // Check if ShadCN components were generated
    const shadcnComponents = templates.filter(t => t.path.includes('src/components/ui/'));
    console.log(`Found ${shadcnComponents.length} ShadCN components:`);
    shadcnComponents.forEach(c => console.log(`  - ${c.path}`));
    
    // Check if Providers component was generated
    const providersComponent = templates.find(t => t.path === 'src/components/providers.tsx');
    if (providersComponent) {
      console.log('✓ Providers component generated');
      console.log('Preview of Providers component:');
      console.log(providersComponent.content.substring(0, 300) + '...');
    } else {
      console.log('✗ Providers component not found');
    }
    
    // Check if layout includes Providers
    const layout = templates.find(t => t.path === 'src/app/layout.tsx');
    if (layout && layout.content.includes('<Providers>')) {
      console.log('✓ Layout includes Providers wrapper');
    } else {
      console.log('✗ Layout does not include Providers wrapper');
    }
    
    // Check if @volt.js/core dependency is included
    const packageJson = templates.find(t => t.path === 'package.json');
    if (packageJson) {
      const pkg = JSON.parse(packageJson.content);
      if (pkg.dependencies['@volt.js/core']) {
        console.log('✓ @volt.js/core dependency included');
      } else {
        console.log('✗ @volt.js/core dependency missing');
      }
    }
    
    console.log('✓ Test completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testShadCNGeneration();