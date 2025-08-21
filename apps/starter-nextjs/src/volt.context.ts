import { database } from "@/services/database"

/**
 * @description Create the context of the Volt.js application
 * @see https://github.com/Volt-js/volt.js
 */
export const createVoltAppContext = () => {
  return {
    database,
  }
}

/**
 * @description The context of the Volt.js application
 * @see https://github.com/Volt-js/volt.js
 */
export type VoltAppContext = Awaited<ReturnType<typeof createVoltAppContext>>
