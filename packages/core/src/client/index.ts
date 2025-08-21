// React-specific exports (client-side only)
export { VoltProvider, useVoltQueryClient } from "./volt.context";
export { useRealtime } from "./volt.hooks";

// Re-export createVoltClient - will be environment-aware via imports
export { createVoltClient } from './volt.client.browser';
