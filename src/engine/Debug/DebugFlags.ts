import { ColorBlindnessMode, ColorBlindnessPostProcessor } from '../Graphics/Context/postprocess';
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

  public correct(_colorBlindness: ColorBlindnessMode) {
    if (this._engine.graphicsContext instanceof ExcaliburGraphicsContextWebGL) {
      this._engine.graphicsContext.addPostProcessor(new ColorBlindnessPostProcessor(_colorBlindness));
    }
  }
  
  public simulate(_colorBlindness: ColorBlindnessMode) {
    if (this._engine.graphicsContext instanceof ExcaliburGraphicsContextWebGL) {
      this._engine.graphicsContext.addPostProcessor(new ColorBlindnessPostProcessor(_colorBlindness, true));
    }
  }
}
