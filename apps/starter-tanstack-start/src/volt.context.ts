/**
 * @description Create the context of the Volt.js application
 * @see https://github.com/Volt-js/volt.js
 */
export const createVoltAppContext = () => {
  // Add application-wide context properties here, like database clients.
  return {};
};

/**
 * @description The context of the Volt.js application.
 * This type is enhanced by Volt's built-in features like logger, store, etc.
 * @see https://github.com/Volt-js/volt.js
 */
export type VoltAppContext = Awaited<
  ReturnType<typeof createVoltAppContext>
>;
