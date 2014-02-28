/// <reference path="Core.ts" />
/// <reference path="Algebra.ts" />
/// <reference path="Util.ts" />

module ex {
   export class Overlap {
      constructor(public x: number, public y: number) { }
   }

   export class Scene {
      public children: Actor[] = [];
      public engine: Engine;
      private killQueue: Actor[] = [];

      private timers: Timer[] = [];
      private cancelQueue: Timer[] = [];

      public collisionGroups: {[key:string]: Actor[]} = {};

      constructor() {}

      public onActivate(): void {
         // will be overridden
      }

      public onDeactivate(): void {
         // will be overridden
      }

      public publish(eventType: string, event: GameEvent) {
         this.children.forEach((actor) => {
            actor.triggerEvent(eventType, event);
         });
      }

      public update(engine: Engine, delta: number) {
         var len = 0;
         var start = 0;
         var end = 0;
         var actor;
         // Cycle through actors updating actors
         for (var i = 0, len = this.children.length; i < len; i++) {
            this.children[i].update(engine, delta);
         }

         // Remove actors from scene graph after being killed
         var actorIndex = 0;
         for (var j = 0, len = this.killQueue.length; j < len; j++) {
            actorIndex = this.children.indexOf(this.killQueue[j]);
            this.children.splice(actorIndex, 1);
         }
         this.killQueue.length = 0;


         // Remove timers in the cancel queue before updating them
         var timerIndex = 0;
         for(var k = 0, len = this.cancelQueue.length; k < len; k++){
            this.removeTimer(this.cancelQueue[k]);
         }
         this.cancelQueue.length = 0;

         // Cycle through timers updating timers
         var that = this; 
         this.timers = this.timers.filter(function(timer){
            timer.update(delta);
            return !timer.complete;
         });
      }

      public draw(ctx: CanvasRenderingContext2D, delta: number) {
         var len = 0;
         var start = 0;
         var end = 0;
         var actor;
         for (var i = 0, len = this.children.length; i < len; i++) {
            actor = this.children[i];
            this.children[i].draw(ctx, delta);
         }
      }

      public debugDraw(ctx: CanvasRenderingContext2D) {
         this.children.forEach((actor) => {
            actor.debugDraw(ctx);
         })
      }

      public addChild(actor: Actor) {
         actor.parent = this;
         this.updateAddCollisionGroups(actor);
         this.children.push(actor);
      }

      public updateAddCollisionGroups(actor: Actor){
         actor.collisionGroups.forEach((group)=>{
            if(!(this.collisionGroups[group] instanceof Array)){
               this.collisionGroups[group] = [];
            }
            this.collisionGroups[group].push(actor);
         });
      }

      public removeChild(actor: Actor) {
         this.updateRemoveCollisionGroups(actor);
         this.killQueue.push(actor);
      }

      public updateRemoveCollisionGroups(actor: Actor){
         for(var group in this.collisionGroups){
            this.collisionGroups[group] = this.collisionGroups[group].filter((a)=>{
               return a != actor;
            });
         }
      }

      public addTimer(timer: Timer): Timer{
         this.timers.push(timer);
         timer.scene = this;
         return timer;
      }

      public removeTimer(timer: Timer): Timer{
         var i = this.timers.indexOf(timer);
         this.timers.splice(i, 1);
         return timer;
      }

      public cancelTimer(timer: Timer): Timer{
         this.cancelQueue.push(timer);
         return timer;
      }

      public isTimerActive(timer: Timer): boolean {
         return (this.timers.indexOf(timer) > -1);
      }

   }

   export enum Side {
      NONE,
      TOP,
      BOTTOM,
      LEFT,
      RIGHT
   }

   export class Actor extends ex.Util.Class {
      public x: number = 0;
      public y: number = 0;
      private height: number = 0;
      private width: number = 0;
      public rotation: number = 0; // radians
      public rx: number = 0; //radions/sec

      public scale: number = 1;
      public sx: number = 0; //scale/sec

      public dx: number = 0; // pixels/sec
      public dy: number = 0;
      public ax: number = 0; // pixels/sec/sec
      public ay: number = 0;

      public invisible: boolean = false;

      public actionQueue: ex.Internal.Actions.ActionQueue;

      public eventDispatcher: EventDispatcher;

      private sceneNode: Scene;

      private logger: Logger = Logger.getInstance();

      public parent: Scene = null;

      public fixed = true;
      public preventCollisions = false;
      public collisionGroups : string[] = [];

      public frames: { [key: string]: IDrawable; } = {}
      //public animations : {[key : string] : Drawing.Animation;} = {};
      public currentDrawing: IDrawable = null;

      private centerDrawingX = false;
      private centerDrawingY = false;
      //public currentAnimation: Drawing.Animation = null;

      public color: Color;
      constructor(x?: number, y?: number, width?: number, height?: number, color?: Color) {
         super();
         this.x = x || 0;
         this.y = y || 0;
         this.width = width || 0;
         this.height = height || 0;
         this.color = color;
         this.actionQueue = new ex.Internal.Actions.ActionQueue(this);
         this.eventDispatcher = new EventDispatcher(this);
         this.sceneNode = new Scene();
      }

      public kill() {
         if (this.parent) {
            this.parent.removeChild(this);
         } else {
            this.logger.warn("Cannot kill actor, it was never added to the Scene");
         }
      }

      public addChild(actor: Actor) {
         this.sceneNode.addChild(actor);
      }

      public removeChild(actor: Actor) {
         this.sceneNode.removeChild(actor);
      }

      // Play animation in Actor's list
      public setDrawing(key) {

         if (this.currentDrawing != this.frames[<string>key]) {
            this.frames[<string>key].reset();
         }
         this.currentDrawing = this.frames[<string>key];
      }

      public addEventListener(eventName: string, handler: (event?: GameEvent) => void) {
         this.eventDispatcher.subscribe(eventName, handler);
      }

      public triggerEvent(eventName: string, event?: GameEvent) {
         this.eventDispatcher.publish(eventName, event);
      }

      public addCollisionGroup(name: string){
         this.collisionGroups.push(name);
         if(this.parent){
            this.parent.updateAddCollisionGroups(this);
         }
      }

      public removeCollisionGroup(name: string){
         var index = this.collisionGroups.indexOf(name);
         this.collisionGroups.splice(index, 1);
         if(this.parent){
            this.parent.updateRemoveCollisionGroups(this);
         }
      }
 
      public getCenter(): Vector {
         return new Vector(this.x + this.getWidth() / 2, this.y + this.getHeight() / 2);
      }

      public getWidth() {
         return this.width * this.scale;
      }

      public setWidth(width) {
         this.width = width / this.scale;
      }

      public getHeight() {
         return this.height * this.scale;
      }

      public setHeight(height) {
         this.height = height / this.scale;
      }

      public setCenterDrawing(center: boolean) {
         this.centerDrawingY = true;
         this.centerDrawingX = true;
      }

      public getLeft() {
         return this.x;
      }
      public getRight() {
         return this.x + this.getWidth();
      }
      public getTop() {
         return this.y;
      }
      public getBottom() {
         return this.y + this.getHeight();
      }

      private getOverlap(box: Actor): Overlap {
         var xover = 0;
         var yover = 0;
         if (this.collides(box)) {
            if (this.getLeft() < box.getRight()) {
               xover = box.getRight() - this.getLeft();
            }
            if (box.getLeft() < this.getRight()) {
               var tmp = box.getLeft() - this.getRight();
               if (Math.abs(xover) > Math.abs(tmp)) {
                  xover = tmp;
               }
            }

            if (this.getBottom() > box.getTop()) {
               yover = box.getTop() - this.getBottom();
            }

            if (box.getBottom() > this.getTop()) {
               var tmp = box.getBottom() - this.getTop();
               if (Math.abs(yover) > Math.abs(tmp)) {
                  yover = tmp;
               }
            }

         }
         return new Overlap(xover, yover);
      }

      public contains(x: number, y: number): boolean {
         return (this.x <= x && this.y <= y && this.getBottom() >= y && this.getRight() >= x);
      }

      public collides(actor: Actor): Side {


         var w = 0.5 * (this.getWidth() + actor.getWidth());
         var h = 0.5 * (this.getHeight() + actor.getHeight());

         var dx = (this.x + this.getWidth() / 2.0) - (actor.x + actor.getWidth() / 2.0);
         var dy = (this.y + this.getHeight() / 2.0) - (actor.y + actor.getHeight() / 2.0);

         if (Math.abs(dx) < w && Math.abs(dy) < h) {
            // collision detected
            var wy = w * dy;
            var hx = h * dx;

            if (wy > hx) {
               if (wy > -hx) {
                  return Side.TOP;
               } else {
               return Side.LEFT
            }
            } else {
               if (wy > -hx) {
                  return Side.RIGHT;
               } else {
                  return Side.BOTTOM;
               }
            }
         }

         return Side.NONE;
      }

      public within(actor: Actor, distance: number): boolean {
         return Math.sqrt(Math.pow(this.x - actor.x, 2) + Math.pow(this.y - actor.y, 2)) <= distance;
      }

      // Add an animation to Actor's list
      public addDrawing(key: any, drawing: IDrawable) {
         this.frames[<string>key] = drawing;
         if (!this.currentDrawing) {
            this.currentDrawing = drawing;
         }
      }

      // Actions
      public clearActions(): void {
         this.actionQueue.clearActions();
      }

      public moveTo(x: number, y: number, speed: number): Actor {
         this.actionQueue.add(new ex.Internal.Actions.MoveTo(this, x, y, speed));
         return this;
      }

      public moveBy(x: number, y: number, time: number): Actor {
         this.actionQueue.add(new ex.Internal.Actions.MoveBy(this, x, y, time));
         return this;
      }

      public rotateTo(angleRadians: number, speed: number): Actor {
         this.actionQueue.add(new ex.Internal.Actions.RotateTo(this, angleRadians, speed));
         return this;
      }

      public rotateBy(angleRadians: number, time: number): Actor {
         this.actionQueue.add(new ex.Internal.Actions.RotateBy(this, angleRadians, time));
         return this;
      }

      public scaleTo(size: number, speed: number): Actor {
         this.actionQueue.add(new ex.Internal.Actions.ScaleTo(this, size, speed));
         return this;
      }

      public scaleBy(size: number, time: number): Actor {
         this.actionQueue.add(new ex.Internal.Actions.ScaleBy(this, size, time));
         return this;
      }

      public blink(frequency: number, duration: number, blinkTime?: number): Actor {
         this.actionQueue.add(new ex.Internal.Actions.Blink(this, frequency, duration, blinkTime));
         return this;
      }

      public delay(seconds: number): Actor {
         this.actionQueue.add(new ex.Internal.Actions.Delay(this, seconds));
         return this;
      }

      public repeat(times?: number): Actor {
         if (!times) {
            this.repeatForever();
            return this;
         }
         this.actionQueue.add(new ex.Internal.Actions.Repeat(this, times, this.actionQueue.getActions()));

         return this;
      }

      public repeatForever(): Actor {
         this.actionQueue.add(new ex.Internal.Actions.RepeatForever(this, this.actionQueue.getActions()));
         return this;
      }

      public follow(actor : Actor, followDistance? : number) : Actor {
      if (followDistance == undefined){
            this.actionQueue.add(new ex.Internal.Actions.Follow(this, actor));
         } else {
            this.actionQueue.add(new ex.Internal.Actions.Follow(this, actor, followDistance));
         }
      return this;
      }

      public meet(actor: Actor, speed? : number) : Actor {
         if(speed == undefined){
               this.actionQueue.add(new ex.Internal.Actions.Meet(this, actor));
            } else {
               this.actionQueue.add(new ex.Internal.Actions.Meet(this, actor, speed));
            }
         return this;
      }

      public update(engine: Engine, delta: number) {
         this.sceneNode.update(engine, delta);
         var eventDispatcher = this.eventDispatcher;

         // Update event dispatcher
         eventDispatcher.update();

         // Update action queue
         this.actionQueue.update(delta);

         // Update placements based on linear algebra
         this.x += this.dx * delta / 1000;
         this.y += this.dy * delta / 1000;

         this.rotation += this.rx * delta / 1000;

         this.scale += this.sx * delta / 1000;

         

         var potentialColliders = engine.currentScene.children;
         if(this.collisionGroups.length !== 0){
            potentialColliders = [];
            for(var group in this.parent.collisionGroups){
               potentialColliders = potentialColliders.concat(this.parent.collisionGroups[group]);
            }
         }

         // Publish collision events
         for (var i = 0; i < potentialColliders.length; i++) {
            var other = potentialColliders[i];
            var side: Side = Side.NONE;
            if (other !== this && !other.preventCollisions &&
               (side = this.collides(other)) !== Side.NONE) {
               var overlap = this.getOverlap(other);
               eventDispatcher.publish(EventType[EventType.Collision], new CollisionEvent(this, other, side));
               if (!this.fixed) {
                  if (Math.abs(overlap.y) < Math.abs(overlap.x)) {
                     this.y += overlap.y;
                     //this.dy = 0;
                     //this.dx += (<Actor>other).dx;
                  } else {
                     this.x += overlap.x;
                     //this.dx = 0;
                     //this.dy += (<Actor>other).dy;
                  }

               }
            }
         }

         // Publish other events
         engine.keys.forEach(function (key) {
            eventDispatcher.publish(InputKey[key], new KeyEvent(this, key));
         });

         // Publish click events
         engine.clicks.forEach((e) => {
            if (this.contains(e.x, e.y)) {
               eventDispatcher.publish(EventType[EventType.Click], new Click(e.x, e.y));
               eventDispatcher.publish(EventType[EventType.MouseDown], new MouseDown(e.x, e.y));
            }
         });

         engine.mouseUp.forEach((e) => {
            if (this.contains(e.x, e.y)) {
               eventDispatcher.publish(EventType[EventType.MouseUp], new MouseUp(e.x, e.y));
            }
         })

         eventDispatcher.publish(EventType[EventType.Update], new UpdateEvent(delta));
      }


      public draw(ctx: CanvasRenderingContext2D, delta: number) {

         ctx.save();
         ctx.translate(this.x, this.y);
         ctx.rotate(this.rotation);     
         ctx.scale(this.scale, this.scale);         

         if (!this.invisible) {
            if (this.currentDrawing) {

               var xDiff = 0;
               var yDiff = 0;
               if (this.centerDrawingX) {
                  xDiff = (this.currentDrawing.width * this.currentDrawing.getScale() - this.width) / 2;
               }

               if (this.centerDrawingY) {
                  yDiff = (this.currentDrawing.height * this.currentDrawing.getScale() - this.height) / 2;
               }

               //var xDiff = (this.currentDrawing.width*this.currentDrawing.getScale() - this.width)/2;
               //var yDiff = (this.currentDrawing.height*this.currentDrawing.getScale() - this.height)/2;
               this.currentDrawing.draw(ctx, -xDiff, -yDiff);

            } else {
               ctx.fillStyle = this.color ? this.color.toString() : (new Color(0, 0, 0)).toString();
               ctx.fillRect(0, 0, this.width, this.height);
            }
         }

         this.sceneNode.draw(ctx, delta);

         ctx.restore();
      }

      public debugDraw(ctx: CanvasRenderingContext2D) {
         
         // Meant to draw debug information about actors
         ctx.save();
         ctx.translate(this.x, this.y);         

         ctx.fillStyle = Color.Yellow.toString();
         ctx.strokeStyle = Color.Yellow.toString();
         ctx.beginPath();
         ctx.rect(0, 0, this.getWidth(), this.getHeight());
         ctx.stroke();

         this.sceneNode.debugDraw(ctx);
         ctx.restore();

      }
   }

   export class Label extends Actor {
      public text: string;
      public spriteFont: SpriteFont;
      public font: string;
      constructor(text?: string, x?: number, y?: number, font?: string, spriteFont?: SpriteFont) {
         super(x, y);
         this.text = text || "";
         this.color = Color.White;
         this.spriteFont = spriteFont;
         this.fixed = true;
         this.preventCollisions = true;
         this.font = font || "10px sans-serif"; // coallesce to default canvas font
      }

      public update(engine: Engine, delta: number) {
         super.update(engine, delta);
      }

      public draw(ctx: CanvasRenderingContext2D, delta: number) {

         ctx.save();
         ctx.translate(this.x, this.y);
         ctx.scale(this.scale, this.scale);
         ctx.rotate(this.rotation);
         if (!this.invisible) {
            if (this.spriteFont) {
               this.spriteFont.draw(ctx, 0, 0, this.text);
            } else {
               ctx.fillStyle = this.color.toString();
               ctx.font = this.font;
               ctx.fillText(this.text, 0, 0);
            }
         }

         super.draw(ctx, delta);
         ctx.restore();
      }

      public debugDraw(ctx: CanvasRenderingContext2D) {
         super.debugDraw(ctx);
      }

   }

   export class Trigger extends Actor {
      private action : ()=>void = ()=>{};
      public repeats : number = 1;
      public target : Actor = null;
      constructor(x?: number, y?: number, width?: number, height?: number, action?: ()=>void, repeats?: number){
         super(x, y, width, height);
         this.repeats = repeats || this.repeats;
         this.action = action || this.action;
         this.preventCollisions = true;
         this.eventDispatcher = new EventDispatcher(this);
         this.actionQueue = new Internal.Actions.ActionQueue(this);
      }

      public update(engine: Engine, delta: number){
         var eventDispatcher = this.eventDispatcher;

         // Update event dispatcher
         eventDispatcher.update();

         // Update action queue
         this.actionQueue.update(delta);

         // Update placements based on linear algebra
         this.x += this.dx * delta / 1000;
         this.y += this.dy * delta / 1000;

         this.rotation += this.rx * delta / 1000;

         this.scale += this.sx * delta / 1000;

         // check for trigger collisions
         if(this.target){
            if(this.collides(this.target) !== Side.NONE){
               this.dispatchAction();
            }
         }else{
            for (var i = 0; i < engine.currentScene.children.length; i++) {
               var other = engine.currentScene.children[i];
               if(other !== this && this.collides(other) !== Side.NONE){
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


         // Currently collision primitives cannot rotate 
         // ctx.rotate(this.rotation);
         ctx.fillStyle = Color.Violet.toString();
         ctx.strokeStyle = Color.Violet.toString();
         ctx.fillText('Trigger', 10, 10);
         ctx.beginPath();
         ctx.rect(0, 0, this.getWidth(), this.getHeight());
         ctx.stroke();

         ctx.restore();
      }
   }
}