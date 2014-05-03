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
      private sprites: Sprite[];
      private speed: number;
      private currIndex: number = 0;
      private oldTime: number = Date.now();
      private rotation: number = 0.0;
      private scaleX: number = 1.0;
      private scaleY: number = 1.0;
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
         this.rotation = radians;
         for (var i in this.sprites) {
            this.sprites[i].setRotation(radians);
         }
      }

      public getRotation(): number {
         return this.rotation;
      }

      public setScaleX(scaleX: number) {
         this.scaleX = scaleX;
         for (var i in this.sprites) {
            this.sprites[i].setScaleX(scaleX);
         }
      }

      public setScaleY(scaleY: number) {
         this.scaleY = scaleY;
         for (var i in this.sprites) {
            this.sprites[i].setScaleY(scaleY);
         }
      }

      public getScaleX(): number {
         return this.scaleX;
      }

      public getScaleY(): number {
         return this.scaleY;
      }

      /**
       * Resets the animation to first frame.
       * @method reset
       */
      public reset() {
         this.currIndex = 0;
      }

      /**
       * Indicates whether the animation is complete, animations that loop are never complete.
       * @method isDone
       * @returns boolean
       */
      public isDone() {
         return (!this.loop && this.currIndex >= this.sprites.length);
      }

      /**
       * Not meant to be called by game developers. Ticks the animation forward internally an
       * calculates whether to change to teh frame.
       * @method tick
       */
      public tick() {
         var time = Date.now();
         if ((time - this.oldTime) > this.speed) {
            this.currIndex = (this.loop ? (this.currIndex + 1) % this.sprites.length : this.currIndex + 1);
            this.oldTime = time;
         }
      }

      public draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
         this.tick();
         if (this.currIndex < this.sprites.length) {
            var currSprite = this.sprites[this.currIndex];
            if (this.flipVertical) {
               currSprite.flipVertical = this.flipVertical;
            }
            if (this.flipHorizontal) {
               currSprite.flipHorizontal = this.flipHorizontal;
            }
            currSprite.draw(ctx, x, y);
         }

         if (this.freezeFrame !== -1 && this.currIndex >= this.sprites.length) {
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