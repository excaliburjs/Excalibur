export type Constructor<T> = {
  new (...args: any[]): T;
};
/**
 * Configurable helper extends base type and makes all properties available as option bag arguments
 * @internal
 * @param base
 */
export function Configurable<T extends Constructor<{}>>(base: T): T {
  return class extends base {
    public assign(props: Partial<T>) {
      //set the value of every property that was passed in,
      //if the constructor previously set this value, it will be overridden here
      for (const k in props) {
        // eslint-disable-next-line
        if (typeof (<any>this)[k] !== 'function') {
          // eslint-disable-next-line
          (<any>this)[k] = (<any>props)[k];
        }
      }
    }

    constructor(...args: any[]) {
      super(...args);
      //get the number of arguments that aren't undefined. TS passes a value to all parameters
      //of whatever ctor is the implementation, so args.length doesn't work here.
      const size = args.filter(function(value) {
        return value !== undefined;
      }).length;
      if (size === 1 && args[0] && typeof args[0] === 'object' && !(args[0] instanceof Array)) {
        this.assign(args[0]);
      }
    }
  };
}
