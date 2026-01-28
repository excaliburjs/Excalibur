import { Engine, EngineOptions } from "./engine";
import { ExcaliburGraphicsContext, ExcaliburGraphicsContextOptions } from "./graphics";
import { Scene } from "./scene";

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
export class Plugin {
  name: string;

  priority: number = 0;

  onLoad(): Promise<void> { return Promise.resolve() }
  onLoadComplete(): Promise<void> { return Promise.resolve() }

  onEnginePreConfig(engine: Engine, options: EngineOptions) { }
  onEnginePostConfig(engine: Engine, options: EngineOptions) { }
  onEnginePreInitialize(engine: Engine) { }
  onEnginePostInitialize(engine: Engine) { }

  onGraphicsPreConfig(context: ExcaliburGraphicsContext, options: ExcaliburGraphicsContextOptions) { }
  onGraphicsPostConfig(context: ExcaliburGraphicsContext, options: ExcaliburGraphicsContextOptions) { }
  onGraphicsPreInitialize(context: ExcaliburGraphicsContext) { }
  onGraphicsPostInitialize(context: ExcaliburGraphicsContext) { }
  onScenePreInitialize(scene: Scene) { }
  onScenePostInitialize(scene: Scene) { }
  dispose() { }

}
