/// <reference path="Actor.ts" />
/// <reference path="Engine.ts" />

module ex {

   /**
    * Triggers
    *
    * Triggers are a method of firing arbitrary code on collision. These are useful
    * as 'buttons', 'switches', or to trigger effects in a game. By default triggers
    * are invisible, and can only be seen when [[Engine.isDebug]] is set to `true`.
    *
    * ## Creating a trigger
    *
    * ```js
    * var game = new ex.Game();
    *
    * // create a handler
    * function onTrigger() {
    *
    *   // `this` will be the Trigger instance
    *   ex.Logger.getInstance().info("Trigger was triggered!", this);
    * }
    *
    * // set a trigger at (100, 100) that is 40x40px
    * var trigger = new ex.Trigger(100, 100, 40, 40, onTrigger, 1);
    *
    * // create an actor across from the trigger
    * var actor = new ex.Actor(100, 0, 40, 40, ex.Color.Red);
    *
    * // tell the actor to move towards the trigger over 3 seconds
    * actor.moveTo(100, 200, 3000);
    *
    * game.add(trigger);
    * game.add(actor);
    *
    * game.start();
    * ```
    */
   export class Trigger extends Actor {
      private _action : () => void = () => { return; };
      public repeats : number = 1;
      public target : Actor = null;

      /**
       * @param x       The x position of the trigger
       * @param y       The y position of the trigger
       * @param width   The width of the trigger
       * @param height  The height of the trigger
       * @param action  Callback to fire when trigger is activated, `this` will be bound to the Trigger instance
       * @param repeats The number of times that this trigger should fire, by default it is 1, if -1 is supplied it will fire indefinitely
       */
      constructor(x?: number, y?: number, width?: number, height?: number, action?: () => void, repeats?: number) {
         super(x, y, width, height);
         this.repeats = repeats || this.repeats;
         this._action = action || this._action;
         this.collisionType = CollisionType.PreventCollision;
         this.eventDispatcher = new EventDispatcher(this);
         this.actionQueue = new Internal.Actions.ActionQueue(this);
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
            if (this.collides(this.target)) {
               this._dispatchAction();
            }
         } else {
            for (var i = 0; i < engine.currentScene.children.length; i++) {
               var other = engine.currentScene.children[i];
               if (other !== this && 
                  other.collisionType !== CollisionType.PreventCollision && 
                  this.collides(other)) {
                  this._dispatchAction();
               }
            }
         }         

         // remove trigger if its done, -1 repeat forever
         if (this.repeats === 0) {
            this.kill();
         }
      }

      private _dispatchAction() {
         this._action.call(this);
         this.repeats--;
      }

      public draw(ctx: CanvasRenderingContext2D, delta: number) {
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
}