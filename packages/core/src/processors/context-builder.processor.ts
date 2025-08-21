import { VoltCookie } from "../services/cookie.service";
import { VoltResponseProcessor } from "./response.processor";
import { BodyParserProcessor } from "./body-parser.processor";
import type { RequestProcessorConfig } from "../types/request.processor";
import { VoltLogLevel, type VoltLogger, type VoltRouter } from "../types";
import { VoltConsoleLogger } from "../services/logger.service";
import type { VoltPluginManager } from "../services/plugin.service";
import { resolveLogLevel, createLoggerContext } from "../utils/logger";

/**
 * Configuration for context building timeouts
 */
interface ContextBuilderConfig {
  timeouts: {
    contextCreation: number;
    bodyParsing: number;
    pluginEnhancement: number;
    pluginProxy: number;
  };
}

/**
 * Plugin dependency information
 */
interface PluginDependency {
  name: string;
  dependencies: string[];
  priority: number; // Lower number = higher priority
}

/**
 * Plugin execution order result
 */
interface PluginExecutionPlan {
  batches: string[][]; // Plugins that can run in parallel in each batch
  errors: string[];    // Plugins with circular dependencies or other issues
}

/**
 * Represents the processed request data
 */
export interface ProcessedRequest extends Omit<Request, 'path' | 'method' | 'params' | 'headers' | 'cookies' | 'body' | 'query'> {
  path: string;
  method: string;
  params: Record<string, any>;
  headers: Headers;
  cookies: VoltCookie;
  body: any;
  query: Record<string, string>;
};

/**
 * Represents the complete processed context
 */
export interface ProcessedContext<TContext = any, TPlugins = any> {
  request: ProcessedRequest;
  response: VoltResponseProcessor<TContext, unknown>;
  $context: TContext;
  $plugins: TPlugins;
}

/**
 * Context builder processor for the Volt Framework.
 * Handles the construction and enhancement of request contexts.
 */
export class ContextBuilderProcessor {
  private static _logger: VoltLogger;
  
  /**
   * Default timeout configuration (in milliseconds)
   */
  private static readonly DEFAULT_CONFIG: ContextBuilderConfig = {
    timeouts: {
      contextCreation: 5000,    // 5s for user context creation
      bodyParsing: 10000,       // 10s for request body parsing
      pluginEnhancement: 3000,  // 3s for plugin enhancement
      pluginProxy: 1000,        // 1s per plugin proxy setup
    }
  };

  private static get logger(): VoltLogger {
    if (!this._logger) {
      this._logger = VoltConsoleLogger.create({
        level: resolveLogLevel(),
        context: createLoggerContext('ContextBuilder'),
        showTimestamp: true,
      });
    }
    return this._logger;
  }

  /**
   * Creates a promise that rejects after the specified timeout
   */
  private static withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    operationName: string
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`${operationName} timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      })
    ]);
  }

  /**
   * Creates a dependency-ordered execution plan for plugins
   */
  private static createPluginExecutionPlan(
    plugins: Record<string, any>,
    pluginManager?: VoltPluginManager<any>
  ): PluginExecutionPlan {
    const dependencies: PluginDependency[] = [];
    const errors: string[] = [];

    // Extract plugin dependencies and priorities
    for (const [pluginName, plugin] of Object.entries(plugins)) {
      try {
        const deps = this.extractPluginDependencies(pluginName, plugin, pluginManager);
        dependencies.push(deps);
      } catch (error) {
        this.logger.warn('Failed to extract plugin dependencies', {
          plugin: pluginName,
          error: error instanceof Error ? error.message : String(error)
        });
        errors.push(pluginName);
      }
    }

    // Create execution batches using topological sort
    const batches = this.topologicalSort(dependencies);
    
    return { batches, errors };
  }

  /**
   * Extracts dependency information from a plugin
   */
  private static extractPluginDependencies(
    pluginName: string,
    plugin: any,
    pluginManager?: VoltPluginManager<any>
  ): PluginDependency {
    let dependencies: string[] = [];
    let priority = 100; // Default priority

    // Try to get dependencies from plugin metadata
    if (plugin?.dependencies && Array.isArray(plugin.dependencies)) {
      dependencies = plugin.dependencies;
    }

    // Try to get priority from plugin metadata
    if (typeof plugin?.priority === 'number') {
      priority = plugin.priority;
    }

    // Define built-in dependencies based on plugin type
    switch (pluginName) {
      case 'store':
        priority = 10; // High priority - others may depend on it
        break;
      case 'logger':
        priority = 5; // Highest priority - many plugins log
        break;
      case 'telemetry':
        priority = 90; // Low priority - usually decorative
        break;
      case 'jobs':
        dependencies = ['store']; // Jobs typically need store
        priority = 50;
        break;
    }

    return {
      name: pluginName,
      dependencies,
      priority
    };
  }

  /**
   * Performs topological sort to create execution batches
   */
  private static topologicalSort(dependencies: PluginDependency[]): string[][] {
    const batches: string[][] = [];
    const remaining = new Map(dependencies.map(dep => [dep.name, dep]));
    const resolved = new Set<string>();

    // Sort by priority initially
    let availablePlugins = Array.from(remaining.values())
      .filter(dep => dep.dependencies.every(d => resolved.has(d)))
      .sort((a, b) => a.priority - b.priority);

    while (availablePlugins.length > 0) {
      const currentBatch: string[] = [];

      // Add all plugins that can run in parallel (same priority level)
      const currentPriority = availablePlugins[0].priority;
      const parallelPlugins = availablePlugins.filter(p => p.priority === currentPriority);

      for (const plugin of parallelPlugins) {
        currentBatch.push(plugin.name);
        resolved.add(plugin.name);
        remaining.delete(plugin.name);
      }

      batches.push(currentBatch);

      // Find next available plugins
      availablePlugins = Array.from(remaining.values())
        .filter(dep => dep.dependencies.every(d => resolved.has(d)))
        .sort((a, b) => a.priority - b.priority);

      // Safety check for circular dependencies
      if (availablePlugins.length === 0 && remaining.size > 0) {
        this.logger.error('Circular dependencies detected in plugins', {
          remaining: Array.from(remaining.keys())
        });
        // Add remaining plugins to a final batch to prevent infinite loop
        batches.push(Array.from(remaining.keys()));
        break;
      }
    }

    return batches;
  }

  /**
   * Builds a complete processed context from a request and configuration.
   *
   * @param request - The incoming HTTP request
   * @param config - The router configuration
   * @param routeParams - Parameters extracted from the route
   * @param url - Parsed URL object
   * @returns Promise resolving to the processed context
   */
  static async build<TRouter extends VoltRouter<any, any, any, any, any>>(
    config: RequestProcessorConfig<TRouter>,
    request: Request,
    routeParams: Record<string, any>,
    url: URL
  ): Promise<ProcessedContext> {
    this.logger.debug("Context building started");
    
    // Parallelize context creation and body parsing with timeouts
    const [contextValue, body] = await Promise.all([
      // Base context creation with timeout
      this.withTimeout(
        this.buildBaseContext(config),
        this.DEFAULT_CONFIG.timeouts.contextCreation,
        'Context creation'
      ),
      // Body parsing with timeout
      this.withTimeout(
        this.parseRequestBody(request),
        this.DEFAULT_CONFIG.timeouts.bodyParsing,
        'Body parsing'
      )
    ]);

    // Parse request components (synchronous operations)
    const cookies = new VoltCookie(request.headers);
    const response = new VoltResponseProcessor();

    // Build processed request
    const processedRequest: ProcessedRequest = {
      ...request,
      path: url.pathname,
      method: request.method,
      params: routeParams,
      headers: request.headers,
      cookies: cookies,
      body: body,
      query: Object.fromEntries(url.searchParams),
    };

    // Build final context with proper structure
    const processedContext: ProcessedContext = {
      request: processedRequest,
      response: response,
      $context: contextValue,
      $plugins: config.plugins || {},
    };

    this.logger.debug("Context built", {
      has_body: !!body,
      query_params: Object.keys(processedRequest.query),
      route_params: Object.keys(processedRequest.params),
    });

    return processedContext;
  }

  /**
   * Builds the base context from configuration with fallback
   */
  private static async buildBaseContext(config: RequestProcessorConfig<any>): Promise<any> {
    const fallbackContext = {};

    try {
      if (config?.context) {
        this.logger.debug("User context executing");
        if (typeof config.context === 'function') {
          const result = await Promise.resolve(config.context());
          // Validate result is a proper object
          if (result && typeof result === 'object') {
            this.logger.debug("Base context created successfully");
            return result;
          } else {
            this.logger.warn('Context function returned invalid result, using fallback', {
              returned: typeof result
            });
            return fallbackContext;
          }
        } else if (config.context && typeof config.context === 'object') {
          this.logger.debug("Static context used");
          return config.context;
        } else {
          this.logger.warn('Invalid context configuration, using fallback', {
            type: typeof config.context
          });
          return fallbackContext;
        }
      }
    } catch (error) {
      this.logger.error('Base context creation failed, using fallback', { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }

    return fallbackContext;
  }

  /**
   * Parses request body with fallback
   */
  private static async parseRequestBody(request: Request): Promise<any> {
    try {
      const result = await BodyParserProcessor.parse(request);
      return result;
    } catch (error) {
      this.logger.warn('Body parsing failed, using null fallback', { 
        error: error instanceof Error ? error.message : String(error),
        method: request.method,
        contentType: request.headers.get('content-type')
      });
      return null;
    }
  }

  /**
   * Enhances the context with plugin providers (store, logger, jobs, telemetry).
   * Safely injects providers while protecting against overwrites.
   *
   * @param context - The base processed context
   * @param pluginManager - Optional plugin manager for plugin proxy injection
   * @returns Enhanced context with plugin providers
   */
  static async enhanceWithPlugins(
    context: ProcessedContext,
    pluginManager?: VoltPluginManager<any>
  ): Promise<ProcessedContext> {
    this.logger.debug("Context enhancement started");
    const enhancedContext = { ...context.$context };
    const plugins = { ...context.$plugins };
    const injectedProviders: string[] = [];

    try {
      // Create execution plan based on dependencies
      const executionPlan = this.createPluginExecutionPlan(plugins, pluginManager);
      
      if (executionPlan.errors.length > 0) {
        this.logger.warn('Some plugins have dependency issues', {
          errors: executionPlan.errors
        });
      }

      this.logger.debug('Plugin execution plan created', {
        batches: executionPlan.batches.length,
        totalPlugins: executionPlan.batches.flat().length
      });

      // Execute plugin enhancement in dependency order
      await this.executePluginBatches(
        executionPlan.batches,
        plugins,
        enhancedContext,
        injectedProviders,
        context,
        pluginManager
      );

      if (injectedProviders.length > 0) {
        this.logger.debug("Context enhanced", {
          providers: injectedProviders
        });
      } else {
        this.logger.debug("No providers injected");
      }

      return {
        ...context,
        $context: enhancedContext,
        $plugins: plugins
      };

    } catch (error) {
      this.logger.error('Context enhancement failed', { error });
      return {
        ...context,
        $context: enhancedContext,
        $plugins: plugins
      };
    }
  }

  /**
   * Executes plugin enhancement in batches according to dependency order
   */
  private static async executePluginBatches(
    batches: string[][],
    plugins: any,
    enhancedContext: any,
    injectedProviders: string[],
    context: ProcessedContext,
    pluginManager?: VoltPluginManager<any>
  ): Promise<void> {
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      this.logger.debug(`Executing plugin batch ${i + 1}/${batches.length}`, {
        plugins: batch
      });

      // Execute all plugins in this batch in parallel
      const batchPromises = batch.map(async (pluginName) => {
        try {
          await this.enhanceWithSinglePlugin(
            pluginName,
            plugins,
            enhancedContext,
            injectedProviders,
            context,
            pluginManager
          );
        } catch (error) {
          this.logger.error(`Plugin enhancement failed for ${pluginName}`, {
            plugin: pluginName,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      });

      // Wait for all plugins in this batch to complete
      await this.withTimeout(
        Promise.allSettled(batchPromises),
        this.DEFAULT_CONFIG.timeouts.pluginEnhancement,
        `Plugin batch ${i + 1}`
      );
    }
  }

  /**
   * Enhances context with a single plugin
   */
  private static async enhanceWithSinglePlugin(
    pluginName: string,
    plugins: any,
    enhancedContext: any,
    injectedProviders: string[],
    context: ProcessedContext,
    pluginManager?: VoltPluginManager<any>
  ): Promise<void> {
    const plugin = plugins[pluginName];
    
    switch (pluginName) {
      case 'store':
        if (plugin) {
          enhancedContext.store = plugin;
          injectedProviders.push('store');
        }
        break;

      case 'logger':
        if (plugin) {
          enhancedContext.logger = plugin;
          injectedProviders.push('logger');
        }
        break;

      case 'telemetry':
        if (plugin) {
          enhancedContext.telemetry = plugin;
          injectedProviders.push('telemetry');
        }
        break;

      case 'jobs':
        const jobsProxy = await this.injectJobsProvider({ jobs: plugin });
        if (jobsProxy) {
          enhancedContext.jobs = jobsProxy;
          injectedProviders.push('jobs');
        }
        break;

      default:
        // Handle custom plugins via plugin manager
        if (pluginManager) {
          const pluginProxies = await this.injectPluginProxies(context, pluginManager);
          if (pluginProxies && Object.keys(pluginProxies).length > 0) {
            enhancedContext.plugins = { ...enhancedContext.plugins, ...pluginProxies };
            injectedProviders.push(`plugins (${Object.keys(pluginProxies).length})`);
          }
        }
        break;
    }
  }

  /**
   * Injects jobs provider asynchronously with fallback
   */
  private static async injectJobsProvider(plugins: any): Promise<any> {
    if (!plugins?.jobs) {
      return null;
    }

    try {
      if (typeof plugins.jobs.createProxy === 'function') {
        const jobsProxy = await plugins.jobs.createProxy();
        
        // Validate the proxy result
        if (jobsProxy && typeof jobsProxy === 'object') {
          this.logger.debug('Jobs proxy created successfully');
          return jobsProxy;
        } else {
          this.logger.warn('Jobs createProxy returned invalid result', {
            returned: typeof jobsProxy
          });
        }
      } else {
        this.logger.warn('Jobs plugin missing createProxy method', {
          available: Object.keys(plugins.jobs)
        });
      }
    } catch (error) {
      this.logger.error('Jobs proxy injection failed, using fallback', { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }

    // Return a basic fallback jobs interface
    return {
      dispatch: () => {
        this.logger.warn('Jobs fallback: dispatch called but no jobs provider available');
        return Promise.resolve(null);
      },
      getStatus: () => {
        this.logger.warn('Jobs fallback: getStatus called but no jobs provider available');
        return Promise.resolve(null);
      }
    };
  }

  /**
   * Injects plugin proxies into the context for type-safe plugin access
   *
   * @param context - The base processed context
   * @param pluginManager - The plugin manager instance
   * @returns Plugin proxies with context reference
   */
  private static async injectPluginProxies(
    context: ProcessedContext,
    pluginManager: VoltPluginManager<any>
  ): Promise<Record<string, any>> {
    this.logger.debug("Injecting plugin proxies");

    try {
      // Validate plugin manager
      if (!pluginManager?.getAllPluginProxies) {
        this.logger.warn('Plugin proxy injection skipped', {
          reason: 'invalid plugin manager'
        });
        return {};
      }

      // Get all plugin proxies from the manager
      const allProxies = pluginManager.getAllPluginProxies();
      if (!allProxies || typeof allProxies !== 'object' || Object.keys(allProxies).length === 0) {
        this.logger.debug('No plugin proxies found');
        return {};
      }

      // Parallelize proxy setup for all plugins with individual timeouts
      const proxyEntries = Object.entries(allProxies);
      const proxyPromises = proxyEntries.map(([pluginName, proxy]) =>
        this.withTimeout(
          this.setupPluginProxy(pluginName, proxy, context, pluginManager),
          this.DEFAULT_CONFIG.timeouts.pluginProxy,
          `Plugin proxy setup: ${pluginName}`
        ).catch(error => {
          this.logger.warn('Plugin proxy setup failed or timed out', {
            plugin: pluginName,
            error: error.message
          });
          return null;
        })
      );

      const proxyResults = await Promise.allSettled(proxyPromises);
      const pluginProxies: Record<string, any> = {};

      // Collect successful results
      proxyResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const [pluginName] = proxyEntries[index];
          pluginProxies[pluginName] = result.value;
        }
      });

      const proxyCount = Object.keys(pluginProxies).length;
      if (proxyCount > 0) {
        this.logger.debug("Plugin proxies injected", {
          count: proxyCount
        });
      }
      return pluginProxies;

    } catch (error) {
      this.logger.error('Plugin proxy injection failed', { error });
      return {};
    }
  }

  /**
   * Sets up a single plugin proxy
   */
  private static async setupPluginProxy(
    pluginName: string,
    proxy: any,
    context: ProcessedContext,
    pluginManager: VoltPluginManager<any>
  ): Promise<any> {
    if (!proxy || typeof proxy !== 'object') {
      return null;
    }

    try {
      // Update proxy context reference with safe type check
      const contextValue = typeof context.$context === 'object' ? context.$context : {};
      proxy.context = contextValue;

      // Create enhanced proxy for the action context
      return {
        ...proxy,
        // Ensure emit method uses the plugin manager's store
        emit: async (event: string, payload: any) => {
          try {
            const channel = `plugin:${pluginName}:${event}`;
            this.logger.debug("Plugin event emitted", {
              plugin: pluginName,
              event,
              channel
            });
            await pluginManager.emit(pluginName, event, payload);
          } catch (emitError) {
            this.logger.error("Plugin event emission failed", {
              plugin: pluginName,
              event,
              error: emitError
            });
          }
        },
      };
    } catch (proxyError) {
      this.logger.error("Plugin proxy setup failed", {
        plugin: pluginName,
        error: proxyError
      });
      return null;
    }
  }
}
