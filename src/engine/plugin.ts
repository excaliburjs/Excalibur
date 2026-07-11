import type { Engine, EngineOptions } from './engine';
import type { ExcaliburGraphicsContext, ExcaliburGraphicsContextOptions } from './graphics';
import type { Scene } from './scene';

/**
 * An Excalibur Plugin packages up engine modifications into a convenient bundle.
 *
 * Plugins are inspired by the [Bevy Plugin System](https://bevy.org/learn/quick-start/getting-started/plugins/)
 * and allow third-party libraries to configure multiple aspects of Excalibur through a single install,
 * rather than requiring users to manually wire up loaders, renderers, post-processors, systems, etc.
 *
 * Plugins participate in the engine, graphics, and scene lifecycles through a series of optional
 * hook methods. Each hook is called at a specific point in the initialization flow, giving plugins
 * the opportunity to register custom renderers, post-processors, ECS systems, resources, or modify
 * engine configuration.
 *
 * ## Lifecycle Order
 *
 * 1. **Engine construction** — `onEnginePreConfig` → (flags frozen) → `onEnginePostConfig`
 * 2. **Engine start** — `onLoad` → (resources loaded) → `onLoadComplete`
 * 3. **Engine initialize** — `onEnginePreInitialize` → `onEnginePostInitialize`
 * 4. **Graphics context construction** — `onGraphicsPreConfig` → `onGraphicsPostConfig`
 * 5. **Graphics context init** — `onGraphicsPreInitialize` → `onGraphicsPostInitialize`
 * 6. **Scene initialize** — `onScenePreInitialize` → `onScenePostInitialize`
 * 7. **Scene activate** — `onScenePreActivate` → `onScenePostActivate`
 * 8. **Scene deactivate** — `onScenePreDeactivate` → `onScenePostDeactivate`
 * 9. **Graphics context lost/restored** — `onGraphicsContextLost` → `onGraphicsContextRestored`
 * 10. **Engine dispose** — `dispose`
 *
 * ## Example: SDF Text Plugin
 *
 * ```typescript
 * class SDFPlugin extends Plugin {
 *   name = 'ex.sdf-text';
 *   priority = 0;
 *
 *   onGraphicsPostInitialize(context: ExcaliburGraphicsContext) {
 *     context.lazyRegister('ex.sdf-text-renderer', () => new SDFTextRenderer());
 *   }
 *
 *   dispose() {
 *     // clean up any plugin-owned resources
 *   }
 * }
 *
 * const game = new Engine({
 *   plugins: [new SDFPlugin()]
 * });
 * ```
 *
 * Plugins can also be added after construction via {@apilink Engine.addPlugin}.
 */
export abstract class Plugin {
  /**
   * Unique name of the plugin, pick something unique (official excalibur plugins use the reserved prefix "ex."). 
   * Used for deduplication — attempting to add a plugin
   * with a name that is already installed will produce a warning and be skipped.
   * @param name
   */
  constructor(public readonly name: string) { }

  /**
   * Plugin priority determines the order hooks are run across all installed plugins.
   *
   * Lower numbers run first, higher numbers run last. Default is `0`.
   * Plugins that need to configure things before others (e.g. registering a base
   * renderer that other plugins extend) should use a lower priority.
   */
  priority: number = 0;

  /**
   * Perform any async loading the plugin needs before the engine starts.
   *
   * Called during {@apilink Engine.start} before the loader runs. Use this to
   * fetch configuration, preload data, or set up async resources.
   *
   * @returns A promise that resolves when loading is complete
   */
  async onLoad?(): Promise<void>;

  /**
   * Called after all loader resources have finished loading but before the engine
   * initializes. Use this to finalize any setup that depended on loaded data.
   *
   * @returns A promise that resolves when complete
   */
  async onLoadComplete?(): Promise<void>;

  /**
   * Intercept and mutate the {@param options} passed into the Engine, and/or modify
   * the engine before any other configuration happens.
   *
   * This is the first hook called during engine construction. Feature flags can still
   * be modified at this point (before {@apilink Flags.freeze}).
   *
   * @param engine  The engine being constructed
   * @param options The user-provided engine options (mutable)
   */
  onEnginePreConfig?(engine: Engine, options: EngineOptions): void;

  /**
   * Intercept and mutate the engine after core configuration is done but before the
   * engine is fully constructed.
   *
   * Called near the end of the Engine constructor, after inputs and visibility handlers
   * are wired up. Feature flags are frozen at this point.
   *
   * @param engine  The engine being constructed
   * @param options The user-provided engine options
   */
  onEnginePostConfig?(engine: Engine, options: EngineOptions): void;

  /**
   * Intercept the engine and modify it before initialization.
   *
   * Called during {@apilink Engine.start} after loading completes but before
   * {@apilink Engine.onInitialize} and the director initialization.
   *
   * @param engine The engine about to be initialized
   */
  onEnginePreInitialize?(engine: Engine): void;

  /**
   * Intercept the engine and modify it after initialization.
   *
   * Called after {@apilink Engine.onInitialize} and the director initialization,
   * and after the `'initialize'` event is emitted.
   *
   * @param engine The initialized engine
   */
  onEnginePostInitialize?(engine: Engine): void;

  /**
   * Intercept the graphics context before it is configured and modify either the
   * context or the options.
   *
   * This is the very first graphics hook, called at the start of the
   * {@apilink ExcaliburGraphicsContextWebGL} constructor before the WebGL context
   * is created. Use this to modify graphics options before they are applied.
   *
   * @param context The graphics context being constructed
   * @param options The graphics context options (mutable)
   */
  onGraphicsPreConfig?(context: ExcaliburGraphicsContext, options: ExcaliburGraphicsContextOptions): void;

  /**
   * Intercept the graphics context after it is configured but before initialization.
   *
   * Called after the WebGL context is created and all configuration properties are set,
   * but before built-in renderers and render targets are initialized.
   *
   * @param context The graphics context being constructed
   * @param options The graphics context options
   */
  onGraphicsPostConfig?(context: ExcaliburGraphicsContext, options: ExcaliburGraphicsContextOptions): void;

  /**
   * Intercept the graphics context and modify it before initialization.
   *
   * Called at the start of the graphics context's `_init()` method, before the
   * orthographic projection, viewport, built-in renderers, and render targets are set up.
   *
   * @param context The graphics context being initialized
   */
  onGraphicsPreInitialize?(context: ExcaliburGraphicsContext): void;

  /**
   * Intercept the graphics context and modify it after initialization.
   *
   * This is the recommended hook for registering custom {@apilink RendererPlugin}s via
   * {@apilink ExcaliburGraphicsContext.register} or
   * {@apilink ExcaliburGraphicsContext.lazyRegister}, and for adding
   * {@apilink PostProcessor}s via {@apilink ExcaliburGraphicsContext.addPostProcessor}.
   *
   * Called after all built-in renderers and render targets are initialized.
   *
   * @param context The initialized graphics context
   */
  onGraphicsPostInitialize?(context: ExcaliburGraphicsContext): void;

  /**
   * Intercept a scene and modify it before initialization.
   *
   * Called after the scene's ECS systems are initialized but before the user's
   * {@apilink Scene.onInitialize} runs. Use this to add default ECS systems,
   * components, or resources to every scene.
   *
   * @param scene The scene being initialized
   */
  onScenePreInitialize?(scene: Scene): void;

  /**
   * Intercept a scene and modify it after initialization.
   *
   * Called after the user's {@apilink Scene.onInitialize} and child initialization
   * are complete, but before the scene's `'initialize'` event is emitted.
   *
   * @param scene The initialized scene
   */
  onScenePostInitialize?(scene: Scene): void;

  /**
   * Intercept a scene before it is activated.
   *
   * Called when a scene becomes the current scene, before the user's
   * {@apilink Scene.onActivate} runs.
   *
   * @param scene The scene being activated
   */
  onScenePreActivate?(scene: Scene): void;

  /**
   * Intercept a scene after it is activated.
   *
   * Called after the user's {@apilink Scene.onActivate} completes.
   *
   * @param scene The activated scene
   */
  onScenePostActivate?(scene: Scene): void;

  /**
   * Intercept a scene before it is deactivated.
   *
   * Called when a scene is about to stop being the current scene, before the user's
   * {@apilink Scene.onDeactivate} runs.
   *
   * @param scene The scene being deactivated
   */
  onScenePreDeactivate?(scene: Scene): void;

  /**
   * Intercept a scene after it is deactivated.
   *
   * Called after the user's {@apilink Scene.onDeactivate} completes.
   *
   * @param scene The deactivated scene
   */
  onScenePostDeactivate?(scene: Scene): void;

  /**
   * Called when the WebGL graphics context is lost (e.g. GPU driver crash).
   *
   * Plugins that manage WebGL resources (shaders, buffers, textures) should
   * implement this to mark their resources as invalid. The context will be
   * restored and {@apilink onGraphicsContextRestored} will be called, after which
   * {@apilink onGraphicsPreInitialize} and {@apiliink onGraphicsPostInitialize}
   * will re-run so resources can be rebuilt.
   *
   * @param context The graphics context that was lost
   */
  onGraphicsContextLost?(context: ExcaliburGraphicsContext): void;

  /**
   * Called when the WebGL graphics context is restored after being lost.
   *
   * After this hook, the graphics context's `_init()` method re-runs, which will
   * call {@apilink onGraphicsPreInitialize} and {@apilink onGraphicsPostInitialize}
   * again so plugins can rebuild their WebGL resources.
   *
   * @param context The graphics context that was restored
   */
  onGraphicsContextRestored?(context: ExcaliburGraphicsContext): void;

  /**
   * Perform any cleanup necessary when the engine is disposed.
   *
   * Called during {@apilink Engine.dispose} after the engine is stopped and
   * inputs are disabled, but before the canvas is removed and the graphics context
   * is disposed. Use this to free plugin-owned resources, remove event listeners,
   * or dispose of custom renderers.
   */
  dispose?(): void;
}
