export interface Context<TValue> {
  /**
   * Run the callback before popping the context value
   * @param value
   * @param cb
   */
  scope: <TReturn>(value: TValue, cb: () => TReturn) => TReturn;
  value: TValue;
}

/**
 * Creates a injectable context that can be retrieved later with `useContext(context)`
 *
 * Example
 * ```typescript
 *
 * const AppContext = createContext({some: 'value'});
 * context.scope(val, () => {
 *    const value = useContext(AppContext);
 * })
 *
 * ```
 */
export function createContext<TValue>() {
  const ctx: Context<TValue> = {
    scope: (value, cb) => {
      const old = ctx.value;
      ctx.value = value;
      try {
        return cb();
      } catch (e) {
        throw e;
      } finally {
        ctx.value = old;
      }
    },
    value: undefined
  };
  return ctx;
}

/**
 * Retrieves the value from the current context
 */
export function useContext<TValue>(context: Context<TValue>): TValue {
  return context.value;
}
