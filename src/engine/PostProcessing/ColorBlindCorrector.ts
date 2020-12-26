import { Logger } from './../Util/Log';
import { PostProcessor } from './PostProcessor';
import { Engine } from '../Engine';

export enum ColorBlindness {
  Protanope,
  Deuteranope,
  Tritanope
}

/**
 * This post processor can correct colors and simulate color blindness.
 * It is possible to use this on every game, but the game's performance
 * will suffer measurably. It's better to use it as a helpful tool while developing your game.
 * Remember, the best practice is to design with color blindness in mind.
 */
export class ColorBlindCorrector implements PostProcessor {
  /*eslint-disable */
  private _vertexShader =
    '' +
    'attribute vec2 a_position;' +
    'attribute vec2 a_texCoord;' +
    'uniform vec2 u_resolution;' +
    'varying vec2 v_texCoord;' +
    'void main() {' +
    // convert the rectangle from pixels to 0.0 to 1.0
    'vec2 zeroToOne = a_position / u_resolution;' +
    // convert from 0->1 to 0->2
    'vec2 zeroToTwo = zeroToOne * 2.0;' +
    // convert from 0->2 to -1->+1 (clipspace)
    'vec2 clipSpace = zeroToTwo - 1.0;' +
    'gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);' +
    // pass the texCoord to the fragment shader
    // The GPU will interpolate this value between points.
    'v_texCoord = a_texCoord;' +
    '}';

  private _fragmentShader =
    'precision mediump float;' +
    // our texture
    'uniform sampler2D u_image;' +
    // the texCoords passed in from the vertex shader.
    'varying vec2 v_texCoord;' +
    // Color blind conversions
    /*'mat3 m[9] =' +
   '{' +
      'mat3(1.0, 0.0, 0.0,  0.0, 1.0, 0.0,  0.0, 0.0, 1.0  ),' + // normal
      'mat3(0.567, 0.433, 0.0,  0.558, 0.442, 0.0,  0.0, 0.242, 0.758),' + // protanopia
      'mat3(0.817, 0.183, 0.0,  0.333, 0.667, 0.0,  0.0, 0.125,0.875),' + // protanomaly
      'mat3(0.625, 0.375, 0.0,  0.7, 0.3, 0.0,  0.0, 0.3,0.7  ),' + // deuteranopia
      'mat3(0.8, 0.2, 0.0,  0.258, 0.742, 0.0,  0.0, 0.142,0.858),' + // deuteranomaly
      'mat3(0.95, 0.05, 0.0,  0.0, 0.433, 0.567,  0.0, 0.475,0.525),' + // tritanopia
      'mat3(0.967, 0.033, 0.0,  0.0, 0.733, 0.267,  0.0, 0.183,0.817),' + // tritanomaly
      'mat3(0.299, 0.587, 0.114,  0.299, 0.587, 0.114,  0.299, 0.587,0.114),' + // achromatopsia
      'mat3(0.618, 0.320, 0.062,  0.163, 0.775, 0.062,  0.163, 0.320,0.516)' +  // achromatomaly
   '};' +*/

    'void main() {' +
    'vec4 o =  texture2D(u_image, v_texCoord);' +
    // RGB to LMS matrix conversion
    'float L = (17.8824 * o.r) + (43.5161 * o.g) + (4.11935 * o.b);' +
    'float M = (3.45565 * o.r) + (27.1554 * o.g) + (3.86714 * o.b);' +
    'float S = (0.0299566 * o.r) + (0.184309 * o.g) + (1.46709 * o.b);' +
    // Simulate color blindness

    '//MODE CODE//' +
    /* Deuteranope for testing
      'float l = 1.0 * L + 0.0 * M + 0.0 * S;' +
            'float m = 0.494207 * L + 0.0 * M + 1.24827 * S;' +
            'float s = 0.0 * L + 0.0 * M + 1.0 * S;' +*/

    // LMS to RGB matrix conversion
    'vec4 error;' +
    'error.r = (0.0809444479 * l) + (-0.130504409 * m) + (0.116721066 * s);' +
    'error.g = (-0.0102485335 * l) + (0.0540193266 * m) + (-0.113614708 * s);' +
    'error.b = (-0.000365296938 * l) + (-0.00412161469 * m) + (0.693511405 * s);' +
    'error.a = 1.0;' +
    'vec4 diff = o - error;' +
    'vec4 correction;' +
    'correction.r = 0.0;' +
    'correction.g =  (diff.r * 0.7) + (diff.g * 1.0);' +
    'correction.b =  (diff.r * 0.7) + (diff.b * 1.0);' +
    'correction = o + correction;' +
    'correction.a = o.a;' +
    '//SIMULATE//' +
    '}';

  /*eslint-enable */
  private _internalCanvas: HTMLCanvasElement;
  private _gl: WebGLRenderingContext;
  private _program: WebGLProgram;

  constructor(public engine: Engine, public simulate: boolean = false, public colorMode: ColorBlindness = ColorBlindness.Protanope) {
    this._internalCanvas = document.createElement('canvas');
    this._internalCanvas.width = engine.drawWidth;
    this._internalCanvas.height = engine.drawHeight;

    // eslint-disable-next-line
    this._gl = <WebGLRenderingContext>this._internalCanvas.getContext('webgl', { preserveDrawingBuffer: true });

    this._program = this._gl.createProgram();
    const fragmentShader = this._getShader('Fragment', this._getFragmentShaderByMode(colorMode));
    const vertextShader = this._getShader('Vertex', this._vertexShader);

    this._gl.attachShader(this._program, vertextShader);
    this._gl.attachShader(this._program, fragmentShader);
    this._gl.linkProgram(this._program);

    if (!this._gl.getProgramParameter(this._program, this._gl.LINK_STATUS)) {
      Logger.getInstance().error('Unable to link shader program!');
    }

    this._gl.useProgram(this._program);
  }

  private _getFragmentShaderByMode(colorMode: ColorBlindness) {
    let code = '';
    if (colorMode === ColorBlindness.Protanope) {
      code =
        'float l = 0.0 * L + 2.02344 * M + -2.52581 * S;' +
        'float m = 0.0 * L + 1.0 * M + 0.0 * S;' +
        'float s = 0.0 * L + 0.0 * M + 1.0 * S;';
    } else if (colorMode === ColorBlindness.Deuteranope) {
      code =
        'float l = 1.0 * L + 0.0 * M + 0.0 * S;' +
        'float m = 0.494207 * L + 0.0 * M + 1.24827 * S;' +
        'float s = 0.0 * L + 0.0 * M + 1.0 * S;';
    } else if (colorMode === ColorBlindness.Tritanope) {
      code =
        'float l = 1.0 * L + 0.0 * M + 0.0 * S;' +
        'float m = 0.0 * L + 1.0 * M + 0.0 * S;' +
        'float s = -0.395913 * L + 0.801109 * M + 0.0 * S;';
    }

    if (this.simulate) {
      this._fragmentShader = this._fragmentShader.replace('//SIMULATE//', 'gl_FragColor = error.rgba;');
    } else {
      this._fragmentShader = this._fragmentShader.replace('//SIMULATE//', 'gl_FragColor = correction.rgba;');
    }

    return this._fragmentShader.replace('//MODE CODE//', code);
  }

  private _setRectangle(x: number, y: number, width: number, height: number) {
    const x1 = x;
    const x2 = x + width;
    const y1 = y;
    const y2 = y + height;
    this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]), this._gl.STATIC_DRAW);
  }

  private _getShader(type: string, program: string): WebGLShader {
    let shader: WebGLShader;
    if (type === 'Fragment') {
      shader = this._gl.createShader(this._gl.FRAGMENT_SHADER);
    } else if (type === 'Vertex') {
      shader = this._gl.createShader(this._gl.VERTEX_SHADER);
    } else {
      Logger.getInstance().error('Error unknown shader type', type);
    }

    this._gl.shaderSource(shader, program);
    this._gl.compileShader(shader);

    if (!this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS)) {
      Logger.getInstance().error('Unable to compile shader!', this._gl.getShaderInfoLog(shader));
      return null;
    }

    return shader;
  }

  public process(image: ImageData, out: CanvasRenderingContext2D) {
    // look up where the vertex data needs to go.
    const positionLocation = this._gl.getAttribLocation(this._program, 'a_position');
    const texCoordLocation = this._gl.getAttribLocation(this._program, 'a_texCoord');

    const texCoordBuffer = this._gl.createBuffer();
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, texCoordBuffer);
    this._gl.bufferData(
      this._gl.ARRAY_BUFFER,
      new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]),
      this._gl.STATIC_DRAW
    );
    this._gl.enableVertexAttribArray(texCoordLocation);
    this._gl.vertexAttribPointer(texCoordLocation, 2, this._gl.FLOAT, false, 0, 0);

    // Create a texture.
    const texture = this._gl.createTexture();
    this._gl.bindTexture(this._gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image.
    this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.CLAMP_TO_EDGE);
    this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, this._gl.CLAMP_TO_EDGE);
    this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.NEAREST);
    this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl.NEAREST);
    // Flip the texture when unpacking into the gl context, gl reads textures in the opposite order as everything else :/
    this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, 1);
    // Upload the image into the texture.
    this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, image);

    // lookup uniforms
    const resolutionLocation = this._gl.getUniformLocation(this._program, 'u_resolution');

    // set the resolution
    this._gl.uniform2f(resolutionLocation, this._internalCanvas.width, this._internalCanvas.height);

    // Create a buffer for the position of the rectangle corners.
    const positionBuffer = this._gl.createBuffer();
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, positionBuffer);
    this._gl.enableVertexAttribArray(positionLocation);
    this._gl.vertexAttribPointer(positionLocation, 2, this._gl.FLOAT, false, 0, 0);

    // Set a rectangle the same size as the image.
    this._setRectangle(0, 0, image.width, image.height);

    // Draw the rectangle.
    this._gl.drawArrays(this._gl.TRIANGLES, 0, 6);

    // Grab transformed image from internal canvas
    const pixelData = new Uint8Array(image.width * image.height * 4);
    this._gl.readPixels(0, 0, image.width, image.height, this._gl.RGBA, this._gl.UNSIGNED_BYTE, pixelData);

    (<any>image.data).set(pixelData);

    out.putImageData(image, 0, 0);
  }
}
