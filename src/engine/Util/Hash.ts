

export function getStringHashCode(text: string): number {
  let hash = 0;
  for (let i = 0, len = text.length; i < len; i++) {
    let chr = text.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export function addHash(hash1: number, hash2: number): number {
  return ((hash1 || 0) + (hash2 || 0)) | 0;
}