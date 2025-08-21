# @volt-js/core

[![NPM Version](https://img.shields.io/npm/v/@volt-js/core.svg)](https://www.npmjs.com/package/@volt-js/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/github/actions/workflow/status/andeerc/volt-js/main.yml?branch=main)](https://github.com/andeerc/volt-js/actions)

The core package for the Volt.js framework. It contains the essential building blocks for creating type-safe, modern TypeScript applications.

## Role in the Ecosystem

This package is the heart of the Volt.js framework. It provides all the fundamental tools you need to build a robust and scalable API, including:

-   **The Volt Builder:** A fluent API for composing your application's features.
-   **Action Factories:** `volt.query()` and `volt.mutation()` to define your API endpoints.
-   **Controller Factory:** `volt.controller()` to group related actions.
-   **Procedure Factory:** `volt.procedure()` for creating reusable, type-safe middleware.
-   **The Router:** `volt.router()` to assemble all your controllers into a single, executable API handler.
-   **Core Interfaces:** All the essential TypeScript types and interfaces that power the framework's end-to-end type safety.

## Installation

You can install the core package using your favorite package manager:

```bash
# npm
npm install @volt-js/core

# yarn
yarn add @volt-js/core

# pnpm
pnpm add @volt-js/core

# bun
bun add @volt-js/core
```

While `@volt-js/core` has no required production dependencies, you will likely install `zod` for schema validation, as it is tightly integrated with the framework's type system.

```bash
npm install zod
```

## Basic Usage

Here is a minimal example of how to create a complete Volt.js application using only the `core` package.

### 1. Define the Context (`src/volt.context.ts`)

Define the shape of your application's global context. This is where you'll provide dependencies like a database connection.

```typescript
// src/volt.context.ts
export interface AppContext {
  // In a real app, this would be a database client instance.
  db: {
    findUsers: () => Promise<{ id: number; name: string }[]>;
  };
}
```

### 2. Initialize the Volt Builder (`src/volt.ts`)

Create the main `volt` instance, telling it about your `AppContext`.

```typescript
// src/volt.ts
import { Volt } from '@volt-js/core';
import type { AppContext } from './volt.context';

export const volt = Volt.context<AppContext>().create();
```

### 3. Create a Controller (`src/features/user/user.controller.ts`)

Define your API endpoints using `volt.controller()` and `volt.query()`.

```typescript
// src/features/user/user.controller.ts
import { volt } from '@/volt';

export const userController = volt.controller({
  path: '/users',
  actions: {
    list: volt.query({
      path: '/',
      handler: async ({ context, response }) => {
        const users = await context.db.findUsers();
        return response.success({ users });
      },
    }),
  },
});
```

### 4. Assemble the Router (`src/volt.router.ts`)

Register your controller with the main application router.

```typescript
// src/volt.router.ts
import { volt } from '@/volt';
import { userController } from '@/features/user/user.controller';

export const AppRouter = volt.router({
  controllers: {
    users: userController,
  },
});
```

### 5. Create an HTTP Server

Finally, use the `AppRouter.handler` to serve HTTP requests. The handler is framework-agnostic and works with any server that supports the standard `Request` and `Response` objects.

```typescript
// src/server.ts
import { AppRouter } from './volt.router';
import { createServer } from 'http';

// A simple example with Node.js http server
// In a real app, you would use a framework adapter (e.g., Next.js, Hono)
createServer(async (req, res) => {
  const request = new Request(`http://${req.headers.host}${req.url}`, {
    method: req.method,
    headers: req.headers,
    // body handling would be more complex
  });

  const response = await AppRouter.handler(request);

  res.statusCode = response.status;
  for (const [key, value] of response.headers.entries()) {
    res.setHeader(key, value);
  }
  res.end(await response.text());
}).listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

For more detailed guides and advanced concepts, please refer to the **[Official Volt.js Wiki](https://voltjs.com/docs)**.

## Contributing

Contributions are welcome! Please see the main [CONTRIBUTING.md](/CONTRIBUTING.md) file for details on how to get started.

## License

This package is licensed under the [MIT License](/LICENSE).
