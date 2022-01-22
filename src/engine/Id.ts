export type Id<T extends string> = {
  type: T,
  value: number
};

/**
 * Create a branded ID type from a number
 */
export function createId<T extends string>(type: T, value: number): Id<T> {
  return { type, value };
};
