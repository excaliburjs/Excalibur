import { extend } from '.././Util/Util';

export type Constructor<T> = new (...args: any[]) => T;

export function ConfigurableWithBaseClass<T extends Constructor<{}>, TDefaultProps>(Base: T, defaults: TDefaultProps) : T {
   return (class extends Base {
      public getDefaults(): Partial<TDefaultProps> {
         return defaults;
      }

      public setProperties(props?: Partial<TDefaultProps>): this {

         var mergedProperties = extend(this.getDefaults(), props);

            for (var k in mergedProperties) {
               if (typeof (<any>this)[k] !== 'function') {
                  (<any>this)[k] = mergedProperties[k];
               }
            }
            return this;
         }

            constructor(...args: any[]) {
               super(...args);
               this.setProperties(args[0]);
            }
         });
}

export abstract class Configurable<T> {
         abstract getDefaults(): Partial<T>;

         public setProperties(props: Partial<T>): this {

            var mergedProperties = extend(this.getDefaults(), props);
                  
                  for (var k in mergedProperties) {
                     if (typeof (<any>this)[k] !== 'function') {
                        (<any>this)[k] = mergedProperties[k];
                     }
                  }
                  return this;
            }

            constructor();
            constructor(options?: Partial<T>) {
               this.setProperties(options || {});
            }

   }


