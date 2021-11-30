
import screenVertexSource from './shaders/screen-vertex.glsl';
import { Shader } from './shader';

import colorBlindCorrectSource from './shaders/color-blind-fragment.glsl';

export interface PostProcessor {
  intialize(gl: WebGLRenderingContext): void;
  getShader(): Shader;
}


export enum ColorBlindnessMode {
  Protanope = 'Protanope',
  Deuteranope = 'Deuteranope',
  Tritanope = 'Tritanope'
}
export class ColorBlindnessPostProcessor implements PostProcessor {
  private _shader: Shader;
  constructor(private _colorBlindnessMode: ColorBlindnessMode , private _simulate = false) {}

  intialize(gl: WebGLRenderingContext): void {
    this._shader = new Shader(gl, screenVertexSource, colorBlindCorrectSource);
    this._shader.addAttribute('a_position', 2, gl.FLOAT);
    this._shader.addAttribute('a_texcoord', 2, gl.FLOAT);
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
