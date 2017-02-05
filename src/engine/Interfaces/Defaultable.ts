import { extend } from '.././Util/Util';

export abstract class Defaultable<T> {
   abstract defaults: Partial<T>;

   public setProperties(instance: Defaultable<T>, props?: Partial<T>): Defaultable<T> {

      var mergedProperties = extend(instance.defaults, props);

      for (var k in mergedProperties) {
         if (typeof <any>instance[k] !== 'function') {
            (<any>instance)[k] = mergedProperties[k];
         }
      }
      return <Defaultable<T>>instance;
   }

   public resetProperties() {
      this.setProperties(this);
   }
}