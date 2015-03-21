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
      public speed: number;

      public currentFrame: number = 0;
      private oldTime: number = Date.now();
      
      public anchor = new Point(0.0, 0.0);
      public rotation: number = 0.0;
      public scale = new Point(1, 1);

      /**
       * Indicates whether the animation should loop after it is completed
       * @property [loop=false] {boolean} 
       */
      public loop: boolean = false;
      public freezeFrame: number = -1;

      private engine: Engine;

      public flipVertical: boolean = false;
      public flipHorizontal: boolean = false;
      public width: number = 0;
      public height: number = 0;

      constructor(engine: Engine, images: Sprite[], speed: number, loop?: boolean) {
         this.sprites = images;
         this.speed = speed;
         this.engine = engine;
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

      /**
       * Removes a {{#crossLink Effects.ISpriteEffect}}{{/crossLink}} from this animation.
       * @method removeEffect
       * @param effect {Effects.ISpriteEffect} Effect to remove from this animation
       */
      public removeEffect(effect: Effects.ISpriteEffect): void;
      
      /**
       * Removes an effect given the index from this animation.
       * @method removeEffect
       * @param index {number} Index of the effect to remove from this animation
       */
      public removeEffect(index: number): void;
      public removeEffect(param: any) {
         for(var i in this.sprites){
            this.sprites[i].removeEffect(param);
         }
      }

      public clearEffects(){
         for(var i in this.sprites){
            this.sprites[i].clearEffects();
         }  
      }

      private _setAnchor(point: Point) {
         //if (!this.anchor.equals(point)) {
            for (var i in this.sprites) {
               this.sprites[i].anchor.setTo(point.x, point.y);
            }
         //}
      }

      private _setRotation(radians: number) {
         //if (this.rotation !== radians) {
            for (var i in this.sprites) {
               this.sprites[i].rotation = radians;
            }
         //}
      }
      
      private _setScale(scale: Point) {
         //if (!this.scale.equals(scale)) {
            for (var i in this.sprites) {
               this.sprites[i].scale = scale;
            }
         //}
      }
      
      /**
       * Resets the animation to first frame.
       * @method reset
       */
      public reset() {
         this.currentFrame = 0;
      }

      /**
       * Indicates whether the animation is complete, animations that loop are never complete.
       * @method isDone
       * @returns boolean
       */
      public isDone() {
         return (!this.loop && this.currentFrame >= this.sprites.length);
      }

      /**
       * Not meant to be called by game developers. Ticks the animation forward internally an
       * calculates whether to change to teh frame.
       * @method tick
       */
      public tick() {
         var time = Date.now();
         if ((time - this.oldTime) > this.speed) {
            this.currentFrame = (this.loop ? (this.currentFrame + 1) % this.sprites.length : this.currentFrame + 1);
            this.oldTime = time;
         }
      }

      private _updateValues(): void {
         this._setAnchor(this.anchor);
         this._setRotation(this.rotation);
         this._setScale(this.scale);
      }

      /**
       * Skips ahead a specified number of frames in the animation
       * @method skip
       * @param frames {number} Frames to skip ahead
       */
      public skip(frames: number) {
         this.currentFrame = (this.currentFrame + frames) % this.sprites.length;
      }

      public draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
         this.tick();
         this._updateValues();
         if (this.currentFrame < this.sprites.length) {
            var currSprite = this.sprites[this.currentFrame];
            if (this.flipVertical) {
               currSprite.flipVertical = this.flipVertical;
            }
            if (this.flipHorizontal) {
               currSprite.flipHorizontal = this.flipHorizontal;
            }
            currSprite.draw(ctx, x, y);
         }

         if (this.freezeFrame !== -1 && this.currentFrame >= this.sprites.length) {
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
         this.engine.playAnimation(this, x, y);
      }
    }
}