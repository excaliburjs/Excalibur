export class AudioContextFactory {
   public static create() {
      if ((<any>window).AudioContext || (<any>window).webkitAudioContext) {
         return new (<any>window).AudioContext() || new (<any>window).webkitAudioContext();
      }
   }
}

export class AudioContextOperator {
   public get currentAudioCtxt(): AudioContext {
      return this._currentAudioCtxt;
   }

   public get contextsCount(): number {
      return this._elements.length;
   }

   private _currentAudioCtxt: AudioContext = null;
   private _elements: AudioContext[] = [];
   private static _INSTANCE: AudioContextOperator = null;

   private constructor() {
      /**
       * Forbidden
       */

      this.setCurrentAudioCtxt(this.addNewAudioContext());
   }

   /**
    * Returns true if provided element is valid instance of [[AudioContext]]
    */
   public static isValidAudioContext(ctxt: AudioContext): boolean {
      return ctxt instanceof AudioContext;
   }

   /**
    * Returns instance of [[AudioContextOperator]] Singleton
    */
   public static getInstance(): AudioContextOperator {
      return AudioContextOperator._INSTANCE || (AudioContextOperator._INSTANCE = new AudioContextOperator());
   }

   /**
    * Returns brand new [[AudioContext]]
    */
   public addNewAudioContext(): AudioContext {
      const newCtxt = this._createNewAudioContext();

      this._addAudioCtxt(newCtxt);

      return newCtxt;
   }

   /**
    * Sets provided [[AudioContext]] as current active.
    * @param ctxt [[AudioContext]] to be set as current active
    */
   public setCurrentAudioCtxt(ctxt: AudioContext): void {
      if (!AudioContextOperator.isValidAudioContext(ctxt)) {
         return;
      }

      if (!this._getAudioCtxtId) {
         this._addAudioCtxt(ctxt);
      }

      this._currentAudioCtxt = ctxt;
   }

   private _addAudioCtxt(ctxt: AudioContext): void {
      if (!this._getAudioCtxtId(ctxt)) {
         this._elements.push(ctxt);
      }
   }

   private _getAudioCtxtId(ctxt: AudioContext): number {
      const id = this._elements.indexOf(ctxt);

      return (id > -1) ? id : null;
   }

   // private _getAudioCtxtByIndex(index: number): AudioContext {
   //    return this._elements[index];
   // }

   // private _removeAudioCtxt(ctxt: AudioContext): void {
   //    const ctxtId = this._getAudioCtxtId(ctxt);

   //    if (!ctxtId) {
   //       return;
   //    }

   //    this._elements.splice(ctxtId, 1);
   // }

   private _createNewAudioContext(): AudioContext {
      return AudioContextFactory.create();
   }
}