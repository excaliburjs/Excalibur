
import { VertexLayout } from '..';
import { Shader } from '../Context/shader';


export interface PostProcessor {
  initialize(gl: WebGLRenderingContext): void;
  getShader(): Shader;
  getLayout(): VertexLayout;
}
