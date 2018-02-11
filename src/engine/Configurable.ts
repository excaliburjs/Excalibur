export type Constructor<T> = {
   new(...args: any[]): T;
}
export function Configurable<T extends Constructor<{}>>(base: T): T {
   return class extends base {
      public assign(props: Partial<T>) {

         //set the value of every property that was passed in,
         //if the constructor previously set this value, it will be overridden here
         for (var k in props) {
            if (typeof (<any>this)[k] !== 'function') {
               (<any>this)[k] = (<any>props)[k];
            }
         }
      }

      constructor(...args: any[]) {
         super(...args);
         //get the number of arguments that aren't undefined. TS passes a value to all parameters
         //of whatever ctor is the implementation, so args.length doesn't work here.
         var size = args.filter(function (value) { return value !== undefined; }).length;
         if (size === 1 && args[0] && typeof args[0] === 'object' && !(args[0] instanceof Array)) {
            this.assign(args[0]);
         }
      }

   };
}