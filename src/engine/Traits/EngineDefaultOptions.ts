import { Vector } from '../Index';

export interface IActorsDefaultOptions {
   anchor: Vector;
}

/**
 * Singleton [[EngineDefaultOptions]] which provides access to global options.
 */
export default class EngineDefaultOptions {
   /**
    * Acotrs default configuration options;
    */
   public actors: IActorsDefaultOptions = {
      anchor: Vector.Half
   };

   private static _INSTANCE: EngineDefaultOptions;

   private constructor() { /** Forbidden */ };

   /**
    * Returns instance of [[EngineDefaultOptions]]
    */
   public static getInstance(): EngineDefaultOptions {
      if (!this._INSTANCE) {
         this._INSTANCE = new EngineDefaultOptions();
      }

      return this._INSTANCE;
   }
}