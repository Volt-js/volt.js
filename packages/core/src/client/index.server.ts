// Server-specific barrel file
// React-specific exports (work in server environment)
export { VoltProvider, useVoltQueryClient } from "./volt.context";
export { useRealtime } from "./volt.hooks";

// Server-specific createVoltClient (uses router.$caller directly)
export { createVoltClient } from './volt.client.server';
