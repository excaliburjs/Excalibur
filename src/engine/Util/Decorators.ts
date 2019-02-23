import { Logger } from './Log';
import * as Util from './Util';

/**
 * Obsolete decorator options
 */
export interface ObsoleteOptions {
  // Optionally specify a custom message
  message?: string;
  // Optionally indicate that an alternate method to the obsolete one exists
  alternateMethod?: string;
}

/**
 * Obsolete decorator for marking Excalibur methods obsolete, you can optionally specify a custom message and/or alternate replacement
 * method do the deprecated one. Inspired by https://github.com/jayphelps/core-decorators.js
 */
export function obsolete(options?: ObsoleteOptions): any {
  options = Util.extend({}, { message: 'This feature will be removed in future versions of Excalibur.', alternateMethod: null }, options);

  return function(target: any, property: string, descriptor: PropertyDescriptor): any {
    if (
      descriptor &&
      !(typeof descriptor.value === 'function' || typeof descriptor.get === 'function' || typeof descriptor.set === 'function')
    ) {
      throw new SyntaxError('Only classes/functions/getters/setters can be marked as obsolete');
    }
    const methodSignature = `${target.name || ''}${target.name && property ? '.' : ''}${property ? property : ''}`;

    var message =
      `${methodSignature} is marked obsolete: ${options.message}` +
      (options.alternateMethod ? ` Use ${options.alternateMethod} instead` : '');

    // If descriptor is null it is a class
    let method = descriptor ? { ...descriptor } : target;
    if (!descriptor) {
      let constructor = function() {
        let args = Array.prototype.slice.call(arguments);
        Logger.getInstance().warn(message);
        return new method(...args);
      };
      constructor.prototype = method.prototype;
      return constructor;
    }

    if (descriptor && descriptor.value) {
      method.value = function(this: any) {
        Logger.getInstance().warn(message);
        return descriptor.value.apply(this, arguments);
      };
      return method;
    }

    if (descriptor && descriptor.get) {
      method.get = function(this: any) {
        Logger.getInstance().warn(message);
        return descriptor.get.apply(this, arguments);
      };
    }

    if (descriptor && descriptor.set) {
      method.set = function(this: any) {
        Logger.getInstance().warn(message);
        return descriptor.set.apply(this, arguments);
      };
    }
    return method;
  };
}
