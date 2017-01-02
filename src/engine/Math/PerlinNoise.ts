import { Random } from 'Random';

function _lerp(time: number, a: number, b: number): number {
   return a + time * (b - a);
}

function _fade(t: number): number {
   return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Generates perlin noise based on the 2002 Siggraph paper http://mrl.nyu.edu/~perlin/noise/ 
 * Also https://flafla2.github.io/2014/08/09/perlinnoise.html 
 */
export class PerlinNoise {

   private _perm: number[] = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 
    140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190,  6, 148, 247, 120, 234, 75, 0, 26, 
    197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136,
    171, 168,  68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60,
    211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54,  65, 25, 63, 161,  1, 216, 80,
    73, 209, 76, 132, 187, 208,  89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198,
    173, 186,  3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206,
    59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152,  2, 44, 154, 163,  70,
    221, 153, 101, 155, 167,  43, 172, 9, 129, 22, 39, 253,  19, 98, 108, 110, 79, 113, 224, 232, 178, 
    185,  112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241,  81, 
    51, 145, 235, 249, 14, 239, 107, 49, 192, 214,  31, 181, 199, 106, 157, 184,  84, 204, 176, 115,
    121, 50, 45, 127,  4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 
    78, 66, 215, 61, 156, 180]; 
   private _p: Uint8Array = new Uint8Array(512);
   private _random: Random;

   constructor(seed?: number, public octaves = 1, public frequency = 1, public amplitude = 1, public persistance = 1) {
      

      if (seed) {
         this._random = new Random(seed);
      } else {
         this._random = new Random();
      }
      
      this._perm = this._random.shuffle(this._perm);

      for (var i = 0; i < 512; i++) {
         this._p[i] = this._perm[i % 256] & 0xFF;
      }      
   }

   /**
    * 1-Dimensional perlin noise
    */
   public noise(x: number);
   /**
    * 2-Dimensional perlin noise
    */
   public noise(x: number, y: number);
   /**
    * 3-Dimensional perlin noise 
    */
   public noise(x: number, y: number, z: number);
   public noise(args: any): number {
      var amp = this.amplitude;
      var freq = this.frequency;

      var total = 0;
      var maxValue = 0;
      for (var i = 0; i < this.octaves; i++) {
         switch (arguments.length) {
            case 1: total += this._noise1d(arguments[0] * freq) * amp; break;
            case 2: total += this._noise2d(arguments[0] * freq, 
                                           arguments[1] * freq) * amp; break;
            case 3: total += this._noise3d(arguments[0] * freq, 
                                           arguments[1] * freq, 
                                           arguments[2] * freq) * amp; break;
            default: throw new Error('Invalid arguments for perlin noise');
         }
         maxValue += this.amplitude;
         amp *= this.persistance;
         freq *= 2;
      }
      return total / maxValue;
   }
   private _gradient3d(hash: number, x: number, y: number, z: number) {
      var h = hash & 0xF;
      var u = h < 8 ? x : y;
      var v = h < 4 ? y : ((h === 12 || h === 14) ? x : z);
      return ((h & 0b1) === 0 ? u : -u) + ((h & 0b10) === 0 ? v : -v);
   }

   private _gradient2d(hash: number, x: number, y: number) {
      var value = (hash & 0b1) === 0 ? x : y;
      return (hash & 0b10) === 0 ? -value : value;
   }

   private _gradient1d(hash: number, x: number) {
      return  (hash & 0b1) === 0 ? -x : x;
   }

   private _noise1d(x: number) {
      var intX = Math.floor(x) & 0xFF; // force 0-255 integers to lookup in permutation
      x -= Math.floor(x);
      var fadeX = _fade(x);
      return _lerp(fadeX, this._gradient1d(this._p[intX], x), this._gradient1d(this._p[intX + 1], x - 1));
   }

   private _noise2d(x: number, y: number) {
      var intX = Math.floor(x) & 0xFF;
      var intY = Math.floor(y) & 0xFF;
      
      x -= Math.floor(x);
      y -= Math.floor(y);

      var fadeX = _fade(x);
      var fadeY = _fade(y);
      var a = this._p[intX] + intY;
      var b = this._p[intX + 1] + intY;
      return _lerp(fadeY, 
                  _lerp(fadeX, this._gradient2d(this._p[a] , x, y), this._gradient2d(this._p[b] , x - 1, y)),
                  _lerp(fadeX, this._gradient2d(this._p[a + 1] , x, y - 1), this._gradient2d(this._p[b + 1], x - 1, y - 1)));
   }

   private _noise3d(x: number, y: number, z: number) {
      var intX = Math.floor(x) & 0xFF;
      var intY = Math.floor(y) & 0xFF;
      var intZ = Math.floor(z) & 0xFF;
      
      x -= Math.floor(x);
      y -= Math.floor(y);
      z -= Math.floor(z);

      var fadeX = _fade(x);
      var fadeY = _fade(y);
      var fadeZ = _fade(z);

      var a = this._p[intX] + intY;
      var b = this._p[intX + 1] + intY;

      var aa = this._p[a] + intZ;
      var ba = this._p[b] + intZ;

      var ab = this._p[a + 1] + intZ;
      var bb = this._p[b + 1] + intZ;


      return _lerp(fadeZ, 
                  _lerp(fadeY, 
                       _lerp(fadeX, this._gradient3d(this._p[aa] , x, y, z), 
                                    this._gradient3d(this._p[ba] , x - 1, y, z)),
                       _lerp(fadeX, this._gradient3d(this._p[ab] , x, y - 1, z), 
                                    this._gradient3d(this._p[bb], x - 1, y - 1, z))),
                  _lerp(fadeY,
                        _lerp(fadeX, this._gradient3d(this._p[aa + 1] , x, y, z - 1), 
                                     this._gradient3d(this._p[ba + 1] , x - 1, y, z - 1)),
                        _lerp(fadeX, this._gradient3d(this._p[ab + 1] , x, y - 1, z - 1), 
                                     this._gradient3d(this._p[bb + 1], x - 1, y - 1, z - 1))));
   }
}