import screenVertexSource from '../Context/shaders/screen-vertex.glsl';
import { Shader } from '../Context/shader';
import colorBlindCorrectSource from './color-blind-fragment.glsl';
import { PostProcessor } from './PostProcessor';
import { ColorBlindnessMode } from './ColorBlindnessMode';

export class ColorBlindnessPostProcessor implements PostProcessor {
  private _shader: Shader;
  private _simulate = false;
  constructor(private _colorBlindnessMode: ColorBlindnessMode, simulate = false) {
    this._simulate = simulate;
  }

  intialize(gl: WebGLRenderingContext): void {
    this._shader = new Shader(gl, screenVertexSource, colorBlindCorrectSource);
    this._shader.addAttribute('a_position', 2, gl.FLOAT);
    this._shader.addAttribute('a_texcoord', 2, gl.FLOAT);
    this.simulate = this._simulate;
    this.colorBlindnessMode = this._colorBlindnessMode;
  }

  getShader(): Shader {
    return this._shader;
  }

  set colorBlindnessMode(colorBlindMode: ColorBlindnessMode) {
    if (this._colorBlindnessMode === ColorBlindnessMode.Protanope) {
      this._shader.addUniformInt('u_type', 0);
    } else if (this._colorBlindnessMode === ColorBlindnessMode.Deuteranope) {
      this._shader.addUniformInt('u_type', 1);
    } else if (this._colorBlindnessMode === ColorBlindnessMode.Tritanope) {
      this._shader.addUniformInt('u_type', 2);
    }
    this._colorBlindnessMode = colorBlindMode;
  }

  get colorBlindnessMode(): ColorBlindnessMode {
    return this._colorBlindnessMode;
  }

  set simulate(value: boolean) {
    this._simulate = value;
    this._shader.addUniformBool('u_simulate', value);
  }

  get simulate(): boolean {
    return this._simulate;
  }
}
