import { ColorBlindnessMode } from '../graphics/post-processor/color-blindness-mode';
import { ColorBlindnessPostProcessor } from '../graphics/post-processor/color-blindness-post-processor';
import type { Engine } from '../engine';
import { ExcaliburGraphicsContextWebGL } from '../graphics/context/excalibur-graphics-context-web-gl';

export class ColorBlindFlags {
  private _engine: Engine;
  private _colorBlindPostProcessor: ColorBlindnessPostProcessor;

  constructor(engine: Engine) {
    this._engine = engine;
    this._colorBlindPostProcessor = new ColorBlindnessPostProcessor(ColorBlindnessMode.Protanope);
  }

  /**
   * Correct colors for a specified color blindness
   * @param colorBlindness
   */
  public correct(colorBlindness: ColorBlindnessMode) {
    if (this._engine.graphicsContext instanceof ExcaliburGraphicsContextWebGL) {
      this.clear();
      this._colorBlindPostProcessor.colorBlindnessMode = colorBlindness;
      this._colorBlindPostProcessor.simulate = false;
      this._engine.graphicsContext.addPostProcessor(this._colorBlindPostProcessor);
    }
  }

  /**
   * Simulate colors for a specified color blindness
   * @param colorBlindness
   */
  public simulate(colorBlindness: ColorBlindnessMode) {
    if (this._engine.graphicsContext instanceof ExcaliburGraphicsContextWebGL) {
      this.clear();
      this._colorBlindPostProcessor.colorBlindnessMode = colorBlindness;
      this._colorBlindPostProcessor.simulate = true;
      this._engine.graphicsContext.addPostProcessor(this._colorBlindPostProcessor);
    }
  }

  /**
   * Remove color blindness post processor
   */
  public clear() {
    this._engine.graphicsContext.removePostProcessor(this._colorBlindPostProcessor);
  }
}
