import { ExcaliburGraphicsContextWebGL } from './ExcaliburGraphicsContextWebGL';

export interface FramebufferOptions {
  graphicsContext: ExcaliburGraphicsContextWebGL;
  width: number;
  height: number;
}

export class Framebuffer {
  graphicsContext: ExcaliburGraphicsContextWebGL;
  width: number;
  height: number;
  texture: WebGLTexture;
  framebuffer: WebGLFramebuffer;
  texelSize: [texelWidth: number, texelHeight: number];
  constructor(options: FramebufferOptions) {
    const { graphicsContext, width, height } = options;

    this.graphicsContext = graphicsContext;
    this.width = width;
    this.height = height;
    this.texelSize = [1 / width, 1 / height];

    const gl = graphicsContext.__gl;

    const texture = gl.createTexture();
    this.texture = texture!;
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    const framebuffer = gl.createFramebuffer();
    this.framebuffer = framebuffer!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  copyInto(texture: WebGLTexture) {
    const gl = this.graphicsContext.__gl;

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, this.width, this.height, 0);
  }

  resize(width: number, height: number): void {
    const gl = this.graphicsContext.__gl;
    this.width = width;
    this.height = height;

    // update backing texture size
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  }
}
