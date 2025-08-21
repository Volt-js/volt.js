# Volt.js CLI - Modular Template System

## Overview

The Volt.js CLI has been restructured to use a modular, configuration-specific template system instead of generating everything dynamically in code. This new approach provides better maintainability, extensibility, and allows users to understand exactly what will be generated.

## Key Benefits

### 🔧 **Modular Architecture**
- Each feature, database, framework, and styling option has its own dedicated folder with configuration files
- Only load and process the specific configurations that the user selects
- Easy to add new features without modifying core generation logic

### 📁 **Folder-Based Configs**
- Template files are stored as actual files (using Handlebars syntax) instead of being generated in TypeScript code
- Configuration metadata in JSON files defines dependencies, environment variables, and requirements
- Clear separation between template content and generation logic

### 🎯 **Conditional Loading**
- Templates are only loaded when their corresponding feature is selected
- Reduces memory usage and generation time
- Prevents conflicts between incompatible configurations

### 🔄 **Easy Extensibility**
- Adding a new feature requires only creating a new folder with config and templates
- No need to modify existing generation code
- Community contributions become much easier

## Architecture

```
packages/cli/src/adapters/setup/templates/
├── core/                    # Core Volt.js files (always included)
├── databases/               # Database configurations (Prisma, Drizzle)
├── features/               # Feature-specific configs (store, jobs, logging, etc.)
├── frameworks/             # Framework-specific configs (NextJS, Express, etc.)
├── styling/                # Styling configurations (Tailwind, ShadCN, etc.)
├── common/                 # Common files (package.json, .gitignore, etc.)
├── loader.ts               # Template loading and processing logic
├── modular-generator.ts    # New generator using modular system
└── types.ts                # Type definitions for modular system
```

## How It Works

### 1. Configuration Structure

Each module has a `config.json` file that defines:

```json
{
  "name": "Feature Name",
  "description": "What this provides",
  "dependencies": {
    "dependencies": { "pkg": "version" },
    "devDependencies": { "dev-pkg": "version" }
  },
  "scripts": { "script-name": "command" },
  "environmentVariables": [
    { "key": "ENV_VAR", "value": "default", "description": "..." }
  ],
  "dockerServices": [...],
  "requiredDirectories": ["src/db"],
  "conflicts": ["other-feature"],
  "requires": ["dependency-feature"]
}
```

### 2. Template Processing

Templates use Handlebars syntax for dynamic content:

```typescript
// volt.ts.hbs
{{#if features.store}}
import { store } from '@/services/store'
{{/if}}

export const volt = Volt
  .context(createVoltAppContext)
{{#if features.store}}
  .store(store)
{{/if}}
  .create()
```

### 3. Selective Loading

The system only loads templates for selected features:

```typescript
// If user selects: Drizzle + Store + NextJS
// Only these modules are loaded:
- core/*
- databases/drizzle/*
- features/store/*
- frameworks/nextjs/*
- common/*
```

## Usage Examples

### Using the New System

```typescript
import { generateProjectModular } from './generator'

// Generate project with modular system
await generateProjectModular(config, targetDir, false)
```

### Preview Generation

```typescript
import { generateModularPreview } from './templates'

// See what would be generated without creating files
const preview = await generateModularPreview(config)
console.log('Files:', preview.files)
console.log('Dependencies:', preview.dependencies)
```

### Testing the System

```typescript
import { testModularSystem } from './templates/test-modular'

// Run comprehensive tests
await testModularSystem()
```

## Migration Guide

### For CLI Users

The CLI interface remains the same. Users can opt into the new system by:

1. **Default behavior**: Continue using the existing dynamic system
2. **Opt-in flag**: Use `--modular` flag to use the new system (when implemented)
3. **Gradual rollout**: New system can be tested alongside the existing one

### For Contributors

When adding new features:

#### Old Way (Dynamic)
```typescript
// Add to features.ts
export const VOLT_FEATURES = {
  newFeature: {
    key: 'newFeature',
    dependencies: [...],
    // ...
  }
}

// Add to templates.ts
export function generateNewFeatureService(config) {
  const content = `// Generated TypeScript code...`
  return { path: 'src/services/new-feature.ts', content }
}

// Update generateAllTemplates() to include new feature
```

#### New Way (Modular)
```
1. Create: templates/features/new-feature/config.json
2. Create: templates/features/new-feature/services/new-feature.ts.hbs
3. Done! The system automatically discovers and loads it.
```

## Real Examples

### Drizzle Configuration

**File**: `templates/databases/drizzle/config.json`
```json
{
  "name": "Drizzle ORM",
  "dependencies": {
    "dependencies": { "drizzle-orm": "^0.33.0" },
    "devDependencies": { "drizzle-kit": "^0.24.0" }
  },
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push"
  },
  "conflicts": ["prisma"]
}
```

**Template**: `templates/databases/drizzle/db/schema.ts.hbs`
```typescript
{{#if (eq database.provider 'postgresql')}}
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow()
})
{{else if (eq database.provider 'mysql')}}
// MySQL schema...
{{/if}}
```

### Store Feature

**File**: `templates/features/store/config.json`
```json
{
  "name": "Redis Store",
  "dependencies": {
    "dependencies": {
      "@volt.js/adapter-redis": "latest",
      "ioredis": "^5.6.1"
    }
  },
  "dockerServices": [{
    "name": "redis",
    "image": "redis:7-alpine",
    "ports": ["6379:6379"]
  }]
}
```

## Testing

Run the comprehensive test suite:

```bash
cd packages/cli
npm run test:modular
```

Or test programmatically:

```typescript
import { testModularSystem } from './src/adapters/setup/templates/test-modular'
await testModularSystem()
```

## Future Enhancements

1. **CLI Integration**: Add `--modular` flag to volt init
2. **Template Marketplace**: Allow community-contributed templates
3. **Visual Preview**: Web-based template preview before generation
4. **Hot Reloading**: Watch template changes during development
5. **Template Validation**: Automatic validation of template configurations
6. **Dependency Resolution**: Automatic resolution of feature dependencies

## Performance Improvements

- **Lazy Loading**: Only load templates when needed
- **Caching**: Cache parsed templates and configurations
- **Parallel Processing**: Process multiple templates concurrently
- **Memory Efficiency**: Reduced memory usage vs. dynamic generation

## Backward Compatibility

The modular system runs alongside the existing dynamic system:

- Existing CLI commands continue to work unchanged
- New system can be gradually adopted
- Both systems can coexist during transition period
- No breaking changes for current users

---

This modular approach makes the Volt.js CLI more maintainable, extensible, and user-friendly while providing a clear path for future enhancements.