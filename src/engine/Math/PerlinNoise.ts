import { Random } from './Random';
import { Color } from '../Drawing/Color';
import * as Util from '../Util/Util';

/**
 * Linear interpolation between a and b
 * @internal
 * @param time number between [0, 1]
 * @param a starting number
 * @param b ending number
 */
function _lerp(time: number, a: number, b: number): number {
  return a + time * (b - a);
}

/**
 * Reduce t by a quintic function that produces a desired effect
 * @internal
 * @param t
 */
function _fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Options for the perlin noise generator
 */
export interface PerlinOptions {
  /**
   * Random number seed for the Perlin noise generator
   */
  seed?: number;
  /**
   * Number of octaves to use when generating the noise, the number of octaves is the number of times the perlin
   * noise is generated and laid on top of itself. Using higher values can increase the curviness of the noise, and
   * make it look more natural.
   */
  octaves?: number;
  /**
   * Frequency to use when generating the noise, the higher the number the more quickly the pattern will oscillate. Another way
   * to think about this is that it is like "zooming" out from an infinite pattern determined by the seed.
   */
  frequency?: number;
  /**
   * The amplitude determines the relative height of the peaks generated in the noise.
   */
  amplitude?: number;
  /**
   * The persistance determines how quickly the amplitude will drop off, a high degree of persistance results in smoother patterns,
   * a low degree of persistance generates spiky patterns.
   */
  persistance?: number;
}

/**
 * Generates perlin noise based on the 2002 Siggraph paper http://mrl.nyu.edu/~perlin/noise/
 * Also https://flafla2.github.io/2014/08/09/perlinnoise.html
 */
export class PerlinGenerator {
  private _perm: number[] = [
    151,
    160,
    137,
    91,
    90,
    15,
    131,
    13,
    201,
    95,
    96,
    53,
    194,
    233,
    7,
    225,
    140,
    36,
    103,
    30,
    69,
    142,
    8,
    99,
    37,
    240,
    21,
    10,
    23,
    190,
    6,
    148,
    247,
    120,
    234,
    75,
    0,
    26,
    197,
    62,
    94,
    252,
    219,
    203,
    117,
    35,
    11,
    32,
    57,
    177,
    33,
    88,
    237,
    149,
    56,
    87,
    174,
    20,
    125,
    136,
    171,
    168,
    68,
    175,
    74,
    165,
    71,
    134,
    139,
    48,
    27,
    166,
    77,
    146,
    158,
    231,
    83,
    111,
    229,
    122,
    60,
    211,
    133,
    230,
    220,
    105,
    92,
    41,
    55,
    46,
    245,
    40,
    244,
    102,
    143,
    54,
    65,
    25,
    63,
    161,
    1,
    216,
    80,
    73,
    209,
    76,
    132,
    187,
    208,
    89,
    18,
    169,
    200,
    196,
    135,
    130,
    116,
    188,
    159,
    86,
    164,
    100,
    109,
    198,
    173,
    186,
    3,
    64,
    52,
    217,
    226,
    250,
    124,
    123,
    5,
    202,
    38,
    147,
    118,
    126,
    255,
    82,
    85,
    212,
    207,
    206,
    59,
    227,
    47,
    16,
    58,
    17,
    182,
    189,
    28,
    42,
    223,
    183,
    170,
    213,
    119,
    248,
    152,
    2,
    44,
    154,
    163,
    70,
    221,
    153,
    101,
    155,
    167,
    43,
    172,
    9,
    129,
    22,
    39,
    253,
    19,
    98,
    108,
    110,
    79,
    113,
    224,
    232,
    178,
    185,
    112,
    104,
    218,
    246,
    97,
    228,
    251,
    34,
    242,
    193,
    238,
    210,
    144,
    12,
    191,
    179,
    162,
    241,
    81,
    51,
    145,
    235,
    249,
    14,
    239,
    107,
    49,
    192,
    214,
    31,
    181,
    199,
    106,
    157,
    184,
    84,
    204,
    176,
    115,
    121,
    50,
    45,
    127,
    4,
    150,
    254,
    138,
    236,
    205,
    93,
    222,
    114,
    67,
    29,
    24,
    72,
    243,
    141,
    128,
    195,
    78,
    66,
    215,
    61,
    156,
    180
  ];
  private _p: Uint8Array = new Uint8Array(512);
  private _random: Random;

  private _defaultPerlinOptions: PerlinOptions = {
    octaves: 1,
    frequency: 1,
    amplitude: 1,
    persistance: 0.5
  };

  /**
   * The persistance determines how quickly the amplitude will drop off, a high degree of persistance results in smoother patterns,
   * a low degree of persistance generates spiky patterns.
   */
  public persistance: number;

  /**
   * The amplitude determines the relative height of the peaks generated in the noise.
   */
  public amplitude: number;

  /**
   * Frequency to use when generating the noise, the higher the number the more quickly the pattern will oscillate. Another way
   * to think about this is that it is like "zooming" out from an infinite pattern determined by the seed.
   */
  public frequency: number;

  /**
   * Number of octaves to use when generating the noise, the number of octaves is the number of times the perlin
   * noise is generated and laid on top of itself. Using higher values can increase the curviness of the noise, and
   * make it look more natural.
   */
  public octaves: number;

  constructor(options?: PerlinOptions) {
    options = Util.extend({}, this._defaultPerlinOptions, options);

    this.persistance = options.persistance;
    this.amplitude = options.amplitude;
    this.frequency = options.frequency;
    this.octaves = options.octaves;

    if (options.seed) {
      this._random = new Random(options.seed);
    } else {
      this._random = new Random();
    }

    this._perm = this._random.shuffle(this._perm);

    for (let i = 0; i < 512; i++) {
      this._p[i] = this._perm[i % 256] & 0xff;
    }
  }

  /**
   * Generates 1-Dimensional perlin noise given an x and generates noises values between [0, 1].
   */
  public noise(x: number): number;
  /**
   * Generates 2-Dimensional perlin noise given an (x, y) and generates noise values between [0, 1]
   */
  public noise(x: number, y: number): number;
  /**
   * Generates 3-Dimensional perlin noise given an (x, y, z) and generates noise values between [0, 1]
   */
  public noise(x: number, y: number, z: number): number;
  public noise(): number {
    let amp = this.amplitude;
    let freq = this.frequency;

    let total = 0;
    let maxValue = 0;
    for (let i = 0; i < this.octaves; i++) {
      switch (arguments.length) {
        case 1:
          total += this._noise1d(arguments[0] * freq) * amp;
          break;
        case 2:
          total += this._noise2d(arguments[0] * freq, arguments[1] * freq) * amp;
          break;
        case 3:
          total += this._noise3d(arguments[0] * freq, arguments[1] * freq, arguments[2] * freq) * amp;
          break;
        /* istanbul ignore next */
        default:
          throw new Error('Invalid arguments for perlin noise');
      }
      maxValue += amp;
      amp *= this.persistance;
      freq *= 2;
    }
    return total / maxValue;
  }

  /**
   * Generates a list starting at 0 and ending at 1 of continuous perlin noise, by default the step is 1/length;
   *
   */
  public sequence(length: number, step?: number): number[] {
    if (!step) {
      step = 1 / length;
    }
    const array: number[] = new Array(length);
    for (let i = 0; i < length; i++) {
      array[i] = this.noise(i * step);
    }
    return array;
  }

  /**
   * Generates a 2D grid of perlin noise given a step value packed into a 1D array i = (x + y*width),
   * by default the step will 1/(min(dimension))
   */
  public grid(width: number, height: number, step?: number): number[] {
    if (!step) {
      step = 1 / Math.min(width, height);
    }

    const array: number[] = new Array(width * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        array[x + y * width] = this.noise(x * step, y * step);
      }
    }

    return array;
  }

  private _gradient3d(hash: number, x: number, y: number, z: number) {
    const h = hash & 0xf;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 0b1) === 0 ? u : -u) + ((h & 0b10) === 0 ? v : -v);
  }

  private _gradient2d(hash: number, x: number, y: number) {
    const value = (hash & 0b1) === 0 ? x : y;
    return (hash & 0b10) === 0 ? -value : value;
  }

  private _gradient1d(hash: number, x: number) {
    return (hash & 0b1) === 0 ? -x : x;
  }

  private _noise1d(x: number) {
    const intX = Math.floor(x) & 0xff; // force 0-255 integers to lookup in permutation
    x -= Math.floor(x);
    const fadeX = _fade(x);
    return (_lerp(fadeX, this._gradient1d(this._p[intX], x), this._gradient1d(this._p[intX + 1], x - 1)) + 1) / 2;
  }

  private _noise2d(x: number, y: number) {
    const intX = Math.floor(x) & 0xff;
    const intY = Math.floor(y) & 0xff;

    x -= Math.floor(x);
    y -= Math.floor(y);

    const fadeX = _fade(x);
    const fadeY = _fade(y);
    const a = this._p[intX] + intY;
    const b = this._p[intX + 1] + intY;
    return (
      (_lerp(
        fadeY,
        _lerp(fadeX, this._gradient2d(this._p[a], x, y), this._gradient2d(this._p[b], x - 1, y)),
        _lerp(fadeX, this._gradient2d(this._p[a + 1], x, y - 1), this._gradient2d(this._p[b + 1], x - 1, y - 1))
      ) +
        1) /
      2
    );
  }

  private _noise3d(x: number, y: number, z: number) {
    const intX = Math.floor(x) & 0xff;
    const intY = Math.floor(y) & 0xff;
    const intZ = Math.floor(z) & 0xff;

    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);

    const fadeX = _fade(x);
    const fadeY = _fade(y);
    const fadeZ = _fade(z);

    const a = this._p[intX] + intY;
    const b = this._p[intX + 1] + intY;

    const aa = this._p[a] + intZ;
    const ba = this._p[b] + intZ;

    const ab = this._p[a + 1] + intZ;
    const bb = this._p[b + 1] + intZ;

    return (
      (_lerp(
        fadeZ,
        _lerp(
          fadeY,
          _lerp(fadeX, this._gradient3d(this._p[aa], x, y, z), this._gradient3d(this._p[ba], x - 1, y, z)),
          _lerp(fadeX, this._gradient3d(this._p[ab], x, y - 1, z), this._gradient3d(this._p[bb], x - 1, y - 1, z))
        ),
        _lerp(
          fadeY,
          _lerp(fadeX, this._gradient3d(this._p[aa + 1], x, y, z - 1), this._gradient3d(this._p[ba + 1], x - 1, y, z - 1)),
          _lerp(fadeX, this._gradient3d(this._p[ab + 1], x, y - 1, z - 1), this._gradient3d(this._p[bb + 1], x - 1, y - 1, z - 1))
        )
      ) +
        1) /
      2
    );
  }
}

/**
 * A helper to draw 2D perlin maps given a perlin generator and a function
 */
export class PerlinDrawer2D {
  /**
   * @param generator - An existing perlin generator
   * @param colorFcn - A color function that takes a value between [0, 255] derived from the perlin generator, and returns a color
   */
  constructor(public generator: PerlinGenerator, public colorFcn?: (val: number) => Color) {
    if (!colorFcn) {
      this.colorFcn = (val: number) => {
        return val < 125 ? Color.Black : Color.White;
      };
    }
  }

  /**
   * Returns an image of 2D perlin noise
   */
  public image(width: number, height: number): HTMLImageElement {
    const image = document.createElement('img');
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    this.draw(ctx, 0, 0, width, height);
    image.src = canvas.toDataURL();
    return image;
  }

  /**
   * This draws a 2D perlin grid on a canvas context, not recommended to be called every frame due to performance
   */
  public draw(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
    const grid = this.generator.grid(width, height);
    const imageData = ctx.getImageData(x, y, width, height);
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        const val = grid[i + width * j];
        const c = Math.floor(val * 255) & 0xff;
        const pixel = (i + j * imageData.width) * 4;
        const color = this.colorFcn(c);

        imageData.data[pixel] = color.r;
        imageData.data[pixel + 1] = color.g;
        imageData.data[pixel + 2] = color.b;
        imageData.data[pixel + 3] = Math.floor(color.a * 255);
      }
    }
    ctx.putImageData(imageData, x, y);
  }
}
