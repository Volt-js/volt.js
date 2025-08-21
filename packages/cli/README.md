# @volt.js/cli

[![NPM Version](https://img.shields.io/npm/v/@volt.js/cli.svg)](https://www.npmjs.com/package/@volt.js/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The official Command-Line Interface (CLI) for the Volt.js framework. This tool is designed to enhance developer productivity by automating common tasks like project scaffolding and running the development server.

## Role in the Ecosystem

The `@volt.js/cli` package is a key part of the Volt.js developer experience. It provides a set of simple commands that handle complex setup and execution processes, allowing you to focus on writing code instead of configuring boilerplate.

## Usage

The recommended way to use the CLI is via `npx`, which ensures you are always using the latest version without needing a global installation.

```bash
npx @volt.js/cli <command>
```

## Commands

The CLI provides two main commands to manage your project's lifecycle.

### `volt init`

The `init` command scaffolds a new, production-ready Volt.js project from scratch. It runs an interactive setup wizard that configures your project structure, dependencies, and optional features like the Store and Queues.

**Example:**
```bash
# Create a new project in a directory named 'my-api'
npx @volt.js/cli init my-api
```

For more details, see the **[volt init documentation](https://voltjs.com/docs/cli-and-tooling/volt-init)**.

### `volt dev`

The `dev` command starts the Volt.js development server. It watches your files for changes and provides hot-reloading. Its most powerful feature is the interactive mode.

**Example:**
```bash
# Start the development server in interactive mode
volt dev --interactive

# Start the server and manage the Next.js dev server alongside it
volt dev --interactive --framework nextjs
```

For more details, see the **[volt dev documentation](https://voltjs.com/docs/cli-and-tooling/volt-dev)**.

## Contributing

Contributions are welcome! Please see the main [CONTRIBUTING.md](/CONTRIBUTING.md) file for details on how to get started.

## License

This package is licensed under the [MIT License](/LICENSE).