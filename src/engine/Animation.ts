module ex {
   /**
    * Animations allow you to display a series of images one after another,
    * creating the illusion of change. Generally these images will come from a sprite sheet source.
    * @class Animation
    * @extends IDrawable
    * @constructor
    * @param engine {Engine} Reference to the current game engine
    * @param images {Sprite[]} An array of sprites to create the frames for the animation
    * @param speed {number} The number in milliseconds to display each frame in the animation
    * @param [loop=false] {boolean} Indicates whether the animation should loop after it is completed
    */
   export class Animation implements IDrawable {
      public sprites: Sprite[];
      private _speed: number;
      private _currIndex: number = 0;
      private _oldTime: number = Date.now();
      private _rotation: number = 0.0;
      private _scaleX: number = 1.0;
      private _scaleY: number = 1.0;
      /**
       * Indicates whether the animation should loop after it is completed
       * @property [loop=false] {boolean} 
       */
      public loop: boolean = false;
      public freezeFrame: number = -1;
      private _engine: Engine;

      public flipVertical: boolean = false;
      public flipHorizontal: boolean = false;
      public width: number = 0;
      public height: number = 0;

      constructor(engine: Engine, images: Sprite[], speed: number, loop?: boolean) {
         this.sprites = images;
         this._speed = speed;
         this._engine = engine;
         if (loop != null) {
            this.loop = loop;
         }
         this.height = images[0] ? images[0].height : 0;
         this.width = images[0] ? images[0].width : 0;
      }

      public addEffect(effect: Effects.ISpriteEffect){
         for(var i in this.sprites){
            this.sprites[i].addEffect(effect);
         }
      }

      public clearEffects(){
         for(var i in this.sprites){
            this.sprites[i].clearEffects();
         }  
      }

      public transformAboutPoint(point: Point) {
         for (var i in this.sprites) {
            this.sprites[i].transformAboutPoint(point);
         }
      }

      public setRotation(radians: number) {
         this._rotation = radians;
         for (var i in this.sprites) {
            this.sprites[i].setRotation(radians);
         }
      }

      public getRotation(): number {
         return this._rotation;
      }

      public setScaleX(scaleX: number) {
         this._scaleX = scaleX;
         for (var i in this.sprites) {
            this.sprites[i].setScaleX(scaleX);
         }
      }

      public setScaleY(scaleY: number) {
         this._scaleY = scaleY;
         for (var i in this.sprites) {
            this.sprites[i].setScaleY(scaleY);
         }
      }

      public getScaleX(): number {
         return this._scaleX;
      }

      public getScaleY(): number {
         return this._scaleY;
      }

      /**
       * Resets the animation to first frame.
       * @method reset
       */
      public reset() {
         this._currIndex = 0;
      }

      /**
       * Indicates whether the animation is complete, animations that loop are never complete.
       * @method isDone
       * @returns boolean
       */
      public isDone() {
         return (!this.loop && this._currIndex >= this.sprites.length);
      }

      /**
       * Not meant to be called by game developers. Ticks the animation forward internally an
       * calculates whether to change to teh frame.
       * @method tick
       */
      public tick() {
         var time = Date.now();
         if ((time - this._oldTime) > this._speed) {
            this._currIndex = (this.loop ? (this._currIndex + 1) % this.sprites.length : this._currIndex + 1);
            this._oldTime = time;
         }
      }

      /**
       * Skips ahead a specified number of frames in the animation
       * @method skip
       * @param frames {number} Frames to skip ahead
       */
      public skip(frames: number) {
         this._currIndex = (this._currIndex + frames) % this.sprites.length;
      }

      public draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
         this.tick();
         if (this._currIndex < this.sprites.length) {
            var currSprite = this.sprites[this._currIndex];
            if (this.flipVertical) {
               currSprite.flipVertical = this.flipVertical;
            }
            if (this.flipHorizontal) {
               currSprite.flipHorizontal = this.flipHorizontal;
            }
            currSprite.draw(ctx, x, y);
         }

         if (this.freezeFrame !== -1 && this._currIndex >= this.sprites.length) {
            var currSprite = this.sprites[Util.clamp(this.freezeFrame, 0, this.sprites.length - 1)];
            currSprite.draw(ctx, x, y);
         }
      }

      /**
       * Plays an animation at an arbitrary location in the game.
       * @method play
       * @param x {number} The x position in the game to play
       * @param y {number} The y position in the game to play
       */
      public play(x: number, y: number) {
         this.reset();
         this._engine.playAnimation(this, x, y);
      }
    }
}