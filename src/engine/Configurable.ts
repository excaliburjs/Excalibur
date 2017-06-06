export type Constructor<T> = {
   new(...args: any[]): T
}

export function Configurable<T extends Constructor<Object>>(base: T) : T {
      return class extends base {
         public setProperties(props: Partial<T>): this {                 
               for (var k in props) {
                  if (typeof (<any>this)[k] !== 'function') {
                     (<any>this)[k] = (<any>props)[k];
                  }
               }
               return this;
            }

            constructor(...args: any[]) {
               super(...args);
               if (args.length === 1 && typeof args[0] === {}) {
                     this.setProperties(args[0]);
               }
            }

      };
   }