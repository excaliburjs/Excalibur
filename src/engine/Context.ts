export interface Context<TValue> {
  /**
   * Run the callback before popping the context value
   * @param value
   * @param cb
   */
  scope: (value: TValue, cb: () => any) => any;
  /**
   * Wait for async cb to finish before popping the context value
   * @param value
   * @param cb
   * @returns
   */
  scopeAsync: (value: TValue, cb: () => Promise<any>) => Promise<any>;
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
export function createContext<TValue>(defaultValue: TValue) {
  const currentValue = defaultValue;
  const ctx: Context<TValue> = {
    scope: (value, cb) => {
      const old = ctx.value;
      ctx.value = value;
      const val = cb();
      ctx.value = old;
      return val;
    },
    scopeAsync: async (value, cb) => {
      const old = ctx.value;
      ctx.value = value;
      const val = await cb();
      ctx.value = old;
      return val;
    },
    value: currentValue
  };
  return ctx;
}

/**
 * Retrieves the value from the current context
 */
export function useContext<TValue>(context: Context<TValue>): TValue {
  return context.value;
}