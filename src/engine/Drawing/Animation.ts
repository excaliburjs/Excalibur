import { Sprite } from './Sprite';
import { IAnimationArgs } from '../Drawing/Animation';
import * as Effects from './SpriteEffects';
import { Color } from './Color';

import { IDrawable } from '../Interfaces/IDrawable';
import { Vector } from '../Algebra';
import { Engine } from '../Engine';
import * as Util from '../Util/Util';
import { Configurable } from '../Configurable';

/**
 * @hidden
 */
export class AnimationImpl implements IDrawable {

   /**
    * The sprite frames to play, in order. See [[SpriteSheet.getAnimationForAll]] to quickly
    * generate an [[Animation]].
    */
   public sprites: Sprite[] = [];

   /**
    * Duration to show each frame (in milliseconds)
    */
   public speed: number;

   /**
    * Current frame index being shown
    */
   public currentFrame: number = 0;

   private _oldTime: number = Date.now();
   
   public anchor: Vector = new Vector(0.0, 0.0);
   public rotation: number = 0.0;
   public scale: Vector = new Vector(1, 1);

   /**
    * Indicates whether the animation should loop after it is completed
    */
   public loop: boolean = true;

   /**
    * Indicates the frame index the animation should freeze on for a non-looping
    * animation. By default it is the last frame.
    */
   public freezeFrame: number = -1;

   private _engine: Engine;

   /**
    * Flip each frame vertically. Sets [[Sprite.flipVertical]].
    */
   public flipVertical: boolean = false;

   /**
    * Flip each frame horizontally. Sets [[Sprite.flipHorizontal]].
    */
   public flipHorizontal: boolean = false;
   
   public width: number = 0;
   public height: number= 0;
   public naturalWidth: number = 0;
   public naturalHeight: number = 0;

   /**
    * Typically you will use a [[SpriteSheet]] to generate an [[Animation]].
    *
    * @param engine  Reference to the current game engine
    * @param images  An array of sprites to create the frames for the animation
    * @param speed   The number in milliseconds to display each frame in the animation
    * @param loop    Indicates whether the animation should loop after it is completed
    */
   constructor(engineOrConfig: Engine | IAnimationArgs, images: Sprite[], speed: number, loop?: boolean) {
      
      var engine = engineOrConfig;
      if (engineOrConfig && !(engineOrConfig instanceof Engine)) {
         var config = engineOrConfig;
         engine = config.engine;
         images = config.images;
         speed = config.speed;
         loop = config.loop;
      }
      
      this.sprites = images;
      this.speed = speed;
      this._engine = <Engine>engine;
      
      if (loop != null) {
         this.loop = loop;
      }
      
      if (images && images[0]) {
         this.height = images[0] ? images[0].height : 0;
         this.width = images[0] ? images[0].width : 0;
         
         this.naturalWidth = images[0] ? images[0].naturalWidth : 0;
         this.naturalHeight = images[0] ? images[0].naturalHeight : 0;

         this.freezeFrame = images.length - 1;
      }

   }

   /**
    * Applies the opacity effect to a sprite, setting the alpha of all pixels to a given value
    */
   public opacity(value: number) {
      this.addEffect(new Effects.Opacity(value));
   }

   /**
    * Applies the grayscale effect to a sprite, removing color information.
    */
   public grayscale() {
      this.addEffect(new Effects.Grayscale());
   }

   /**
    * Applies the invert effect to a sprite, inverting the pixel colors.
    */
   public invert() {
      this.addEffect(new Effects.Invert());
   }

   /**
    * Applies the fill effect to a sprite, changing the color channels of all non-transparent pixels to match a given color
    */
   public fill(color: Color) {
      this.addEffect(new Effects.Fill(color));
   }

   /**
    * Applies the colorize effect to a sprite, changing the color channels of all pixels to be the average of the original color and the
    * provided color.
    */
   public colorize(color: Color) {
      this.addEffect(new Effects.Colorize(color));
   }

   /**
    * Applies the lighten effect to a sprite, changes the lightness of the color according to hsl
    */
   public lighten(factor: number = 0.1) {
      this.addEffect(new Effects.Lighten(factor));
   }

   /**
    * Applies the darken effect to a sprite, changes the darkness of the color according to hsl
    */
   public darken(factor: number = 0.1) {
      this.addEffect(new Effects.Darken(factor));
   }

   /**
    * Applies the saturate effect to a sprite, saturates the color according to hsl
    */
   public saturate(factor: number = 0.1) {
      this.addEffect(new Effects.Saturate(factor));
   }

   /**
    * Applies the desaturate effect to a sprite, desaturates the color according to hsl
    */
   public desaturate(factor: number = 0.1) {
      this.addEffect(new Effects.Desaturate(factor));
   }

   /**
    * Add a [[ISpriteEffect]] manually
    */
   public addEffect(effect: Effects.ISpriteEffect) {
      for (var i in this.sprites) {
         this.sprites[i].addEffect(effect);
      }
   }

   /**
    * Removes an [[ISpriteEffect]] from this animation.
    * @param effect Effect to remove from this animation
    */
   public removeEffect(effect: Effects.ISpriteEffect): void;
   
   /**
    * Removes an effect given the index from this animation.
    * @param index  Index of the effect to remove from this animation
    */
   public removeEffect(index: number): void;
   public removeEffect(param: any) {
      for (var i in this.sprites) {
         this.sprites[i].removeEffect(param);
      }
   }

   /**
    * Clear all sprite effects
    */
   public clearEffects() {
      for (var i in this.sprites) {
         this.sprites[i].clearEffects();
      }  
   }

   private _setAnchor(point: Vector) {
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
   
   private _setScale(scale: Vector) {
      //if (!this.scale.equals(scale)) {
         for (var i in this.sprites) {
            this.sprites[i].scale = scale;
         }
      //}
   }
   
   /**
    * Resets the animation to first frame.
    */
   public reset() {
      this.currentFrame = 0;
   }

   /**
    * Indicates whether the animation is complete, animations that loop are never complete.
    */
   public isDone() {
      return (!this.loop && this.currentFrame >= this.sprites.length);
   }

   /**
    * Not meant to be called by game developers. Ticks the animation forward internally and
    * calculates whether to change to the frame.
    * @internal
    */
   public tick() {
      var time = Date.now();
      if ((time - this._oldTime) > this.speed) {
         this.currentFrame = (this.loop ? (this.currentFrame + 1) % this.sprites.length : this.currentFrame + 1);
         this._oldTime = time;
      }
   }

   private _updateValues(): void {
      this._setAnchor(this.anchor);
      this._setRotation(this.rotation);
      this._setScale(this.scale);
   }

   /**
    * Skips ahead a specified number of frames in the animation
    * @param frames  Frames to skip ahead
    */
   public skip(frames: number) {
      this.currentFrame = (this.currentFrame + frames) % this.sprites.length;
   }

   public draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
      this.tick();
      this._updateValues();
      var currSprite: Sprite;
      if (this.currentFrame < this.sprites.length) {
         currSprite = this.sprites[this.currentFrame];
         if (this.flipVertical) {
            currSprite.flipVertical = this.flipVertical;
         }
         if (this.flipHorizontal) {
            currSprite.flipHorizontal = this.flipHorizontal;
         }
         currSprite.draw(ctx, x, y);
      }

      if (this.freezeFrame !== -1 && this.currentFrame >= this.sprites.length) {
         currSprite = this.sprites[Util.clamp(this.freezeFrame, 0, this.sprites.length - 1)];
         currSprite.draw(ctx, x, y);
      }
      
      // add the calculated width
      if (currSprite) {
         this.width = currSprite.width;
         this.height = currSprite.height;
      }
   }

   /**
    * Plays an animation at an arbitrary location in the game.
    * @param x  The x position in the game to play
    * @param y  The y position in the game to play
    */
   public play(x: number, y: number) {
      this.reset();
      this._engine.playAnimation(this, x, y);
   }
}

/**
 * [[include:Constructors.md]]
 */
export interface IAnimationArgs extends Partial<AnimationImpl> {
   engine: Engine;
   images: Sprite[];
   speed: number;
   loop?: boolean;
   anchor?: Vector;
   rotation?: number;
   scale?: Vector;
   flipVertical?: boolean;
   flipHorizontal?: boolean;
   width?: number;
   height?: number;
} 

/**
 * Animations allow you to display a series of images one after another,
 * creating the illusion of change. Generally these images will come from a [[SpriteSheet]] source.
 *
 * [[include:Animations.md]]
 */
export class Animation extends Configurable(AnimationImpl) {
   constructor(config: IAnimationArgs);
   constructor(engine: Engine, images: Sprite[], speed: number, loop?: boolean);
   constructor(engineOrConfig: Engine | IAnimationArgs, images?: Sprite[], speed?: number, loop?: boolean) {
      super(engineOrConfig, images, speed, loop);
   }
}