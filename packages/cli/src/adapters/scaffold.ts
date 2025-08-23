import * as fs from 'fs/promises'
import * as path from 'path'
import chalk from 'chalk'
import { createChildLogger } from './logger'
import { PrismaProvider } from './scaffold/providers/prisma'
import { SchemaProvider, ModelSchema } from './scaffold/providers/base'

const logger = createChildLogger({ component: 'scaffold' })

// --- Helper Functions ---

function toPascalCase(str: string): string {
  return str.replace(/(^\w|-\w)/g, g => g.replace(/-/, '').toUpperCase())
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

async function writeFile(filePath: string, content: string): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, content, 'utf-8');
}

// --- Router Registration Functions ---

async function findRouterFile(): Promise<string | null> {
  const possiblePaths = [
    'src/volt.router.ts',
    'src/volt.router.js',
    'src/router.ts',
    'src/router.js',
    'volt.router.ts',
    'volt.router.js'
  ];

  for (const routerPath of possiblePaths) {
    try {
      await fs.access(routerPath);
      return routerPath;
    } catch {
      // File doesn't exist, continue searching
    }
  }
  return null;
}

async function registerControllerInRouter(featureName: string, controllerName: string): Promise<void> {
  const spinner = logger.spinner(`Registering controller in router...`)
  spinner.start()

  try {
    const routerPath = await findRouterFile();
    if (!routerPath) {
      spinner.warn('No volt.router.ts file found. Please manually register your controller.');
      return;
    }

    const routerContent = await fs.readFile(routerPath, 'utf-8');
    
    // Generate import statement
    const importStatement = `import { ${controllerName} } from '@/features/${featureName}'`;
    
    // Check if import already exists
    if (routerContent.includes(importStatement)) {
      spinner.info(`Controller '${controllerName}' is already imported in router`);
      return;
    }

    // Find the last import statement and add our import after it
    const lines = routerContent.split('\n');
    let lastImportIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        lastImportIndex = i;
      }
    }

    if (lastImportIndex === -1) {
      throw new Error('Could not find import statements in router file');
    }

    // Insert the new import
    lines.splice(lastImportIndex + 1, 0, importStatement);

    // Find the controllers object and add our controller
    let controllersStart = -1;
    let controllersEnd = -1;
    let braceCount = 0;
    let foundControllers = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.includes('controllers: {') || line.startsWith('controllers: {')) {
        controllersStart = i;
        foundControllers = true;
        braceCount = 1;
        continue;
      }
      
      if (foundControllers) {
        // Count opening and closing braces to find the end of controllers object
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;
        
        if (braceCount === 0) {
          controllersEnd = i;
          break;
        }
      }
    }

    if (controllersStart === -1 || controllersEnd === -1) {
      throw new Error('Could not find controllers object in router file');
    }

    // Check if controller is already registered
    const controllersSection = lines.slice(controllersStart, controllersEnd + 1).join('\n');
    const controllerKey = toCamelCase(featureName);
    
    if (controllersSection.includes(`${controllerKey}:`)) {
      spinner.info(`Controller '${controllerKey}' is already registered in router`);
      return;
    }

    // Add the controller registration before the closing brace
    const controllerRegistration = `    ${controllerKey}: ${controllerName},`;
    lines.splice(controllersEnd, 0, controllerRegistration);

    // Write the updated content back to the file
    const updatedContent = lines.join('\n');
    await fs.writeFile(routerPath, updatedContent, 'utf-8');

    spinner.success(`Successfully registered '${controllerName}' in router`);
    logger.info(`Added controller registration: ${controllerKey}: ${controllerName}`);

  } catch (error) {
    spinner.error(`Failed to register controller in router`);
    logger.error('Router registration failed:', error);
    console.log(chalk.yellow(`\n⚠️  Please manually add the following to your router:`));
    console.log(chalk.cyan(`   import { ${controllerName} } from '@/features/${featureName}'`));
    console.log(chalk.cyan(`   ${toCamelCase(featureName)}: ${controllerName},`));
  }
}


// --- Schema Provider Factory ---

function getSchemaProvider(providerName: string): SchemaProvider {
  if (providerName.toLowerCase() === 'prisma') {
    return new PrismaProvider();
  }
  // Future providers like Drizzle would be added here
  // else if (providerName.toLowerCase() === 'drizzle') {
  //   return new DrizzleProvider();
  // }
  throw new Error(`Unsupported schema provider: ${providerName}`);
}

// --- CRUD Template Generators ---

function generateCrudInterfacesTemplate(model: ModelSchema, featureName?: string): string {
  const modelNamePascal = toPascalCase(model.name);

  const zodFields = model.fields
    .filter(field => !field.isRelation) // Exclude relation fields
    .map(field => {
      let zodType: string;
      switch (field.type) {
        case 'string':
        case 'bigint':
          zodType = 'z.string()';
          break;
        case 'number':
          zodType = 'z.number()';
          break;
        case 'boolean':
          zodType = 'z.boolean()';
          break;
        case 'Date':
          zodType = 'z.date()';
          break;
        default:
          zodType = `z.any() // Type '${field.type}' not directly supported`;
      }
      if (!field.isRequired) {
        // For Prisma, optional fields are nullable
        zodType += '.nullable()';
      }
      return `  ${field.name}: ${zodType},`;
    }).join('\n');

  const createInputOmissions = model.fields
    .filter(f => f.isId || f.isAutoGenerated)
    .map(f => `  ${f.name}: true,`)
    .join('\n');

  return `import { z } from 'zod';

// Generated from your '${model.name}' Prisma model
export const ${modelNamePascal}Schema = z.object({
${zodFields}
});

// Schema for creating a new ${model.name}.
// Fields managed by the database (id, createdAt, etc.) are omitted.
export const Create${modelNamePascal}InputSchema = ${modelNamePascal}Schema.omit({
${createInputOmissions}
});

// Schema for updating a ${model.name}. All fields are optional.
export const Update${modelNamePascal}InputSchema = Create${modelNamePascal}InputSchema.partial();

// Exporting types for convenience
export type ${modelNamePascal} = z.infer<typeof ${modelNamePascal}Schema>;
export type Create${modelNamePascal}Input = z.infer<typeof Create${modelNamePascal}InputSchema>;
export type Update${modelNamePascal}Input = z.infer<typeof Update${modelNamePascal}InputSchema>;
`;
}


function generateCrudProcedureTemplate(model: ModelSchema, featureName?: string): string {
  const modelNameCamel = toCamelCase(model.name);
  const modelNamePascal = toPascalCase(model.name);
  const idField = model.fields.find(f => f.isId);
  if (!idField) throw new Error(`Model ${model.name} has no ID field.`);

  return `import { volt } from '@/volt';
import type { Create${modelNamePascal}Input, Update${modelNamePascal}Input } from '../${featureName}.interfaces';

export const ${modelNameCamel}Procedure = volt.procedure({
  name: '${modelNameCamel}',
  handler: async (_, { context }) => {
    // This procedure acts as a repository, centralizing database access logic.
    return {
      ${modelNameCamel}Repository: {
        findAll: () => context.database.${modelNameCamel}.findMany(),
        findById: (id: ${idField.type}) => context.database.${modelNameCamel}.findUnique({ where: { id } }),
        create: (data: Create${modelNamePascal}Input) => context.database.${modelNameCamel}.create({ data }),
        update: (id: ${idField.type}, data: Update${modelNamePascal}Input) => context.database.${modelNameCamel}.update({ where: { id }, data }),
        delete: (id: ${idField.type}) => context.database.${modelNameCamel}.delete({ where: { id } }),
      }
    };
  }
});
`;
}

function generateCrudControllerTemplate(model: ModelSchema, featureName?: string): string {
  const modelNameCamel = toCamelCase(model.name);
  const modelNamePascal = toPascalCase(model.name);

  const idField = model.fields.find(f => f.isId);
  if (!idField) throw new Error(`Model ${model.name} has no ID field.`);

  let idZodType = 'z.string()';
  if (idField.type === 'number') idZodType = 'z.coerce.number()';

  return `import { volt } from '@/volt';
import { z } from 'zod';
import { ${modelNameCamel}Procedure } from '../procedures/${featureName}.procedure'
import { Create${modelNamePascal}InputSchema, Update${modelNamePascal}InputSchema } from '../${featureName}.interfaces'

export const ${modelNameCamel}Controller = volt.controller({
  name: '${modelNamePascal}',
  description: 'Endpoints for ${modelNamePascal}s',
  path: '/${modelNameCamel}s', // e.g., /users
  actions: {
    list: volt.query({
      name: 'list',
      description: 'List all ${modelNamePascal}s',
      path: '/',
      use: [${modelNameCamel}Procedure()],
      handler: async ({ context, response }) => {
        const records = await context.${modelNameCamel}Repository.findAll()
        return response.success(records)
      },
    }),

    getById: volt.query({
      name: 'getById',
      description: 'Get a ${modelNamePascal} by ID',
      path: '/:id' as const,
      use: [${modelNameCamel}Procedure()],
      handler: async ({ request, context, response }) => {
        const record = await context.${modelNameCamel}Repository.findById(request.params.id)
        if (!record) {
          return response.notFound('${modelNamePascal} not found')
        }
        return response.success(record)
      },
    }),

    create: volt.mutation({
      name: 'create',
      description: 'Create a new ${modelNamePascal}',
      path: '/',
      method: 'POST',
      body: Create${modelNamePascal}InputSchema,
      use: [${modelNameCamel}Procedure()],
      handler: async ({ request, context, response }) => {
        const newRecord = await context.${modelNameCamel}Repository.create(request.body)
        return response.created(newRecord)
      },
    }),

    update: volt.mutation({
      name: 'update',
      description: 'Update a ${modelNamePascal} by ID',
      path: '/:id' as const,
      method: 'PUT',
      body: Update${modelNamePascal}InputSchema,
      use: [${modelNameCamel}Procedure()],
      handler: async ({ request, context, response }) => {
        const updatedRecord = await context.${modelNameCamel}Repository.update(request.params.id, request.body)
        return response.success(updatedRecord)
      },
    }),

    delete: volt.mutation({
      name: 'delete',
      description: 'Delete a ${modelNamePascal} by ID',
      path: '/:id' as const,
      method: 'DELETE',
      use: [${modelNameCamel}Procedure()],
      handler: async ({ request, context, response }) => {
        await context.${modelNameCamel}Repository.delete(request.params.id)
        return response.noContent()
      },
    }),
  },
})
`
}

function generateCrudIndexTemplate(featureName: string): string {
  const procedureFileName = `${featureName}.procedure`
  const controllerFileName = `${featureName}.controller`
  const interfacesFileName = `${featureName}.interfaces`

  return `export * from './controllers/${controllerFileName}'
export * from './procedures/${procedureFileName}'
export * from './${interfacesFileName}'
`
}


// --- Empty Feature Template Generators ---

function generateEmptyControllerTemplate(featureName: string): string {
  const controllerName = `${featureName.toLowerCase()}Controller`
  return `import { volt } from '@/volt'
import { z } from 'zod'

export const ${controllerName} = volt.controller({
  name: '${featureName}',
  path: '/${featureName}',
  actions: {
    hello: volt.query({
      path: '/hello',
      handler: async ({ response }) => {
        return response.success({ message: 'Hello from ${featureName}!' })
      },
    }),
  },
})
`
}

function generateEmptyInterfacesTemplate(featureName: string): string {
  return `// Zod schemas and TypeScript types for the ${featureName} feature.
`
}

function generateEmptyIndexTemplate(featureName: string): string {
  return `export * from './controllers/${featureName}.controller'
`
}

// --- Main Scaffolding Logic ---

async function scaffoldEmptyFeature(featureName: string, featureDir: string) {
  const spinner = logger.spinner(`Creating empty feature '${featureName}'...`)
  spinner.start()

  try {
    await fs.mkdir(path.join(featureDir, 'controllers'), { recursive: true })
    await fs.mkdir(path.join(featureDir, 'procedures'), { recursive: true })

    await writeFile(
      path.join(featureDir, 'controllers', `${featureName}.controller.ts`),
      generateEmptyControllerTemplate(featureName)
    )
    await writeFile(
      path.join(featureDir, `${featureName}.interfaces.ts`),
      generateEmptyInterfacesTemplate(featureName)
    )
    await writeFile(
      path.join(featureDir, 'index.ts'),
      generateEmptyIndexTemplate(featureName)
    )
    spinner.success(`Scaffolded empty feature '${featureName}'`)

    // Register controller in router
    const controllerName = `${featureName.toLowerCase()}Controller`
    await registerControllerInRouter(featureName, controllerName)
    
  } catch (error) {
    spinner.error(`Failed to create empty feature '${featureName}'`)
    throw error
  }
}


async function scaffoldFeatureFromSchema(featureName: string, schemaString: string, featureDir: string) {
  const spinner = logger.spinner(`Scaffolding feature '${featureName}' from schema...`)
  spinner.start()

  try {
    const [providerName, modelName] = schemaString.split(':')
    if (!providerName || !modelName) {
      throw new Error('Invalid schema format. Expected `provider:ModelName` (e.g., `prisma:User`).')
    }

    const provider = getSchemaProvider(providerName)
    const model = await provider.getModel(modelName)

    if (!model) {
      throw new Error(`Model '${modelName}' not found using provider '${providerName}'.`)
    }

    spinner.update('Generating files from model schema...')

    await fs.mkdir(path.join(featureDir, 'controllers'), { recursive: true })
    await fs.mkdir(path.join(featureDir, 'procedures'), { recursive: true })

    await writeFile(
      path.join(featureDir, `${featureName}.interfaces.ts`),
      generateCrudInterfacesTemplate(model, featureName)
    )
    await writeFile(
      path.join(featureDir, 'procedures', `${featureName}.procedure.ts`),
      generateCrudProcedureTemplate(model, featureName)
    )
    await writeFile(
      path.join(featureDir, 'controllers', `${featureName}.controller.ts`),
      generateCrudControllerTemplate(model, featureName)
    )
    await writeFile(
      path.join(featureDir, 'index.ts'),
      generateCrudIndexTemplate(featureName)
    )

    spinner.success(`Successfully scaffolded feature '${featureName}' from '${modelName}' model.`)

    // Register controller in router
    const controllerName = `${toCamelCase(featureName)}Controller`
    await registerControllerInRouter(featureName, controllerName)

  } catch (error) {
    spinner.error(`Failed to scaffold feature from schema`)
    throw error
  }
}


export async function handleGenerateFeature(featureName: string, options: { schema?: string }): Promise<void> {
  const normalizedName = featureName.toLowerCase()
  const featureDir = path.join(process.cwd(), 'src', 'features', normalizedName)

  logger.info(`Scaffolding feature: ${chalk.cyan(normalizedName)}`)

  try {
    await fs.access(featureDir)
    logger.error(`Feature '${normalizedName}' already exists.`)
    console.error(chalk.red(`✗ Feature '${normalizedName}' already exists at ${path.relative(process.cwd(), featureDir)}`))
    return
  } catch (error) {
    // Directory does not exist, which is what we want.
  }

  if (options.schema) {
    await scaffoldFeatureFromSchema(normalizedName, options.schema, featureDir)
  } else {
    await scaffoldEmptyFeature(normalizedName, featureDir)
  }
}

// Stub for future commands
export async function handleGenerateController(name: string, feature: string): Promise<void> {
  logger.warn(`'generate controller' is not yet fully implemented. Use 'generate feature --schema' instead.`)
}
export async function handleGenerateProcedure(name: string, feature: string): Promise<void> {
  logger.warn(`'generate procedure' is not yet fully implemented. Use 'generate feature --schema' instead.`)
}
