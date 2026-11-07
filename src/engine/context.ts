export interface Context<TValue> {
  /**
   * Run the callback before popping the context value
   * @param value
   * @param cb
   */
  scope: <TReturn>(value: TValue, cb: () => TReturn) => TReturn;
  /**
   * The current value, `undefined` when outside of any scope
   */
  readonly value: TValue | undefined;
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
 *
 * ### Async callbacks
 *
 * JavaScript has no built in async-local storage in the browser yet (https://github.com/tc39/proposal-async-context),
 * so after an `await` there is no way to know which scope the continuation belongs to. To keep `useContext()` working
 * after an `await`, a scope whose callback returns a promise stays active until that promise settles:
 *
 * - Synchronous scopes always win, `useContext()` called while a (nested) sync scope is running returns that scope's value.
 * - Otherwise `useContext()` returns the value of the most recently started async scope that is still pending.
 *
 * If several async scopes with different values are pending at once (for example 2 engines loading at the same time)
 * code running after an `await` may see the most recent one, in that case pass the value explicitly instead.
 */
export function createContext<TValue>() {
  // Currently running synchronous scopes, innermost last
  const syncStack: TValue[] = [];
  // Async scopes that returned a promise that hasn't settled yet, most recently started last
  const pending: { value: TValue }[] = [];

  const ctx: Context<TValue> = {
    scope: (value, cb) => {
      let result: any;
      syncStack.push(value);
      try {
        result = cb();
      } finally {
        syncStack.pop();
      }

      if (result && typeof result.then === 'function') {
        const entry = { value };
        pending.push(entry);
        const remove = () => {
          const index = pending.indexOf(entry);
          if (index > -1) {
            pending.splice(index, 1);
          }
        };
        return result.then(
          (resolved: any) => {
            remove();
            return resolved;
          },
          (error: unknown) => {
            remove();
            throw error;
          }
        );
      }

      return result;
    },
    get value() {
      if (syncStack.length) {
        return syncStack[syncStack.length - 1];
      }
      if (pending.length) {
        return pending[pending.length - 1].value;
      }
      return undefined;
    }
  };
  return ctx;
}

/**
 * Retrieves the value from the current context
 */
export function useContext<TValue>(context: Context<TValue>): TValue | undefined {
  return context.value;
}
