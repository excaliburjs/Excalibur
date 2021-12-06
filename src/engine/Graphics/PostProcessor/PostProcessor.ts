
import { Shader } from '../Context/shader';


export interface PostProcessor {
  intialize(gl: WebGLRenderingContext): void;
  getShader(): Shader;
}
