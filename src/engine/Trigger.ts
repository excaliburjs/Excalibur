/// <reference path="Actor.ts" />
/// <reference path="Engine.ts" />
module ex {
   /**
    * Triggers a method of firing arbitrary code on collision. These are useful
    * as 'buttons', 'switches', or to trigger effects in a game. By defualt triggers
    * are invisible, and can only be seen with debug mode enabled on the Engine.
    * @class Trigger
    * @constructor
    * @param [x=0] {number} The x position of the trigger
    * @param [y=0] {number} The y position of the trigger
    * @param [width=0] {number} The width of the trigger
    * @param [height=0] {number} The height of the trigger
    * @param [action=null] {()=>void} Callback to fire when trigger is activated
    * @param [repeats=1] {number} The number of times that this trigger should fire, by default it is 1, if -1 is supplied it will fire indefinitely
    */
   export class Trigger extends Actor {
      private action : ()=>void = ()=>{};
      public repeats : number = 1;
      public target : Actor = null;
      constructor(x?: number, y?: number, width?: number, height?: number, action?: ()=>void, repeats?: number){
         super(x, y, width, height);
         this.repeats = repeats || this.repeats;
         this.action = action || this.action;
         this.collisionType = CollisionType.PreventCollision;
         this.eventDispatcher = new EventDispatcher(this);
         this.actionQueue = new Internal.Actions.ActionQueue(this);
      }

      public update(engine: Engine, delta: number) {
         // Recalcuate the anchor point
         this.calculatedAnchor = new ex.Point(this.getWidth() * this.anchor.x, this.getHeight() * this.anchor.y);

         var eventDispatcher = this.eventDispatcher;

         // Update action queue
         this.actionQueue.update(delta);

         // Update placements based on linear algebra
         this.x += this.dx * delta / 1000;
         this.y += this.dy * delta / 1000;

         this.rotation += this.rx * delta / 1000;

         this.scaleX += this.sx * delta / 1000;
         this.scaleY += this.sy * delta / 1000;

         // check for trigger collisions
         if(this.target){
            if(this.collides(this.target)){
               this.dispatchAction();
            }
         }else{
            for (var i = 0; i < engine.currentScene.children.length; i++) {
               var other = engine.currentScene.children[i];
               if(other !== this && 
                  other.collisionType !== CollisionType.PreventCollision && 
                  this.collides(other)){
                  this.dispatchAction();
               }
            }
         }         

         // remove trigger if its done, -1 repeat forever
         if(this.repeats === 0){
            this.kill();
         }
      }

      private dispatchAction(){
         this.action.call(this);
         this.repeats--;
      }

      public draw(ctx: CanvasRenderingContext2D, delta: number){
         // does not draw
         return;
      }

      public debugDraw(ctx: CanvasRenderingContext2D){
         super.debugDraw(ctx);
          // Meant to draw debug information about actors
         ctx.save();
         ctx.translate(this.x, this.y);

         var bb = this.getBounds();
         bb.left = bb.left - this.getGlobalX();
         bb.right = bb.right - this.getGlobalX();
         bb.top = bb.top - this.getGlobalY();
         bb.bottom = bb.bottom - this.getGlobalY();

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