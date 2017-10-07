import { Color } from './Drawing/Color';
import { Engine } from './Engine';
import { ActionQueue } from './Actions/Action';
import { EventDispatcher } from './EventDispatcher';
import { Actor, CollisionType } from './Actor';
import { Vector } from 'Algebra';
import { ExitTriggerEvent, EnterTriggerEvent } from './Events';


export interface ITriggerOptions {
   pos?: Vector;
   width?: number;
   height?: number;
   target?: Actor;
   // action to take when triggered
   action?: () => void;
   // Returns true if the triggers should fire on the collided actor
   filter?: (actor: Actor) => boolean;
   // -1 if it should repeat forever
   repeat?: number;
}


/**
 * Triggers are a method of firing arbitrary code on collision. These are useful
 * as 'buttons', 'switches', or to trigger effects in a game. By default triggers
 * are invisible, and can only be seen when [[Engine.isDebug]] is set to `true`.
 * 
 * [[include:Triggers.md]]
 */
export class Trigger extends Actor {
   private _engine: Engine;
   public action: () => void = () => { return; };
   public filter: (actor: Actor) => boolean = () => true;
   public repeat: number = 1;
   public target: Actor;

   /**
    * @param x       The x position of the trigger
    * @param y       The y position of the trigger
    * @param width   The width of the trigger
    * @param height  The height of the trigger
    * @param action  Callback to fire when trigger is activated, `this` will be bound to the Trigger instance
    * @param repeats The number of times that this trigger should fire, by default it is 1, if -1 is supplied it will fire indefinitely
    */
   constructor(opts?: ITriggerOptions) {
      super(opts.pos.x, opts.pos.y, opts.width, opts.height);

      this.filter = opts.filter || this.filter;
      this.repeat = opts.repeat || this.repeat;
      this.action = opts.action || this.action;
      this.target = opts.target || this.target;
      this.collisionType = CollisionType.PreventCollision;
      this.eventDispatcher = new EventDispatcher(this);
      this.actionQueue = new ActionQueue(this);
   }


   public _initialize(engine: Engine) {
      super._initialize(engine);
      this._engine = engine;
   }

   public collides(other: Actor) {
      if (this.filter(other)) {       
         let wasTouching = this.body.wasTouching(other, this._engine);
         let justTouching = this.body.justTouching(other, this._engine);

         if (wasTouching) {
            this.emit('exit', new ExitTriggerEvent(other, this));
         }

         if (justTouching) {
            this.emit('enter', new EnterTriggerEvent(other, this));
         }
         return super.collides(other);
      }
      return null;
   }

   public update(engine: Engine, delta: number) {

      // Update action queue
      this.actionQueue.update(delta);

      // Update placements based on linear algebra
      this.pos.x += this.vel.x * delta / 1000;
      this.pos.y += this.vel.y * delta / 1000;

      this.rotation += this.rx * delta / 1000;

      this.scale.x += this.sx * delta / 1000;
      this.scale.y += this.sy * delta / 1000;

      // check for trigger collisions
      if (this.target) {
         this.body.touching(this.target);
         if (this.collides(this.target)) {
            this._dispatchAction();
         }
      } else {
         for (var i = 0; i < engine.currentScene.actors.length; i++) {
            var other = engine.currentScene.actors[i];
            if (other !== this &&
               other.collisionType !== CollisionType.PreventCollision &&
               this.collides(other)) {
               this._dispatchAction();
            }
         }
      }

      // remove trigger if its done, -1 repeat forever
      if (this.repeat === 0) {
         this.kill();
      }
   }

   private _dispatchAction() {
      this.action.call(this);
      this.repeat--;
   }

   public draw(_ctx: CanvasRenderingContext2D, _delta: number) {
      // does not draw
      return;
   }

   public debugDraw(ctx: CanvasRenderingContext2D) {
      super.debugDraw(ctx);
      // Meant to draw debug information about actors
      ctx.save();
      ctx.translate(this.pos.x, this.pos.y);

      var bb = this.getBounds();
      var wp = this.getWorldPos();
      bb.left = bb.left - wp.x;
      bb.right = bb.right - wp.x;
      bb.top = bb.top - wp.y;
      bb.bottom = bb.bottom - wp.y;

      // Currently collision primitives cannot rotate 
      // ctx.rotate(this.rotation);
      ctx.fillStyle = Color.Violet.toString();
      ctx.strokeStyle = Color.Violet.toString();
      ctx.fillText('Trigger', 10, 10);
      bb.debugDraw(ctx);

      ctx.restore();
   }
}
