export type Id<T extends string> = {
  type: T,
  value: number
};

export function createId<T extends string>(type: T, value: number): Id<T> {
  return { type, value }
};
