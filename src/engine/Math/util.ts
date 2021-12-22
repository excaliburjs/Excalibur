/**
 * Returns the fractional part of a number
 * @param x
 */
export function frac(x: number): number {
  if (x >= 0) {
    return x - Math.floor(x);
  } else {
    return x - Math.ceil(x);
  }
}

/**
 * Returns the sign of a number, if 0 returns 0
 */
export function sign(val: number): number {
  if (val === 0) {
    return 0;
  }
  return val < 0 ? -1 : 1;
};