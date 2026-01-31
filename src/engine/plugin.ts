import type { Engine, EngineOptions } from './engine';
import type { ExcaliburGraphicsContext, ExcaliburGraphicsContextOptions } from './graphics';
import type { Scene } from './scene';

// TODO should these support async flows???

/**
 *
 * An Excalibur plugin packages up changes to excalibur in a convenient package such as
 * * Custom config intercepting and implementation
 * * Engine initialization customization
 * * Graphics Context configuration including
 *   * Custom RendererPlugins
 *   * Custom PostProcessors
 * * Scene customization including default ECS Systems, Components
 */
export abstract class Plugin {
  /**
   * Unique name of the plugin
   */
  name: string;
  /**
   * Plugin priority determines the order they're run, lower is first, higher is last, default is 0
   */
  priority: number = 0;

  /**
   * Perform any async loading
   */
  async onLoad?(): Promise<void> {
    return await Promise.resolve();
  }

  /**
   * Perform any extras when load complete
   */
  async onLoadComplete?(): Promise<void> {
    return await Promise.resolve();
  }

  /**
   * Optionally intercept and mutate the {@param options} passed into the Engine, and modify the engine
   */
  onEnginePreConfig?(engine: Engine, options: EngineOptions): void;

  /**
   * Optionally intercept and mutate the {@param options} passed into the Engine, and modify the engine
   */
  onEnginePostConfig?(engine: Engine, options: EngineOptions): void;

  /**
   * Optinally intercept the engine and modify before initialize
   */
  onEnginePreInitialize?(engine: Engine): void;

  /**
   * Optionally intercept the engine and modify after initialize
   */
  onEnginePostInitialize?(engine: Engine): void;

  /**
   * Optionally intercept the grpahics context before configuration and modify either the context or options
   */
  onGraphicsPreConfig?(context: ExcaliburGraphicsContext, options: ExcaliburGraphicsContextOptions): void;

  /**
   * Optionally intercept the grpahics context after configuration and modify either the context or options
   */
  onGraphicsPostConfig?(context: ExcaliburGraphicsContext, options: ExcaliburGraphicsContextOptions): void;

  /**
   * Optionally intercetp the graphics context and modify before initialize
   */
  onGraphicsPreInitialize?(context: ExcaliburGraphicsContext): void;

  /**
   * Optionally intercetp the graphics context and modify after initialize
   */
  onGraphicsPostInitialize?(context: ExcaliburGraphicsContext): void;

  /**
   * Optionally intercept a scene and modify before initialize
   */
  onScenePreInitialize?(scene: Scene): void;

  /**
   * Optionally intercept a scene and modify after initialize
   */
  onScenePostInitialize?(scene: Scene): void;

  /**
   * Optinally perform any cleanup necessary when the engine is disposed
   */
  dispose?(): void;
}
