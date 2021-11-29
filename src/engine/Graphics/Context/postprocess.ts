
import screenVertexSource from './shaders/screen-vertex.glsl';
import { Shader } from './shader';
import { Matrix } from '../../Math/matrix';

export class PostProcess {
  public shader: Shader;
  constructor(gl: WebGLRenderingContext, ortho: Matrix, fragmentSource: string) {
    this.shader = new Shader(gl, screenVertexSource, fragmentSource);
    this.shader.addAttribute('a_position', 2, gl.FLOAT);
    this.shader.addAttribute('a_texcoord', 2, gl.FLOAT);
    this.shader.addUniformMatrix('u_matrix', ortho.data);
  }
}