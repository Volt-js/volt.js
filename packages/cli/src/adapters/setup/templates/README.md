# Modular Template System

This directory contains the new modular template system for Volt.js CLI. Instead of generating everything dynamically in code, we now use a folder-based approach where each configuration is stored as actual template files.

## Structure

```
templates/
├── core/                    # Core Volt.js files (always included)
│   ├── volt.ts.hbs
│   ├── volt.context.ts.hbs
│   ├── volt.router.ts.hbs
│   └── volt.client.ts.hbs
├── databases/               # Database configurations
│   ├── prisma/
│   │   ├── config.json      # Configuration metadata
│   │   ├── schema.prisma.hbs
│   │   └── services/
│   │       └── database.ts.hbs
│   └── drizzle/
│       ├── config.json
│       ├── drizzle.config.ts.hbs
│       ├── db/
│       │   ├── index.ts.hbs
│       │   └── schema.ts.hbs
│       └── services/
│           └── database.ts.hbs
├── features/               # Feature-specific configurations
│   ├── store/
│   │   ├── config.json
│   │   └── services/
│   │       ├── store.ts.hbs
│   │       └── redis.ts.hbs
│   ├── jobs/
│   │   ├── config.json
│   │   └── services/
│   │       └── jobs.ts.hbs
│   ├── logging/
│   │   ├── config.json
│   │   └── services/
│   │       └── logger.ts.hbs
│   └── mcp/
│       ├── config.json
│       └── api/
│           └── mcp/
│               └── [transport]/
│                   └── route.ts.hbs
├── frameworks/             # Framework-specific configurations
│   ├── nextjs/
│   │   ├── config.json
│   │   ├── next.config.ts.hbs
│   │   ├── app/
│   │   │   ├── layout.tsx.hbs
│   │   │   ├── page.tsx.hbs
│   │   │   └── api/
│   │   │       └── v1/
│   │   │           └── [[...all]]/
│   │   │               └── route.ts.hbs
│   │   └── package-additions.json
│   ├── express/
│   │   ├── config.json
│   │   ├── index.ts.hbs
│   │   └── package-additions.json
│   └── vite/
│       ├── config.json
│       ├── vite.config.ts.hbs
│       ├── index.html.hbs
│       ├── main.tsx.hbs
│       ├── App.tsx.hbs
│       └── package-additions.json
├── styling/                # Styling configurations
│   ├── tailwind/
│   │   ├── config.json
│   │   ├── tailwind.config.js.hbs
│   │   ├── postcss.config.js.hbs
│   │   └── globals.css.hbs
│   └── shadcn/
│       ├── config.json
│       ├── components.json.hbs
│       ├── lib/
│       │   └── utils.ts.hbs
│       └── globals.css.hbs
└── common/                 # Common template files
    ├── package.json.hbs
    ├── tsconfig.json.hbs
    ├── .env.example.hbs
    ├── .gitignore
    ├── README.md.hbs
    └── docker-compose.yml.hbs
```

## Configuration Format

Each module has a `config.json` file that defines:

```json
{
  "name": "Feature Name",
  "description": "Description of what this provides",
  "dependencies": {
    "dependencies": {
      "package-name": "version"
    },
    "devDependencies": {
      "dev-package": "version"
    }
  },
  "scripts": {
    "script-name": "command"
  },
  "environmentVariables": [
    {
      "key": "ENV_VAR",
      "value": "default-value",
      "description": "Description"
    }
  ],
  "dockerServices": [
    {
      "name": "service-name",
      "image": "image:tag",
      "ports": ["3000:3000"],
      "environment": {
        "ENV": "value"
      }
    }
  ],
  "requiredDirectories": [
    "src/services",
    "src/db"
  ],
  "conflicts": ["other-feature"],
  "requires": ["dependency-feature"]
}
```

## Template Processing

Templates use Handlebars syntax for variable interpolation:

```typescript
// In template files
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

## Usage

The CLI will:
1. Load only the selected feature configurations
2. Combine their templates and dependencies
3. Process templates with the user's configuration context
4. Generate the final project structure