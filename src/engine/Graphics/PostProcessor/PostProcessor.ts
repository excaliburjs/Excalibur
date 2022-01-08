
import { VertexLayout } from '..';
import { ShaderV2 } from '../Context/shader-v2';


export interface PostProcessor {
  intialize(gl: WebGLRenderingContext): void;
  getShader(): ShaderV2;
  getLayout(): VertexLayout;
}
