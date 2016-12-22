
module ex {

   const BITMASK32: number = 0xFFFFFFFF;
   /**
    * Pseudo-random number generator following the Mersenne_Twister algorithm. Given a seed this generator will produce the same sequence 
    * of numbers each time it is called.
    * See https://en.wikipedia.org/wiki/Mersenne_Twister for more details.
    * Uses the MT19937-32 implementation
    * 
    * Api inspired by http://chancejs.com/# https://github.com/chancejs/chancejs
    */
   export class Random {
      
      private _lowerMask: number = 0x7FFFFFFF; // 31 bits same as _r
      private _upperMask: number = 0x80000000; // 34 high bits

      // Word size, 64 bits
      private _w: number = 32;

      // Degree of recurrance
      private _n: number = 624;
      
      // Middle word, an offset used in the recurrance defining the series x, 1<=m<n
      private _m: number = 397;
      // Separation point of one one word, the number of bits in the lower bitmask 0 <= r <= w-1
      private _r: number = 31;
      // coefficients of teh rational normal form twist matrix
      private _a: number = 0x9908B0DF;

      // tempering bit shifts and masks
      private _u: number = 11;
      private _s: number = 7;
      private _b: number = 0x9d2c5680;
      private _t: number = 15;
      private _c: number = 0xefc60000;
      private _l: number = 18;
      private _f: number = 1812433253;
      
      private _mt: number[];

      private _index: number;

      /**
       * If no seed is specified, the Date.now() is used
       */
      constructor(public seed?: number) {
         this._mt = new Array<number>(this._n);
         this._mt[0] = (seed || Date.now()) & BITMASK32;

         for (var i = 1; i < this._n; i++) {
            this._mt[i] = (this._f * (this._mt[i - 1] ^ (this._mt[i - 1] >> (this._w - 2))) + i) & BITMASK32;
         }
         this._index = this._n;
      }

      /**
       * Return next 32 bit integer number in sequence
       */
      public nextInt(): number {
         if (this._index >= this._n) {
            this._twist();            
         }

         var y = this._mt[this._index++];

         y ^= y >>> this._u;
         y ^= ((y << this._s) & this._b);
         y ^= ((y << this._t) & this._c);
         y ^= (y >>> this._l);
 
         return y >>> 0;
      }

      /**
       * Return a random floating point number between [0, 1)
       */
      public next(): number {
         return this.nextInt() * (1.0 / 4294967296.0); // divided by 2^32
      }

      /**
       * Return a random floating point in range [min, max) min is included, max is not included
       */
      public floating(min: number, max: number): number {
         return (max - min) * this.next() + min;
      }

      /**
       * Return a random integer in range [min, max] min is included, max is included
       */
      public integer(min: number, max: number): number {
         return Math.floor((max - min + 1) * this.next() + min);
      }

      /**
       * Returns true or false randomly with 50/50 odds by default. 
       * By default the likelihood of returning a true is .5 (50%).
       * @param likelihood takes values between [0, 1]
       */
      public bool(likelihood: number = .5): boolean {
         return this.next() <= likelihood;
      }

      /**
       * Returns the result of a d4 dice roll
       */
      public d4() {
         return this.integer(1, 4);
      }

      /**
       * Returns the result of a d6 dice roll
       */
      public d6() {
         return this.integer(1, 6);
      }

      /**
       * Returns the result of a d8 dice roll
       */
      public d8() {
         return this.integer(1, 8);
      }

      /**
       * Returns the result of a d10 dice roll
       */
      public d10() {
         return this.integer(1, 10);
      }

      /**
       * Returns the result of a d12 dice roll
       */
      public d12() {
         return this.integer(1, 12);
      }

      /**
       * Returns the result of a d20 dice roll
       */
      public d20() {
         return this.integer(1, 20);
      }


      /**
       * Apply the twist
       */
      private _twist(): void {
         for (var i = 0; i < this._n; i++) {
            let x = (this._mt[i] & this._upperMask) + (this._mt[(i + 1) % this._n] & this._lowerMask);
            let xA = x >> 1;
            if ( x & 0x1 ) {
               xA ^= this._a;
            }
            this._mt[i] = this._mt[(i + this._m) % this._m] ^ xA;
        }
        this._index = 0;
      }
      
   }
}