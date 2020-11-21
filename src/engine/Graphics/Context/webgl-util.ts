/**
 * Checks if the current number is a power of two
 */
export function isPowerOfTwo(x: number): boolean {
  return (x & (x - 1)) === 0;
}

/**
 * Returns the next highest power of two
 */
export function nextHighestPowerOfTwo(x: number): number {
  --x;
  for (let i = 1; i < 32; i <<= 1) {
    x = x | (x >> i);
  }
  return x + 1;
}

/**
 * Returns the input number if a power of two, otherwise the next highest power of two
 */
export function ensurePowerOfTwo(x: number): number {
  if (!isPowerOfTwo(x)) {
    return nextHighestPowerOfTwo(x);
  }
  return x;
}
