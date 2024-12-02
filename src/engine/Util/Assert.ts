/**
 * Asserts will throw in `process.env.NODE_ENV === 'development'` builds if the expression evaluates false
 */
export function assert(message: string, expression: () => boolean) {
  if (process.env.NODE_ENV === 'development') {
    if (!expression()) {
      throw new Error(message);
    }
  }
}
