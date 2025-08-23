# @volt.js/cli

## 1.0.1

### Patch Changes

- feat: jobs with SSE revalidate integration and version sync
  - Enhanced job context factory with revalidate capabilities for SSE updates
  - Improved CLI router registration for automatic controller setup
  - Fixed TypeScript typings for job handlers and contexts
  - Added comprehensive job-to-SSE integration examples in test-react app
  - Synchronized package versions across the monorepo for consistent releases

- Updated dependencies
  - @volt.js/core@0.3.6

## 0.1.0

### Minor Changes

- feat: Enhanced CLI with ShadCN support and React 19 compatibility
  - Added native ShadCN component installation via CLI
  - Implemented dynamic project generation system
  - Fixed VoltProvider integration in layouts
  - Updated React dependencies to v19
  - Fixed database context generation (removed comments)
  - Improved framework prompt behavior
  - Fixed lucide-react version compatibility

  This update significantly improves the CLI user experience by providing proper ShadCN support, fixing dependency conflicts, and ensuring generated projects work out of the box with React 19.

### Patch Changes

- Updated dependencies
  - @volt.js/core@0.3.4
