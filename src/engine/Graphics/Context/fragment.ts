import { Color } from '../../Color';
import { glsl } from './glsl';
/*
 * Optionally wrap fragment glsl source code
 *
 * Useful for building user serviceable Filters/Shaders
 */
export class Fragment {
  private _source: string;
  // TODO maybe add a warning if missing premultiply alpha
  constructor(source: string) {
    if (!source.startsWith('#version 300 es')) {
      throw new Error(`Invalid shader source code, must start with "#version 300 es" no spaces or newlines before!`);
    }
    this._source = source;
  }
  getSource(): string {
    return this._source;
  }
}

export class Grayscale extends Fragment {
  constructor() {
    super(glsl`#version 300 es
      precision mediump float;
      in vec1 v_uv;
      uniform sampler2D u_graphic;
      out vec4 fragColor;
      void main() {
        vec4 color = texture(u_graphic, v_uv);
        float average = (color.r + color.g + color.b) / 3.0;
        fragColor = vec4(average, average, average, color.a);
        fragColor.rgb *= fragColor.a;
      }`);
  }
}

export class Colorize extends Fragment {
  constructor(color: Color) {
    super(glsl`#version 300 es
      precision mediump float;
      in vec1 v_uv;
      uniform sampler2D u_graphic;
      out vec4 fragColor;
      void main() {
        vec4 color = texture(u_graphic, v_uv);
        float average = (color.r + color.g + color.b) / 3.0;
        fragColor = vec4(average, average, average, color.a);
        fragColor = fragColor * ${color};
        fragColor.rgb *= fragColor.a;
      }`);
  }
}
export class UVTest extends Fragment {
  constructor() {
    super(glsl`#version 300 es
      precision mediump float;
      in vec1 v_uv;
      out vec4 fragColor;
      void main() {
        fragColor = vec4(v_uv.r, u_uv.g, 0.0, 1.0);
      }`);
  }
}
