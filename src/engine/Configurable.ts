export type Constructor<T> = {
   new(...args: any[]): T;
}

export interface IDefaultable<T> {
   getDefaultPropVals(): Partial<T>; 
}

export function Configurable<T extends Constructor<IDefaultable<T>>>(base: T) : T {
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

         private _setDefaultsIfUndefined() { 
               //set default property values only if they WEREN'T set
               //by either the passed in properties or the constructor
               var defaults = this.getDefaultPropVals();

               for (var i in defaults) {
                  if (typeof (<any>this)[i] === 'undefined') {
                     (<any>this)[i] = (<any>defaults)[i];
                  }
               }
         }

         private _initWithOptions(options: Partial<T>) {
            this.assign(options);
            this._setDefaultsIfUndefined();
         }

         constructor(...args: any[]) {
            super(...args);
            //get the number of arguments that aren't undefined. TS passes a value to all parameters
            //of whatever ctor is the implementation, so args.length doesn't work here.
            var size = args.filter(function(value) { return value !== undefined; }).length;
            if (size === 1 && args[0] && typeof args[0] === 'object' && !(args[0] instanceof Array)) {
                  this._initWithOptions(args[0]);
            }else {
                  this._setDefaultsIfUndefined();
            }
         }

      };
   }