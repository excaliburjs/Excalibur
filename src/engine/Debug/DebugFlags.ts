import { ColorBlindnessMode } from "../Graphics/PostProcessor/ColorBlindnessMode";
import { ColorBlindnessPostProcessor } from "../Graphics/PostProcessor/ColorBlindnessPostProcessor";
import { Engine } from '../Engine';
import { ExcaliburGraphicsContextWebGL } from '..';

export interface DebugFlags {
  colorBlindMode: ColorBlindFlags;
}

export class ColorBlindFlags {
  private _engine: Engine;

  constructor(engine: Engine) {
    this._engine = engine;
  }

  public correct(colorBlindness: ColorBlindnessMode) {
    if (this._engine.graphicsContext instanceof ExcaliburGraphicsContextWebGL) {
      this._engine.graphicsContext.addPostProcessor(new ColorBlindnessPostProcessor(colorBlindness, false));
    }
  }
  
  public simulate(colorBlindness: ColorBlindnessMode) {
    if (this._engine.graphicsContext instanceof ExcaliburGraphicsContextWebGL) {
      this._engine.graphicsContext.addPostProcessor(new ColorBlindnessPostProcessor(colorBlindness, true));
    }
  }
}
