export function isPowerOfTwo(x: number) {
  return (x & (x - 1)) == 0;
}

export function nextHighestPowerOfTwo(x: number) {
  --x;
  for (var i = 1; i < 32; i <<= 1) {
    x = x | (x >> i);
  }
  return x + 1;
}

export function ensurePowerOfTwo(x: number) {
  if (!isPowerOfTwo(x)) {
    return nextHighestPowerOfTwo(x);
  }
  return x;
}
