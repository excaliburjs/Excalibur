import { ExcaliburGraphicsContextWebGL } from './ExcaliburGraphicsContextWebGL';
import { Framebuffer } from './framebuffer';
import { QuadRenderer } from './quad-renderer';

export interface ShaderPipelineOptions {
  graphicsContext: ExcaliburGraphicsContextWebGL;
  // TODO supply uniforms/images to the pipeline?
  /**
   * Provide an ordered list of fragment sources
   */
  shaders: string[];

  width?: number;
  height?: number;

  // TODO cache output
}

export class ShaderPipeline {
  framebuffers: [Framebuffer, Framebuffer];
  pipeline: QuadRenderer[] = [];
  graphicsContext: ExcaliburGraphicsContextWebGL;
  width: number;
  height: number;
  constructor(options: ShaderPipelineOptions) {
    const { graphicsContext, shaders, width, height } = options;

    this.graphicsContext = graphicsContext;
    this.width = width ?? 100;
    this.height = height ?? 100;

    this.framebuffers = [
      new Framebuffer({ graphicsContext, width: this.width, height: this.height }),
      new Framebuffer({ graphicsContext, width: this.width, height: this.height })
    ];

    for (const fragmentSource of shaders) {
      const renderer = new QuadRenderer({
        graphicsContext,
        fragmentSource
      });
      this.pipeline.push(renderer);
    }
  }

  bind(): void {
    const gl = this.graphicsContext.__gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[0].framebuffer);
  }

  unbind(): void {
    const gl = this.graphicsContext.__gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;

    for (const framebuffer of this.framebuffers) {
      framebuffer.resize(this.width, this.height);
    }
  }

  draw(capture: () => any): void {
    this.bind();
    capture();
    this.unbind();
    let currentIndex = 0;
    for (const renderer of this.pipeline) {
      renderer.draw([this.framebuffers[currentIndex].texture], this.framebuffers[(currentIndex + 1) % 2]);
      currentIndex = (currentIndex + 1) % 2;
    }
  }
}
