// Browser-specific barrel file
// React-specific exports (client-side only)
export { VoltProvider, useVoltQueryClient } from "./volt.context";
export { useRealtime } from "./volt.hooks";

// Browser-specific createVoltClient (uses fetch + hooks)
export { createVoltClient } from './volt.client.browser';
