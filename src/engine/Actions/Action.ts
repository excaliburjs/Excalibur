/// <reference path="../Algebra.ts" />
/// <reference path="../Engine.ts" />
/// <reference path="../Actor.ts" />

/**
 * See [[ActionContext|Action API]] for more information about Actions.
 */
module ex.Internal.Actions {
   
   /**
    * Used for implementing actions for the [[ActionContext|Action API]].
    */
   export interface IAction {
      update(delta: number): void
      isComplete(actor: Actor): boolean
      reset(): void
      stop(): void
   }
   
   export class EaseTo implements IAction {
      private _currentLerpTime: number = 0;
      private _lerpDuration: number = 1 * 1000; // 5 seconds
      private _lerpStart: Point = new ex.Point(0, 0);
      private _lerpEnd: Point = new ex.Point(0, 0);
      private _initialized: boolean = false;
      private _stopped: boolean = false;
      private _distance: number = 0;
      constructor(public actor: Actor, x: number, y: number, duration: number, public easingFcn: (currentTime: number, startValue: number, endValue: number, duration: number) => number) {
         this._lerpDuration = duration;
         this._lerpEnd = new ex.Point(x, y);
      }
      private _initialize() {
         this._lerpStart = new ex.Point(this.actor.x, this.actor.y);
         this._currentLerpTime = 0;
         this._distance = this._lerpStart.toVector().distance(this._lerpEnd.toVector());
      }

      public update(delta: number): void {
         if (!this._initialized) {
            this._initialize();
            this._initialized = true;
         }

         var newX = this.actor.x;
         var newY = this.actor.y;
         if (this._currentLerpTime < this._lerpDuration) {

            if (this._lerpEnd.x < this._lerpStart.x) {
               newX = this._lerpStart.x - (this.easingFcn(this._currentLerpTime, this._lerpEnd.x, this._lerpStart.x, this._lerpDuration) - this._lerpEnd.x);
            } else {
               newX = this.easingFcn(this._currentLerpTime, this._lerpStart.x, this._lerpEnd.x, this._lerpDuration);
            }

            if (this._lerpEnd.y < this._lerpStart.y) {
               newY = this._lerpStart.y - (this.easingFcn(this._currentLerpTime, this._lerpEnd.y, this._lerpStart.y, this._lerpDuration) - this._lerpEnd.y);
            } else {
               newY = this.easingFcn(this._currentLerpTime, this._lerpStart.y, this._lerpEnd.y, this._lerpDuration);
            }
            this.actor.x = newX;
            this.actor.y = newY;

            this._currentLerpTime += delta;

         } else {
            this.actor.x = this._lerpEnd.x;
            this.actor.y = this._lerpEnd.y;
            //this._lerpStart = null;
            //this._lerpEnd = null;
            //this._currentLerpTime = 0;
         }

      }
      public isComplete(actor: Actor): boolean {
         return this._stopped || (new Vector(actor.x, actor.y)).distance(this._lerpStart.toVector()) >= this._distance;
      }

      public reset(): void {
         this._initialized = false;
      }
      public stop(): void {
         this._stopped = true;
      }
   }

   export class MoveTo implements IAction {
      private actor: Actor;
      public x: number;
      public y: number;
      private start: Vector;
      private end: Vector;
      private dir: Vector;
      private speed: number;
      private distance: number;
      private _started = false;
      private _stopped = false;
      constructor(actor: Actor, destx: number, desty: number, speed: number) {
         this.actor = actor;
         this.end = new Vector(destx, desty);
         this.speed = speed;

      }

      public update(delta: number): void {
         if (!this._started) {
            this._started = true;
            this.start = new Vector(this.actor.x, this.actor.y);
            this.distance = this.start.distance(this.end);
            this.dir = this.end.minus(this.start).normalize();
         }
         var m = this.dir.scale(this.speed);
         this.actor.dx = m.x;
         this.actor.dy = m.y;

         //Logger.getInstance().log("Pos x: " + this.actor.x +"  y:" + this.actor.y, Log.DEBUG);
         if (this.isComplete(this.actor)) {
            this.actor.x = this.end.x;
            this.actor.y = this.end.y;
            this.actor.dy = 0;
            this.actor.dx = 0;
         }
      }

      public isComplete(actor: Actor): boolean {
         return this._stopped || (new Vector(actor.x, actor.y)).distance(this.start) >= this.distance;
      }

      public stop(): void {
         this.actor.dy = 0;
         this.actor.dx = 0;
         this._stopped = true;
      }

      public reset(): void {
         this._started = false;
      }
   }

   export class MoveBy implements IAction {
      private actor: Actor;
      public x: number;
      public y: number;
      private distance: number;
      private speed: number;
      private time: number;

      private start: Vector;
      private end: Vector;
      private dir: Vector;
      private _started = false;
      private _stopped = false;
      constructor(actor: Actor, destx: number, desty: number, time: number) {
         this.actor = actor;
         this.end = new Vector(destx, desty);
         if (time <= 0) {
            Logger.getInstance().error("Attempted to moveBy time less than or equal to zero : " + time);
            throw new Error("Cannot move in time <= 0");
         }
         this.time = time;

      }

      public update(delta: Number) {
         if (!this._started) {
            this._started = true;
            this.start = new Vector(this.actor.x, this.actor.y);
            this.distance = this.start.distance(this.end);
            this.dir = this.end.minus(this.start).normalize();
            this.speed = this.distance / (this.time / 1000);
         }

         var m = this.dir.scale(this.speed);
         this.actor.dx = m.x;
         this.actor.dy = m.y;

         //Logger.getInstance().log("Pos x: " + this.actor.x +"  y:" + this.actor.y, Log.DEBUG);
         if (this.isComplete(this.actor)) {
            this.actor.x = this.end.x;
            this.actor.y = this.end.y;
            this.actor.dy = 0;
            this.actor.dx = 0;
         }
      }

      public isComplete(actor: Actor): boolean {
         return this._stopped || (new Vector(actor.x, actor.y)).distance(this.start) >= this.distance;
      }

      public stop(): void {
         this.actor.dy = 0;
         this.actor.dx = 0;
         this._stopped = true;
      }

      public reset(): void {
         this._started = false;
      }
   }

   export class Follow implements IAction {
      private actor : Actor;
      private actorToFollow : Actor;
      public x : number;
      public y : number;
      private current : Vector;
      private end : Vector;
      private dir : Vector;
      private speed : number;
      private maximumDistance : number;
      private distanceBetween : number;
      private _started = false;
      private _stopped = false;

      constructor(actor: Actor, actorToFollow : Actor, followDistance? : number){
         this.actor = actor;
         this.actorToFollow = actorToFollow;
         this.current = new Vector(this.actor.x, this.actor.y);
         this.end = new Vector(actorToFollow.x, actorToFollow.y);
         this.maximumDistance = (followDistance != undefined) ? followDistance : this.current.distance(this.end);
         this.speed = 0;
      }

      public update(delta : number) : void {
         if(!this._started){
            this._started = true;
            this.distanceBetween = this.current.distance(this.end);
            this.dir = this.end.minus(this.current).normalize();
         }
            
            var actorToFollowSpeed = Math.sqrt(Math.pow(this.actorToFollow.dx, 2) + Math.pow(this.actorToFollow.dy, 2));
            if (actorToFollowSpeed != 0){
               this.speed = actorToFollowSpeed;
            }
            this.current.x = this.actor.x;
            this.current.y = this.actor.y;

            this.end.x = this.actorToFollow.x;
            this.end.y = this.actorToFollow.y;
            this.distanceBetween = this.current.distance(this.end);
            this.dir = this.end.minus(this.current).normalize();

         if(this.distanceBetween >= this.maximumDistance){
            var m = this.dir.scale(this.speed);
            this.actor.dx = m.x;
            this.actor.dy = m.y;
         } else {
            this.actor.dx = 0;
            this.actor.dy = 0;
         }

         if(this.isComplete(this.actor)){
            // TODO this should never occur
            this.actor.x = this.end.x;
            this.actor.y = this.end.y;
            this.actor.dy = 0;
            this.actor.dx = 0;
         }
      }

      public stop(): void {
            this.actor.dy = 0;
            this.actor.dx = 0;
            this._stopped = true;
      }

      public isComplete(actor : Actor) : boolean{
         // the actor following should never stop unless specified to do so
         return this._stopped;
      }

      public reset() : void {
         this._started = false;
      }
   }

   export class Meet implements IAction {
      private actor : Actor;
      private actorToMeet : Actor;
      public x : number;
      public y : number;
      private current : Vector;
      private end : Vector;
      private dir : Vector;
      private speed : number;
      private distanceBetween : number;
      private _started = false;
      private _stopped = false;
      private _speedWasSpecified = false;

      constructor(actor: Actor, actorToMeet : Actor, speed? : number){
         this.actor = actor;
         this.actorToMeet = actorToMeet;
         this.current = new Vector(this.actor.x, this.actor.y);
         this.end = new Vector(actorToMeet.x, actorToMeet.y);
         this.speed = speed || 0;

         if (speed != undefined){
            this._speedWasSpecified = true;
         }
      }

      public update(delta : number) : void {
         if(!this._started){
            this._started = true;
            this.distanceBetween = this.current.distance(this.end);
            this.dir = this.end.minus(this.current).normalize();
         }

         var actorToMeetSpeed = Math.sqrt(Math.pow(this.actorToMeet.dx, 2) + Math.pow(this.actorToMeet.dy, 2));
         if ((actorToMeetSpeed != 0) && (!this._speedWasSpecified)){
            this.speed = actorToMeetSpeed;
         }
         this.current.x = this.actor.x;
         this.current.y = this.actor.y;

         this.end.x = this.actorToMeet.x;
         this.end.y = this.actorToMeet.y;
         this.distanceBetween = this.current.distance(this.end);
         this.dir = this.end.minus(this.current).normalize();

         var m = this.dir.scale(this.speed);
         this.actor.dx = m.x;
         this.actor.dy = m.y;

         if(this.isComplete(this.actor)){
            // console.log("meeting is complete")
            this.actor.x = this.end.x;
            this.actor.y = this.end.y;
            this.actor.dy = 0;
            this.actor.dx = 0;
         }
      }

      public isComplete(actor : Actor) : boolean{
         return this._stopped || (this.distanceBetween <= 1);
      }

      public stop(): void {
         this.actor.dy = 0;
         this.actor.dx = 0;
         this._stopped = true;
      }

      public reset() : void {
         this._started = false;
      }
   }

   export class RotateTo implements IAction {
      private actor: Actor;
      public x: number;
      public y: number;
      private start: number;
      private end: number;
      private speed: number;
      private distance: number;
      private _started = false;
      private _stopped = false;
      constructor(actor: Actor, angleRadians: number, speed: number) {
         this.actor = actor;
         this.end = angleRadians;
         this.speed = speed;

      }

      public update(delta: number): void {
         if (!this._started) {
            this._started = true;
            this.start = this.actor.rotation;
            this.distance = Math.abs(this.end - this.start);
         }
         this.actor.rx = this.speed;

         //Logger.getInstance().log("Pos x: " + this.actor.x +"  y:" + this.actor.y, Log.DEBUG);
         if (this.isComplete(this.actor)) {
            this.actor.rotation = this.end;
            this.actor.rx = 0;
         }
      }

      public isComplete(actor: Actor): boolean {
         return this._stopped || (Math.abs(this.actor.rotation - this.start) >= this.distance);
      }

      public stop(): void {
         this.actor.rx = 0;
         this._stopped = true;
      }

      public reset(): void {
         this._started = false;
      }
   }

   export class RotateBy implements IAction {
      private actor: Actor;
      public x: number;
      public y: number;
      private start: number;
      private end: number;
      private time: number;
      private distance: number;
      private _started = false;
      private _stopped = false;
      private speed: number;
      constructor(actor: Actor, angleRadians: number, time: number) {
         this.actor = actor;
         this.end = angleRadians;
         this.time = time;
         this.speed = (this.end - this.actor.rotation) / time * 1000;

      }

      public update(delta: number): void {
         if (!this._started) {
            this._started = true;
            this.start = this.actor.rotation;
            this.distance = Math.abs(this.end - this.start);
         }
         this.actor.rx = this.speed;

         //Logger.getInstance().log("Pos x: " + this.actor.x +"  y:" + this.actor.y, Log.DEBUG);
         if (this.isComplete(this.actor)) {
            this.actor.rotation = this.end;
            this.actor.rx = 0;
         }
      }

      public isComplete(actor: Actor): boolean {
         return this._stopped || (Math.abs(this.actor.rotation - this.start) >= this.distance);
      }

      public stop(): void {
         this.actor.rx = 0;
         this._stopped = true;
      }

      public reset(): void {
         this._started = false;
      }
   }

   export class ScaleTo implements IAction {
      private actor: Actor;
      public x: number;
      public y: number;
      private startX: number;
      private startY: number;
      private endX: number;
      private endY: number;
      private speedX: number;
      private speedY: number;
      private distanceX: number;
      private distanceY: number;
      private _started = false;
      private _stopped = false;
      constructor(actor: Actor, scaleX: number, scaleY: number, speedX: number, speedY: number) {
         this.actor = actor;
         this.endX = scaleX;
         this.endY = scaleY;
         this.speedX = speedX;
         this.speedY = speedY;

      }

      public update(delta: number): void {
         if (!this._started) {
            this._started = true;
            this.startX = this.actor.scale.x;
            this.startY = this.actor.scale.y;
            this.distanceX = Math.abs(this.endX - this.startX);
            this.distanceY = Math.abs(this.endY - this.startY);
         }

         if (!(Math.abs(this.actor.scale.x - this.startX) >= this.distanceX)) {
            var directionX = this.endY < this.startY ? -1 : 1;
            this.actor.sx = this.speedX * directionX;
         } else {
            this.actor.sx = 0;
         }
         
         if (!(Math.abs(this.actor.scale.y - this.startY) >= this.distanceY)) {
            var directionY = this.endY < this.startY ? -1 : 1;
            this.actor.sy = this.speedY * directionY;
         } else {
            this.actor.sy = 0;
         }

         //Logger.getInstance().log("Pos x: " + this.actor.x +"  y:" + this.actor.y, Log.DEBUG);
         if (this.isComplete(this.actor)) {
            this.actor.scale.x = this.endX;
            this.actor.scale.y = this.endY;
            this.actor.sx = 0;
            this.actor.sy = 0;
         }
      }

      public isComplete(actor: Actor): boolean {
         return this._stopped || ((Math.abs(this.actor.scale.y - this.startX) >= this.distanceX) && (Math.abs(this.actor.scale.y - this.startY) >= this.distanceY));
      }

      public stop(): void {
         this.actor.sx = 0;
         this.actor.sy = 0;
         this._stopped = true;
      }

      public reset(): void {
         this._started = false;
      }
   }

   export class ScaleBy implements IAction {
      private actor: Actor;
      public x: number;
      public y: number;
      private startX: number;
      private startY: number;
      private endX: number;
      private endY: number;
      private time: number;
      private distanceX: number;
      private distanceY: number;
      private _started = false;
      private _stopped = false;
      private speedX: number;
      private speedY: number;
      constructor(actor: Actor, scaleX: number, scaleY: number, time: number) {
         this.actor = actor;
         this.endX = scaleX;
         this.endY = scaleY;
         this.time = time;
         this.speedX = (this.endX - this.actor.scale.x) / time * 1000;
         this.speedY = (this.endY - this.actor.scale.y) / time * 1000;
      }

      public update(delta: number): void {
         if (!this._started) {
            this._started = true;
            this.startX = this.actor.scale.x;
            this.startY = this.actor.scale.y;
            this.distanceX = Math.abs(this.endX - this.startX);
            this.distanceY = Math.abs(this.endY - this.startY);
         }
         var directionX = this.endX < this.startX ? -1 : 1;
         var directionY = this.endY < this.startY ? -1 : 1;
         this.actor.sx = this.speedX * directionX;
         this.actor.sy = this.speedY * directionY;

         //Logger.getInstance().log("Pos x: " + this.actor.x +"  y:" + this.actor.y, Log.DEBUG);
         if (this.isComplete(this.actor)) {
            this.actor.scale.x = this.endX;
            this.actor.scale.y = this.endY;
            this.actor.sx = 0;
            this.actor.sy = 0;
         }
      }

      public isComplete(actor: Actor): boolean {
         return this._stopped || ((Math.abs(this.actor.scale.x - this.startX) >= this.distanceX) && (Math.abs(this.actor.scale.y - this.startY) >= this.distanceY));
      }

      public stop(): void {
         this.actor.sx = 0;
         this.actor.sy = 0;
         this._stopped = true;
      }

      public reset(): void {
         this._started = false;
      }
   }

   export class Delay implements IAction {
      public x: number;
      public y: number;
      private actor: Actor;
      private elapsedTime: number = 0;
      private delay: number;
      private _started: boolean = false;
      private _stopped = false;
      constructor(actor: Actor, delay: number) {
         this.actor = actor;
         this.delay = delay;
      }

      public update(delta: number): void {
         if (!this._started) {
            this._started = true;
         }

         this.x = this.actor.x;
         this.y = this.actor.y;

         this.elapsedTime += delta;
      }

      isComplete(actor: Actor): boolean {
         return this._stopped || (this.elapsedTime >= this.delay);
      }

      public stop(): void {
         this._stopped = true;
      }

      reset(): void {
         this.elapsedTime = 0;
         this._started = false;
      }
   }

   export class Blink implements IAction {
      private timeVisible: number = 0;
      private timeNotVisible: number = 0;
      private elapsedTime: number = 0;
      private totalTime: number = 0;
      private actor: Actor;
      private duration: number;
      private _stopped: boolean = false;
      private _started: boolean = false;
      constructor(actor: Actor, timeVisible: number, timeNotVisible: number, numBlinks: number = 1) {
         this.actor = actor;
         this.timeVisible = timeVisible;
         this.timeNotVisible = timeNotVisible;
         this.duration = (timeVisible + timeNotVisible) * numBlinks;
      }

      public update(delta): void {
         if (!this._started) {
            this._started = true;
         }

         this.elapsedTime += delta;
         this.totalTime += delta;
         if (this.actor.visible && this.elapsedTime >= this.timeVisible) {
            this.actor.visible = false;
            this.elapsedTime = 0;
         }

         if (!this.actor.visible && this.elapsedTime >= this.timeNotVisible) {
            this.actor.visible = true;
            this.elapsedTime = 0;
         }

         if (this.isComplete(this.actor)) {
            this.actor.visible = true;
         }

      }

      public isComplete(actor: Actor): boolean {
         return this._stopped || (this.totalTime >= this.duration);
      }

      public stop(): void {
         this.actor.visible = true;
         this._stopped = true;
      }

      public reset() {
         this._started = false;
         this.elapsedTime = 0;
         this.totalTime = 0;
      }
   }

   export class Fade implements IAction {
      public x: number;
      public y: number;

      private actor: Actor;
      private endOpacity: number;
      private speed: number;
      private multiplyer: number = 1;
      private _started = false;
      private _stopped = false;

      constructor(actor: Actor, endOpacity: number, speed: number) {
         this.actor = actor;
         this.endOpacity = endOpacity;
         this.speed = speed;
         if (endOpacity < actor.opacity) {
            this.multiplyer = -1;
         }
      }

      public update(delta: number): void {
         if (!this._started) {
            this._started = true;
         }
         if (this.speed > 0) {
            this.actor.opacity += this.multiplyer * (Math.abs(this.actor.opacity - this.endOpacity) * delta)/this.speed;
         }
         this.speed -= delta;

         Logger.getInstance().debug("actor opacity: " + this.actor.opacity);
         if (this.isComplete(this.actor)) {
            this.actor.opacity = this.endOpacity;
         }
      }

      public isComplete(actor: Actor): boolean {
         return this._stopped || (Math.abs(this.actor.opacity - this.endOpacity) < 0.05);
      }

      public stop(): void {
         this._stopped = true;
      }

      public reset(): void {
         this._started = false;
      }
   }

   export class Die implements IAction {
      public x: number;
      public y: number;

      private actor: Actor;

      private _started = false;
      private _stopped = false;

      constructor(actor: Actor) {
         this.actor = actor;
      }

      public update(delta: number): void {
         this.actor.actionQueue.clearActions();
         this.actor.kill();
         this._stopped = true;
      }

      public isComplete(): boolean {
         return this._stopped;
      }

      public stop(): void { }

      public reset(): void { }
   }

   export class CallMethod implements IAction {
      public x: number;
      public y: number;
      private _method: ()=>any = null;
      private _actor: Actor = null;
      private _hasBeenCalled: boolean = false;
      constructor(actor: Actor, method: ()=>any){
         this._actor = actor;
         this._method = method;
      }

      public update(delta: number){
         this._method.call(this._actor);
         this._hasBeenCalled = true;
      }
      public isComplete(actor: Actor){
         return this._hasBeenCalled;
      }
      public reset(){
         this._hasBeenCalled = false;
      }
      public stop(){
         this._hasBeenCalled = true;
      }
   }
   
   export class Repeat implements IAction {
      public x: number;
      public y: number;
      private actor: Actor;
      private actionQueue: ActionQueue;
      private repeat: number;
      private originalRepeat: number;
      private _stopped: boolean = false;
      constructor(actor: Actor, repeat: number, actions: IAction[]) {
         this.actor = actor;
         this.actionQueue = new ActionQueue(actor);
         this.repeat = repeat;
         this.originalRepeat = repeat;

         var i = 0, len = actions.length;
         for (i; i < len; i++) {
            actions[i].reset();
            this.actionQueue.add(actions[i]);
         };
      }

      public update(delta): void {
         this.x = this.actor.x;
         this.y = this.actor.y;
         if (!this.actionQueue.hasNext()) {
            this.actionQueue.reset();
            this.repeat--;
         }
         this.actionQueue.update(delta);
      }

      public isComplete(): boolean {
         return this._stopped || (this.repeat <= 0);
      }

      public stop(): void {
         this._stopped = true;
      }

      public reset(): void {
         this.repeat = this.originalRepeat;
      }
   }

   export class RepeatForever implements IAction {
      public x: number;
      public y: number;
      private actor: Actor;
      private actionQueue: ActionQueue;
      private _stopped: boolean = false;
      constructor(actor: Actor, actions: IAction[]) {
         this.actor = actor;
         this.actionQueue = new ActionQueue(actor);

         var i = 0, len = actions.length;
         for (i; i < len; i++) {
            actions[i].reset();
            this.actionQueue.add(actions[i]);
         };
      }

      public update(delta): void {
         this.x = this.actor.x;
         this.y = this.actor.y;
         if (this._stopped) {
            return;
         }


         if (!this.actionQueue.hasNext()) {
            this.actionQueue.reset();
         }

         this.actionQueue.update(delta);

      }

      public isComplete(): boolean {
         return this._stopped;
      }

      public stop(): void {
         this._stopped = true;
         this.actionQueue.clearActions();
      }

      public reset(): void { }
   }

   /**
    * Action Queues
    *
    * Action queues are part of the [[ActionContext|Action API]] and
    * store the list of actions to be executed for an [[Actor]].
    *
    * Actors implement [[Action.actionQueue]] which can be manipulated by
    * advanced users to adjust the actions currently being executed in the
    * queue.
    */
   export class ActionQueue {
      private actor;
      private _actions: IAction[] = [];
      private _currentAction: IAction;
      private _completedActions: IAction[] = [];
      constructor(actor: Actor) {
         this.actor = actor;
      }

      public add(action: IAction) {
         this._actions.push(action);
      }

      public remove(action: IAction) {
         var index = this._actions.indexOf(action);
         this._actions.splice(index, 1);
      }

      public clearActions(): void {
         this._actions.length = 0;
         this._completedActions.length = 0;
         if (this._currentAction) {
            this._currentAction.stop();
         }
      }

      public getActions(): IAction[] {
         return this._actions.concat(this._completedActions);
      }

      public hasNext(): boolean {
         return this._actions.length > 0;
      }

      public reset(): void {
         this._actions = this.getActions();

         var i = 0, len = this._actions.length;
         for (i; i < len; i++) {
            this._actions[i].reset();
         }
         this._completedActions = [];
      }

      public update(delta: number) {
         if (this._actions.length > 0) {
            this._currentAction = this._actions[0];
            this._currentAction.update(delta);

            if (this._currentAction.isComplete(this.actor)) {
               //Logger.getInstance().log("Action complete!", Log.DEBUG);
               this._completedActions.push(this._actions.shift());
            }
         }
      }
   }
}