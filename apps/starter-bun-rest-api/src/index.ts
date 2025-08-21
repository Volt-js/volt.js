import { serve } from "bun";
import { AppRouter } from "./volt.router"

const VOLT_API_BASE_PATH = process.env.VOLT_API_BASE_PATH || '/api/v1/'; // Define the base path for the API

const server = serve({
  routes: {
    // Serve Volt.js Router
    [VOLT_API_BASE_PATH + "*"]: AppRouter.handler,
  },
});

console.log(`🚀 Server running at ${server.url}`);
