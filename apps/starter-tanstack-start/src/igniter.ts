import { Volt } from '@volt-js/core'
import { createVoltAppContext } from "./volt.context"
import { store } from "@/services/store"
import { REGISTERED_JOBS } from "@/services/jobs"
import { logger } from "@/services/logger"
import { telemetry } from "@/services/telemetry"

import openapi from './docs/openapi.json'

/**
 * @description Initialize the Volt.js
 * @see https://github.com/andeerc/volt-js
 */
export const volt = Volt
  .context(createVoltAppContext())
  .store(store)
  .jobs(REGISTERED_JOBS)
  .logger(logger)
  .telemetry(telemetry)
  .config({
    baseURL: process.env.REACT_APP_VOLT_API_URL || 'http://localhost:3000',
    basePATH: process.env.REACT_APP_VOLT_API_BASE_PATH || '/api/v1',
  })
  .docs({
    openapi,
    info: {
      title: 'Volt.js Starter (Tanstack Start)',
      version: '1.0.0',
      description: 'A sample Tanstack Start App built with Volt.js',
    }
  })
  .create()
