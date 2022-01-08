import colorBlindCorrectSource from './color-blind-fragment.glsl';
import { PostProcessor } from './PostProcessor';
import { ColorBlindnessMode } from './ColorBlindnessMode';
import { Shader } from '../Context/shader';
import { VertexLayout } from '../Context/vertex-layout';
import { ScreenShader } from './ScreenShader';

export class ColorBlindnessPostProcessor implements PostProcessor {
  private _shader: ScreenShader;
  private _simulate = false;
  constructor(private _colorBlindnessMode: ColorBlindnessMode, simulate = false) {
    this._simulate = simulate;
  }

  intialize(_gl: WebGLRenderingContext): void {
    this._shader = new ScreenShader(colorBlindCorrectSource);
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
    const shader = this._shader.getShader();
    shader.use();
    if (this._colorBlindnessMode === ColorBlindnessMode.Protanope) {
      shader.setUniformInt('u_type', 0);
    } else if (this._colorBlindnessMode === ColorBlindnessMode.Deuteranope) {
      shader.setUniformInt('u_type', 1);
    } else if (this._colorBlindnessMode === ColorBlindnessMode.Tritanope) {
      shader.setUniformInt('u_type', 2);
    }
    this._colorBlindnessMode = colorBlindMode;
  }

  get colorBlindnessMode(): ColorBlindnessMode {
    return this._colorBlindnessMode;
  }

  set simulate(value: boolean) {
    const shader = this._shader.getShader();
    shader.use();
    this._simulate = value;
    shader.setUniformBoolean('u_simulate', value);
  }

  get simulate(): boolean {
    return this._simulate;
  }
}
