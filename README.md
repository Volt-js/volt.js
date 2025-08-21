<div align="center">
  <h1>🔥 Volt.js</h1>
  <p><strong>The End-to-End Typesafe Full-stack TypeScript Framework</strong></p>
  <p><em>Built for Humans and AI</em></p>

  [![npm version](https://img.shields.io/npm/v/@volt.js/core.svg?style=flat)](https://www.npmjs.com/package/@volt.js/core)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Documentation](https://img.shields.io/badge/docs-voltjs.com-brightgreen.svg)](https://voltjs.com)
</div>

---

## ✨ What is Volt.js?

Volt.js is a modern, full-stack TypeScript framework that eliminates the friction between your backend and frontend. Define your API once, get fully-typed clients everywhere—no code generation, no manual synchronization, just pure end-to-end type safety.

**Perfect for building scalable APIs, real-time applications, and modern web services.**

## 🚀 Quick Start

Get up and running in seconds:

```bash
# Create a new project
npx @volt.js/cli@latest init my-app

# Or add to existing project
npm install @volt.js/core zod
```

## 🎯 Key Features

- **🔒 End-to-End Type Safety** - Define once, use everywhere with full TypeScript inference
- **⚡ Zero Code Generation** - No build steps, no schemas to sync
- **🚀 Performance Optimized** - Parallel context building, smart caching, and optimized request processing
- **🔌 Framework Agnostic** - Works with Next.js, Express, Bun, and more
- **🎛️ Built-in Features** - Queues, Real-time, Caching, and Telemetry
- **🤖 AI-Friendly** - Optimized for code agents and AI assistance
- **📦 Plugin System** - Extensible and modular architecture with dependency resolution

## 📖 Documentation & Resources

- **📚 [Official Documentation](https://voltjs.com/docs)** - Complete guides and API reference
- **🎯 [Getting Started](https://voltjs.com/docs/getting-started)** - Your first Volt.js app
- **📝 [Blog](https://voltjs.com/blog)** - Latest updates and tutorials
- **🎨 [Templates](https://voltjs.com/templates)** - Starter templates and examples
- **📋 [Changelog](https://voltjs.com/changelog)** - What's new in each release

## 🛠️ Development

```bash
# Interactive development dashboard
npx @volt.js/cli dev --interactive

# Build your project
npm run build

# Run tests
npm test
```

## 🌟 Example

```typescript
// Define your API
export const userController = volt.controller({
  path: '/users',
  actions: {
    list: volt.query({
      handler: async ({ context }) => {
        return await context.database.user.findMany();
      }
    }),
    create: volt.mutation({
      input: z.object({ name: z.string(), email: z.string().email() }),
      handler: async ({ input, context }) => {
        return await context.database.user.create({ data: input });
      }
    })
  }
});

// Use in your React app with full type safety
const { data: users } = useQuery(client.users.list);
const createUser = useMutation(client.users.create);
```

## ⚡ Performance Features

Volt.js 0.3.0 introduces significant performance optimizations:

### 🚀 Parallel Context Building
- Context creation and request body parsing execute in parallel
- **2-3x faster** request processing for complex applications
- Automatic optimization with zero configuration changes

### 🔄 Smart Plugin Dependency Resolution
- Intelligent plugin loading order based on dependency graph
- Plugins execute in optimized batches with parallel processing
- Built-in fallbacks ensure reliability even when plugins fail

### ⏱️ Configurable Timeouts & Fallbacks
- Context creation: 5s timeout with fallback
- Body parsing: 10s timeout with graceful degradation
- Plugin operations: 3s timeout per batch
- Individual plugin proxies: 1s timeout with retry logic

### 📊 Performance Benchmarks
```typescript
// Before: Sequential processing
// Context: 50ms + Body: 30ms + Plugins: 40ms = 120ms total

// After: Parallel processing  
// Context + Body: max(50ms, 30ms) + Plugins: 40ms = 90ms total
// 🎯 25% improvement in typical scenarios
```

## 🤝 Community & Support

- **🐛 [Issues](https://github.com/andeerc/volt.js/issues)** - Report bugs and request features
- **💬 [Discussions](https://github.com/andeerc/volt.js/discussions)** - Ask questions and share ideas
- **🤝 [Contributing](https://github.com/andeerc/volt.js/blob/main/CONTRIBUTING.md)** - Help make Volt.js better

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Made with ❤️ by the Volt.js team</p>
  <p><a href="https://voltjs.com">voltjs.com</a> • <a href="https://github.com/andeerc/volt.js">GitHub</a> • <a href="https://www.npmjs.com/package/@volt.js/core">npm</a></p>
</div>