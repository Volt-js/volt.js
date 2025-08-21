import { Volt } from '@volt.js/core'
import { createVoltAppContext } from "./volt.context"
import { logger } from "@/services/logger"
import { telemetry } from "@/services/telemetry"
import { store } from './services/store'

import openapi from './docs/openapi.json'

/**
 * @description Initialize the Volt.js
 * @see https://github.com/andeerc/volt.js
 */
export const volt = Volt
  .context(createVoltAppContext())
  .store(store)
  .logger(logger)
  .telemetry(telemetry)
  .config({
    baseURL: process.env.NEXT_PUBLIC_VOLT_API_URL || 'http://localhost:3000',
    basePATH: process.env.NEXT_PUBLIC_VOLT_API_BASE_PATH || '/api/v1',
  })
  .docs({
    openapi,
    info: {
      title: 'Sample Realtime Chat',
      version: '1.0.0',
      description: 'A sample realtime chat application built with Volt.js',
      contact: {
        name: 'Volt.js',
        email: 'team@voltjs.com',
        url: 'https://github.com/andeerc/volt.js'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    }
  })
  .create()
