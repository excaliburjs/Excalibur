/// <reference path="Algebra.ts" />
/// <reference path="Core.ts" />
/// <reference path="Entities.ts" />

module ex.Internal.Actions {
   export interface IAction {
      x: number
       y: number
       update(delta: number): void
       isComplete(actor: Actor): boolean
       reset(): void
       stop(): void
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
            Logger.getInstance().log("Attempted to moveBy time less than or equal to zero : " + time, Log.Error);
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
      private start: number;
      private end: number;
      private speed: number;
      private distance: number;
      private _started = false;
      private _stopped = false;
      constructor(actor: Actor, scale: number, speed: number) {
         this.actor = actor;
         this.end = scale;
         this.speed = speed;

      }

      public update(delta: number): void {
         if (!this._started) {
            this._started = true;
            this.start = this.actor.scale;
            this.distance = Math.abs(this.end - this.start);
         }
         var direction = this.end < this.start ? -1 : 1;
         this.actor.sx = this.speed * direction;

         //Logger.getInstance().log("Pos x: " + this.actor.x +"  y:" + this.actor.y, Log.DEBUG);
         if (this.isComplete(this.actor)) {
            this.actor.scale = this.end;
            this.actor.sx = 0;
         }
      }

      public isComplete(actor: Actor): boolean {
         return this._stopped || Math.abs(this.actor.scale - this.start) >= this.distance;
      }

      public stop(): void {
         this.actor.sx = 0;
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
      private start: number;
      private end: number;
      private time: number;
      private distance: number;
      private _started = false;
      private _stopped = false;
      private speed: number;
      constructor(actor: Actor, scale: number, time: number) {
         this.actor = actor;
         this.end = scale;
         this.time = time;
         this.speed = (this.end - this.actor.scale) / time * 1000;

      }

      public update(delta: number): void {
         if (!this._started) {
            this._started = true;
            this.start = this.actor.scale;
            this.distance = Math.abs(this.end - this.start);
         }
         var direction = this.end < this.start ? -1 : 1;
         this.actor.sx = this.speed * direction;

         //Logger.getInstance().log("Pos x: " + this.actor.x +"  y:" + this.actor.y, Log.DEBUG);
         if (this.isComplete(this.actor)) {
            this.actor.scale = this.end;
            this.actor.sx = 0;
         }
      }

      public isComplete(actor: Actor): boolean {
         return this._stopped || (Math.abs(this.actor.scale - this.start) >= this.distance);
      }

      public stop(): void {
         this.actor.sx = 0;
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
      public x: number;
      public y: number;

      private frequency: number;
      private duration: number;
      private actor: Actor;
      private numBlinks: number;
      private blinkTime: number;

      private _started: boolean = false;
      private nextBlink: number = 0;
      private elapsedTime: number = 0;
      private isBlinking: boolean = false;
      private _stopped: boolean = false;

      constructor(actor: Actor, frequency: number, duration: number, blinkTime?: number) {
         this.actor = actor;
         this.frequency = frequency;
         this.duration = duration;
         this.numBlinks = Math.floor(frequency * duration / 1000);
         this.blinkTime = blinkTime || 200;
      }

      public update(delta): void {
         if (!this._started) {
            this._started = true;
            this.nextBlink += this.duration / this.numBlinks / 2;
         }
         this.x = this.actor.x;
         this.y = this.actor.y;

         this.elapsedTime += delta;
         if ((this.elapsedTime + this.blinkTime / 2) > this.nextBlink && this.nextBlink > (this.elapsedTime - this.blinkTime / 2)) {
            this.isBlinking = true;
            this.actor.invisible = true;
         } else {
            if (this.isBlinking) {
               this.isBlinking = false;
               this.nextBlink += this.duration / this.numBlinks;
            }
            this.actor.invisible = false;
         }

         if (this.isComplete(this.actor)) {
            this.actor.invisible = false;
         }

      }

      public isComplete(actor: Actor): boolean {
         return this._stopped || (this.elapsedTime >= this.duration);
      }

      public stop(): void {
         this.actor.invisible = false;
         this._stopped = true;
      }

      public reset() {
         this._started = false;
         this.nextBlink = 0;
         this.elapsedTime = 0;
         this.isBlinking = false;
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
         actions.forEach((action) => {
            action.reset();
            this.actionQueue.add(action);
         });
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
         actions.forEach((action) => {
            action.reset();
            this.actionQueue.add(action);
         });
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
         this._currentAction.stop();
      }

      public getActions(): IAction[] {
         return this._actions.concat(this._completedActions);
      }

      public hasNext(): boolean {
         return this._actions.length > 0;
      }

      public reset(): void {
         this._actions = this.getActions();
         this._actions.forEach((action) => {
            action.reset();
         })
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