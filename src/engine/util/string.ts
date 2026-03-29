/**
 * 32 bit FNV-1a hash
 * Ref.: http://isthe.com/chongo/tech/comp/fnv/
 */
export function hashString(str: string): number {
  // var for speed
  let hval = 0x811c9dc5; // magic seed
  for (let i = 0; i < str.length; ++i) {
    hval ^= str.charCodeAt(i);
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  return hval >>> 0;
}

export function combineHashes(...hashes: number[]): number {
  let combined = 0;
  for (const hash of hashes) {
    combined = ((combined << 5) + combined) ^ hash;
  }
  return combined | 0;
}
