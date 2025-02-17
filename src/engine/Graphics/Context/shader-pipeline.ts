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

  /**
   * Optionally cache the output until `.flagDirty()` is called
   *
   * This can be a performance optimization to avoid re-running a pipeline that doesn't change
   *
   * Default is false
   */
  cache?: boolean;
  // TODO should shader pipeline extend shader or some other abstraction for material? or should material just support source | source[]
  // maybe both?
}

export class ShaderPipeline {
  framebuffers: [Framebuffer, Framebuffer];
  pipeline: QuadRenderer[] = [];
  graphicsContext: ExcaliburGraphicsContextWebGL;
  width: number;
  height: number;
  cache: boolean = false;

  private _dirty: boolean = false;
  private _bound: boolean = false;
  private _cachedTexture: WebGLTexture | null = null;

  constructor(options: ShaderPipelineOptions) {
    const { graphicsContext, shaders, width, height, cache } = options;

    // FIXME if shader is length 1 is that an error?

    this.cache = cache ?? this.cache;
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
        // TODO uniforms/images here?
      });
      this.pipeline.push(renderer);
    }
  }

  bind(): void {
    const gl = this.graphicsContext.__gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[0].framebuffer);
    this._bound = true;
  }

  unbind(): void {
    const gl = this.graphicsContext.__gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this._bound = false;
  }

  /**
   * Redirects a provided draw function
   */
  redirectDraw(draw: () => any): WebGLTexture {
    this.bind();
    draw();
    const texture = this.draw();
    this.unbind();
    return texture;
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;

    for (const framebuffer of this.framebuffers) {
      framebuffer.resize(this.width, this.height);
    }
  }

  flagDirty(): void {
    this._dirty = true;
  }

  /**
   * If a texture is provided run the pipeline on that texture, otherwise run on the currently bound frame buffer
   */
  draw(inputTexture?: WebGLTexture): WebGLTexture {
    if (!this._bound && !inputTexture) {
      throw new Error('No framebuffer bound or input texture provided for shader pipeline');
    }
    if (!this._dirty && this.cache && this._cachedTexture) {
      return this._cachedTexture;
    }
    const startingTexture = inputTexture ?? this.framebuffers[0].texture;
    let finalIndex = 0;
    for (let i = 0; i < this.pipeline.length; i++) {
      const pipeline = this.pipeline[i];

      const source = i === 0 ? startingTexture : this.framebuffers[(i + 1) % 2].texture;
      const dest = this.framebuffers[i % 2];

      pipeline.draw([source], dest);
      finalIndex = i % 2;
    }
    this._dirty = false;
    return (this._cachedTexture = this.framebuffers[finalIndex].texture); // FIXME this only works if the input is always the same, maybe use WeakMap with inputTex as key
  }
}
