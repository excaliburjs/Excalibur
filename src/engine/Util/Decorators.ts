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
  // Optional show stack trace, by default off
  showStackTrace?: boolean;
}

export const maxMessages = 5;
let obsoleteMessage: { [messageCount: string]: number } = {};
export const resetObsoleteCounter = () => {
  for (const message in obsoleteMessage) {
    obsoleteMessage[message] = 0;
  }
};

const logMessage = (message: string, options: ObsoleteOptions) => {
  if (obsoleteMessage[message] < maxMessages) {
    Logger.getInstance().warn(message);

    // tslint:disable-next-line: no-console
    if (console.trace && options.showStackTrace) {
      // tslint:disable-next-line: no-console
      console.trace();
    }
  }
  obsoleteMessage[message]++;
};

/**
 * Obsolete decorator for marking Excalibur methods obsolete, you can optionally specify a custom message and/or alternate replacement
 * method do the deprecated one. Inspired by https://github.com/jayphelps/core-decorators.js
 */
export function obsolete(options?: ObsoleteOptions): any {
  options = Util.extend(
    {},
    {
      message: 'This feature will be removed in future versions of Excalibur.',
      alternateMethod: null,
      showStackTrack: false
    },
    options
  );

  return function(target: any, property: string, descriptor: PropertyDescriptor): any {
    if (
      descriptor &&
      !(typeof descriptor.value === 'function' || typeof descriptor.get === 'function' || typeof descriptor.set === 'function')
    ) {
      throw new SyntaxError('Only classes/functions/getters/setters can be marked as obsolete');
    }
    const methodSignature = `${target.name || ''}${target.name && property ? '.' : ''}${property ? property : ''}`;

    const message =
      `${methodSignature} is marked obsolete: ${options.message}` +
      (options.alternateMethod ? ` Use ${options.alternateMethod} instead` : '');

    if (!obsoleteMessage[message]) {
      obsoleteMessage[message] = 0;
    }

    // If descriptor is null it is a class
    const method = descriptor ? { ...descriptor } : target;
    if (!descriptor) {
      const constructor = function() {
        const args = Array.prototype.slice.call(arguments);
        logMessage(message, options);
        return new method(...args);
      };
      constructor.prototype = method.prototype;
      return constructor;
    }

    if (descriptor && descriptor.value) {
      method.value = function(this: any) {
        logMessage(message, options);
        return descriptor.value.apply(this, arguments);
      };
      return method;
    }

    if (descriptor && descriptor.get) {
      method.get = function(this: any) {
        logMessage(message, options);
        return descriptor.get.apply(this, arguments);
      };
    }

    if (descriptor && descriptor.set) {
      method.set = function(this: any) {
        logMessage(message, options);
        return descriptor.set.apply(this, arguments);
      };
    }
    return method;
  };
}
