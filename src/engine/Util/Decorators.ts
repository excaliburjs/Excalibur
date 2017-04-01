import { Logger } from './Log';
import * as Util from './Util';

/**
 * Obsolete decorator options
 */
export interface IObsoleteOptions {
   // Optionally specify a custom message
   message?: string;
   // Optionally indicate that an alternate method to the obsolete one exists
   alternateMethod?: string;
} 

/**
 * Obsolete decorator for marking Excalibur methods obsolete, you can optionally specify a custom message and/or alternate replacement
 * method do the deprecated one. Inspired by https://github.com/jayphelps/core-decorators.js
 */
export function obsolete(options?: IObsoleteOptions) {

   options = Util.extend({}, {message: 'This method will be removed in future versions of Excalibur.', alternateMethod: null}, options);

   return function (target: any, property: string, descriptor: PropertyDescriptor): any {
      if (!(typeof descriptor.value === 'function' || 
            typeof descriptor.get   === 'function' ||
            typeof descriptor.set   === 'function')) {
         throw new SyntaxError('Only functions/getters/setters can be marked as obsolete');
      }
      const methodSignature = `${target.name || ''}${target.name ? '.' : ''}${property}`;

      var message = `${methodSignature} is marked obsolete: ${options.message}` + 
                     (options.alternateMethod ? ` Use ${options.alternateMethod} instead` : '');
      
      let method = Util.extend({}, descriptor);

      if (descriptor.value) {
         method.value = function(this: any) {
            Logger.getInstance().warn(message);
            return descriptor.value.apply(this, arguments);
         };             
         return method;
      }

      if (descriptor.get) {
         method.get = function(this: any) {
            Logger.getInstance().warn(message);
            return descriptor.get.apply(this, arguments);
         };
      }

      if (descriptor.set) {
         method.set = function(this: any) {
            Logger.getInstance().warn(message);
            return descriptor.set.apply(this, arguments);
         };            
      }
      return method;
   };
}