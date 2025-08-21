import { Volt } from '@volt.js/core'
import { createVoltAppContext } from "./volt.context"
import { store } from "@/services/store"
import { REGISTERED_JOBS } from "@/services/jobs"
import { logger } from "@/services/logger"
import { telemetry } from "@/services/telemetry"

/**
 * @description Initialize the Volt.js
 * @see https://github.com/Volt-js/volt.js
 */
export const volt = Volt
  .context(createVoltAppContext())
  .store(store)
  .jobs(REGISTERED_JOBS)
  .logger(logger)
  .telemetry(telemetry)
  .config({
    baseURL: process.env.VOLT_API_URL || 'http://localhost:3000',
    basePATH: process.env.VOLT_API_BASE_PATH || '/api/v1',
  })
  .docs({
    openapi: require('./docs/openapi.json'),
    info: {
      title: 'Volt.js Starter (Deno REST API)',
      version: '1.0.0',
      description: 'A sample Deno REST API built with Volt.js',
    }
  })
  .create()
