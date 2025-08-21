import express from 'express';

import { expressAdapter } from '@volt-js/core/adapters';
import { AppRouter } from './volt.router'

const app = express();

// Define the API base path from environment variable or default to '/api/v1'
const VOLT_API_BASE_PATH = process.env.VOLT_API_BASE_PATH || '/api/v1';
const PORT = process.env.PORT || 3000;

// Serve Volt.js Router
app.use(VOLT_API_BASE_PATH, expressAdapter(AppRouter.handler));

// Start the server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
