import colorBlindCorrectSource from './color-blind-fragment.glsl?raw';
import type { PostProcessor } from './post-processor';
import { ColorBlindnessMode } from './color-blindness-mode';
import type { Shader } from '../context/shader';
import type { VertexLayout } from '../context/vertex-layout';
import { ScreenShader } from './screen-shader';
import type { ExcaliburGraphicsContextWebGL } from '../context/excalibur-graphics-context-webgl';

export class ColorBlindnessPostProcessor implements PostProcessor {
  private _shader!: ScreenShader;
  private _simulate = false;
  constructor(
    private _colorBlindnessMode: ColorBlindnessMode,
    simulate = false
  ) {
    this._simulate = simulate;
  }

  initialize(graphicsContext: ExcaliburGraphicsContextWebGL): void {
    this._shader = new ScreenShader(graphicsContext, colorBlindCorrectSource);
    this.simulate = this._simulate;
    this.colorBlindnessMode = this._colorBlindnessMode;
  }

  getShader(): Shader {
    return this._shader.getShader();
  }

  getLayout(): VertexLayout {
    return this._shader.getLayout();
  }

  set colorBlindnessMode(colorBlindMode: ColorBlindnessMode) {
    this._colorBlindnessMode = colorBlindMode;
    if (this._shader) {
      const shader = this._shader.getShader();
      shader.use();
      if (this._colorBlindnessMode === ColorBlindnessMode.Protanope) {
        shader.setUniformInt('u_type', 0);
      } else if (this._colorBlindnessMode === ColorBlindnessMode.Deuteranope) {
        shader.setUniformInt('u_type', 1);
      } else if (this._colorBlindnessMode === ColorBlindnessMode.Tritanope) {
        shader.setUniformInt('u_type', 2);
      }
    }
  }

  get colorBlindnessMode(): ColorBlindnessMode {
    return this._colorBlindnessMode;
  }

  set simulate(value: boolean) {
    this._simulate = value;
    if (this._shader) {
      const shader = this._shader.getShader();
      shader.use();
      shader.setUniformBoolean('u_simulate', value);
    }
  }

  get simulate(): boolean {
    return this._simulate;
  }
}
