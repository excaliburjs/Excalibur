/// <reference path="Log.ts" />
/// <reference path="Util.ts" />

module ex {
   export interface IObsoleteOptions {
      message?: string;
      alternateMethod?: string;
   } 

   /**
    * Obsolete decorator for marking Excalibur methods obsolete. Inspired by https://github.com/jayphelps/core-decorators.js
    */
   export function obsolete(options?: IObsoleteOptions) {

      options = Util.extend({}, {message: 'This method will be removed in future versions of Excalibur.', alternateMethod: null}, options);

      return function (target: any, property: string, descriptor: PropertyDescriptor) {

         const methodSignature = `${target.constructor.name}.${property}`;

         var message = `${methodSignature} is marked obsolete: ${options.message} \n\n` + 
                        options.alternateMethod ? `Use ${options.alternateMethod} instead` : '';
         ex.Logger.getInstance().warn(message);
      };
   }

}