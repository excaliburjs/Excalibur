export interface Context<TValue> {
  scope: (value: TValue, cb: () => any) => any;
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