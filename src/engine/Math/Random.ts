/**
 * Pseudo-Random Utility
 *
 * A pseudo-random utility to add seeded random support for help in
 * generating things like terrain or reproducible randomness. Uses the
 * [Mersenne Twister](https://en.wikipedia.org/wiki/Mersenne_Twister) algorithm.
 */

/**
 * 32-bit mask
 */
const BITMASK32: number = 0xffffffff;

/**
 * Pseudo-random number generator following the Mersenne_Twister algorithm. Given a seed this generator will produce the same sequence
 * of numbers each time it is called.
 * See https://en.wikipedia.org/wiki/Mersenne_Twister for more details.
 * Uses the MT19937-32 (2002) implementation documented here http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/MT2002/emt19937ar.html
 *
 * Api inspired by http://chancejs.com/# https://github.com/chancejs/chancejs
 */
export class Random {
  // Separation point of one one word, the number of bits in the lower bitmask 0 <= r <= w-1
  private _lowerMask: number = 0x7fffffff; // 31 bits same as _r
  private _upperMask: number = 0x80000000; // 34 high bits

  // Word size, 64 bits
  private _w: number = 32;

  // Degree of recurrence
  private _n: number = 624;

  // Middle word, an offset used in the recurrence defining the series x, 1<=m<n
  private _m: number = 397;
  // coefficients of teh rational normal form twist matrix
  private _a: number = 0x9908b0df;

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
    // need to mask to support higher bit machines
    this._mt[0] = (seed || Date.now()) >>> 0;

    for (let i = 1; i < this._n; i++) {
      const s = this._mt[i - 1] ^ (this._mt[i - 1] >>> (this._w - 2));
      // numbers are bigger than the JS max safe int, add in 16-bit chunks to prevent IEEE rounding errors on high bits
      this._mt[i] = (((this._f * ((s & 0xffff0000) >>> 16)) << 16) + this._f * (s & 0xffff) + i) >>> 0;
    }
    this._index = this._n;
  }

  /**
   * Apply the twist
   */
  private _twist(): void {
    const mag01 = [0x0, this._a];
    let y = 0,
      i = 0;
    for (; i < this._n - this._m; i++) {
      y = (this._mt[i] & this._upperMask) | (this._mt[i + 1] & this._lowerMask);
      this._mt[i] = this._mt[i + this._m] ^ (y >>> 1) ^ (mag01[y & 0x1] & BITMASK32);
    }
    for (; i < this._n - 1; i++) {
      y = (this._mt[i] & this._upperMask) | (this._mt[i + 1] & this._lowerMask);
      this._mt[i] = this._mt[i + (this._m - this._n)] ^ (y >>> 1) ^ (mag01[y & 0x1] & BITMASK32);
    }
    y = (this._mt[this._n - 1] & this._upperMask) | (this._mt[0] & this._lowerMask);
    this._mt[this._n - 1] = this._mt[this._m - 1] ^ (y >>> 1) ^ (mag01[y & 0x1] & BITMASK32);

    this._index = 0;
  }

  /**
   * Return next 32 bit integer number in sequence
   */
  public nextInt(): number {
    if (this._index >= this._n) {
      this._twist();
    }

    let y = this._mt[this._index++];

    y ^= y >>> this._u;
    y ^= (y << this._s) & this._b;
    y ^= (y << this._t) & this._c;
    y ^= y >>> this._l;

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
   * Return a random integer in range [min, max] min is included, max is included.
   * Implemented with rejection sampling, see https://medium.com/@betable/tifu-by-using-math-random-f1c308c4fd9d#.i13tdiu5a
   */
  public integer(min: number, max: number): number {
    return Math.floor((max - min + 1) * this.next() + min);
  }

  /**
   * Returns true or false randomly with 50/50 odds by default.
   * By default the likelihood of returning a true is .5 (50%).
   * @param likelihood takes values between [0, 1]
   */
  public bool(likelihood: number = 0.5): boolean {
    return this.next() <= likelihood;
  }

  /**
   * Returns one element from an array at random
   */
  public pickOne<T>(array: Array<T>): T {
    return array[this.integer(0, array.length - 1)];
  }

  /**
   * Returns a new array random picking elements from the original
   * @param array Original array to pick from
   * @param numPicks can be any positive number
   * @param allowDuplicates indicates whether the returned set is allowed duplicates (it does not mean there will always be duplicates
   * just that it is possible)
   */
  public pickSet<T>(array: Array<T>, numPicks: number, allowDuplicates: boolean = false): Array<T> {
    if (allowDuplicates) {
      return this._pickSetWithDuplicates(array, numPicks);
    } else {
      return this._pickSetWithoutDuplicates(array, numPicks);
    }
  }

  /**
   * Returns a new array randomly picking elements in the original (not reused)
   * @param array Array to pick elements out of
   * @param numPicks must be less than or equal to the number of elements in the array.
   */
  private _pickSetWithoutDuplicates<T>(array: Array<T>, numPicks: number): Array<T> {
    if (numPicks > array.length || numPicks < 0) {
      throw new Error('Invalid number of elements to pick, must pick a value 0 < n <= length');
    }
    if (numPicks === array.length) {
      return array;
    }

    const result: Array<T> = new Array<T>(numPicks);
    let currentPick = 0;
    const tempArray = array.slice(0);
    while (currentPick < numPicks) {
      const index = this.integer(0, tempArray.length - 1);
      result[currentPick++] = tempArray[index];
      tempArray.splice(index, 1);
    }

    return result;
  }

  /**
   * Returns a new array random picking elements from the original allowing duplicates
   * @param array Array to pick elements out of
   * @param numPicks can be any positive number
   */
  private _pickSetWithDuplicates<T>(array: Array<T>, numPicks: number): Array<T> {
    // Typescript numbers are all floating point, so do we add check for int? (or floor the input?)
    if (numPicks < 0) {
      throw new Error('Invalid number of elements to pick, must pick a value 0 <= n < MAX_INT');
    }
    const result = new Array<T>(numPicks);
    for (let i = 0; i < numPicks; i++) {
      result[i] = this.pickOne(array);
    }
    return result;
  }

  /**
   * Returns a new array that has its elements shuffled. Using the Fisher/Yates method
   * https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
   */
  public shuffle<T>(array: Array<T>): Array<T> {
    const tempArray = array.slice(0);
    let swap: T = null;
    for (let i = 0; i < tempArray.length - 2; i++) {
      const randomIndex = this.integer(i, tempArray.length - 1);
      swap = tempArray[i];
      tempArray[i] = tempArray[randomIndex];
      tempArray[randomIndex] = swap;
    }

    return tempArray;
  }

  /**
   * Generate a list of random integer numbers
   * @param length the length of the final array
   * @param min the minimum integer number to generate inclusive
   * @param max the maximum integer number to generate inclusive
   */
  public range(length: number, min: number, max: number): Array<number> {
    const result: Array<number> = new Array(length);
    for (let i = 0; i < length; i++) {
      result[i] = this.integer(min, max);
    }
    return result;
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
}
