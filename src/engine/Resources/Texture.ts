/// <reference path="../Util/Util.ts" />
/// <reference path="../Promises.ts" />
/// <reference path="Resource.ts" />
/// <reference path="../Interfaces/ILoadable.ts" />

module ex {
   

   /**
    * Textures
    *
    * The [[Texture]] object allows games built in Excalibur to load image resources.
    * [[Texture]] is an [[ILoadable]] which means it can be passed to a [[Loader]]
    * to pre-load before starting a level or game.
    *
    * Textures are the raw image so to add a drawing to a game, you must create
    * a [[Sprite]]. You can use [[Texture.asSprite]] to quickly generate a Sprite
    * instance.
    *
    * ## Pre-loading textures
    *
    * Pass the [[Texture]] to a [[Loader]] to pre-load the asset. Once a [[Texture]]
    * is loaded, you can generate a [[Sprite]] with it.
    *
    * ```js
    * var txPlayer = new ex.Texture("/assets/tx/player.png");
    *
    * var loader = new ex.Loader(txPlayer);
    *
    * game.start(loader).then(function () {
    *
    *   var player = new ex.Actor();
    *
    *   player.addDrawing(txPlayer);
    *
    *   game.add(player);
    * });
    * ```
    */
   export class Texture extends Resource<HTMLImageElement> {

      /**
       * The width of the texture in pixels
       */
      public width: number;

      /**
       * The height of the texture in pixels
       */
      public height: number;

      /**
       * A [[Promise]] that resolves when the Texture is loaded.
       */
      public loaded: Promise<any> = new Promise<any>();

      private _isLoaded: boolean = false;
      private _sprite: Sprite = null;

      /**
       * Populated once loading is complete
       */
      public image: HTMLImageElement;

      private _progressCallback: (progress: number, total: number) => void;
      private _doneCallback: () => void;
      private _errorCallback: (e: string) => void;

      /**
       * @param path       Path to the image resource
       * @param bustCache  Optionally load texture with cache busting
       */
      constructor(public path: string, public bustCache = true) {
         super(path, 'blob', bustCache);
         this._sprite = new Sprite(this, 0, 0, 0, 0);
      }
      

      /**
       * Returns true if the Texture is completely loaded and is ready
       * to be drawn.
       */
      public isLoaded(): boolean {
         return this._isLoaded;
      }

      /**
       * Begins loading the texture and returns a promise to be resolved on completion
       */
      public load(): Promise<HTMLImageElement> {
         var complete = new Promise<HTMLImageElement>();

         var loaded = super.load();
         loaded.then(() => {
            this.image = new Image();
            this.image.addEventListener('load', () => {
               this._isLoaded = true;
               this.width = this._sprite.swidth = this._sprite.naturalWidth = this._sprite.width = this.image.naturalWidth;
               this.height = this._sprite.sheight = this._sprite.naturalHeight = this._sprite.height = this.image.naturalHeight;
               this.loaded.resolve(this.image);
               complete.resolve(this.image);
            });
            this.image.src = super.getData();            
            

         }, () => {
            complete.reject('Error loading texture.');
         });
         return complete;
      }

      public asSprite(): Sprite {
         return this._sprite;
      }

   }
}