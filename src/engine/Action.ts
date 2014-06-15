/// <reference path="Algebra.ts" />
/// <reference path="Engine.ts" />
/// <reference path="Actor.ts" />

module ex.Internal.Actions {
   export interface IAction {
      update(delta: number): void
      isComplete(actor: Actor): boolean
      reset(): void
      stop(): void
   }

   export class MoveTo implements IAction {
      private _actor: Actor;
      public x: number;
      public y: number;
      private _start: Vector;
      private _end: Vector;
      private _dir: Vector;
      private _speed: number;
      private _distance: number;
      private _started = false;
      private _stopped = false;
      constructor(actor: Actor, destx: number, desty: number, speed: number) {
         this._actor = actor;
         this._end = new Vector(destx, desty);
         this._speed = speed;

      }

      public update(delta: number): void {
         if (!this._started) {
            this._started = true;
            this._start = new Vector(this._actor.x, this._actor.y);
            this._distance = this._start.distance(this._end);
            this._dir = this._end.minus(this._start).normalize();
         }
         var m = this._dir.scale(this._speed);
         this._actor.dx = m.x;
         this._actor.dy = m.y;

         //Logger.getInstance().log("Pos x: " + this.actor.x +"  y:" + this.actor.y, Log.DEBUG);
         if (this.isComplete(this._actor)) {
            this._actor.x = this._end.x;
            this._actor.y = this._end.y;
            this._actor.dy = 0;
            this._actor.dx = 0;
         }
      }

      public isComplete(actor: Actor): boolean {
         return this._stopped || (new Vector(actor.x, actor.y)).distance(this._start) >= this._distance;
      }

      public stop(): void {
         this._actor.dy = 0;
         this._actor.dx = 0;
         this._stopped = true;
      }

      public reset(): void {
         this._started = false;
      }
   }

   export class MoveBy implements IAction {
      private _actor: Actor;
      public x: number;
      public y: number;
      private _distance: number;
      private _speed: number;
      private _time: number;

      private _start: Vector;
      private _end: Vector;
      private _dir: Vector;
      private _started = false;
      private _stopped = false;
      constructor(actor: Actor, destx: number, desty: number, time: number) {
         this._actor = actor;
         this._end = new Vector(destx, desty);
         if (time <= 0) {
            Logger.getInstance().error("Attempted to moveBy time less than or equal to zero : " + time);
            throw new Error("Cannot move in time <= 0");
         }
         this._time = time;

      }

      public update(delta: Number) {
         if (!this._started) {
            this._started = true;
            this._start = new Vector(this._actor.x, this._actor.y);
            this._distance = this._start.distance(this._end);
            this._dir = this._end.minus(this._start).normalize();
            this._speed = this._distance / (this._time / 1000);
         }

         var m = this._dir.scale(this._speed);
         this._actor.dx = m.x;
         this._actor.dy = m.y;

         //Logger.getInstance().log("Pos x: " + this.actor.x +"  y:" + this.actor.y, Log.DEBUG);
         if (this.isComplete(this._actor)) {
            this._actor.x = this._end.x;
            this._actor.y = this._end.y;
            this._actor.dy = 0;
            this._actor.dx = 0;
         }
      }

      public isComplete(actor: Actor): boolean {
         return this._stopped || (new Vector(actor.x, actor.y)).distance(this._start) >= this._distance;
      }

      public stop(): void {
         this._actor.dy = 0;
         this._actor.dx = 0;
         this._stopped = true;
      }

      public reset(): void {
         this._started = false;
      }
   }

   export class Follow implements IAction {
      private _actor : Actor;
      private _actorToFollow : Actor;
      public x : number;
      public y : number;
      private _current : Vector;
      private _end : Vector;
      private _dir : Vector;
      private _speed : number;
      private _maximumDistance : number;
      private _distanceBetween : number;
      private _started = false;
      private _stopped = false;

      constructor(actor: Actor, actorToFollow : Actor, followDistance? : number){
         this._actor = actor;
         this._actorToFollow = actorToFollow;
         this._current = new Vector(this._actor.x, this._actor.y);
         this._end = new Vector(actorToFollow.x, actorToFollow.y);
         this._maximumDistance = (followDistance != undefined) ? followDistance : this._current.distance(this._end);
         this._speed = 0;
      }

      public update(delta : number) : void {
         if(!this._started){
            this._started = true;
            this._distanceBetween = this._current.distance(this._end);
            this._dir = this._end.minus(this._current).normalize();
         }
            
            var actorToFollowSpeed = Math.sqrt(Math.pow(this._actorToFollow.dx, 2) + Math.pow(this._actorToFollow.dy, 2));
            if (actorToFollowSpeed != 0){
               this._speed = actorToFollowSpeed;
            }
            this._current.x = this._actor.x;
            this._current.y = this._actor.y;

         this._end.x = this._actorToFollow.x;
         this._end.y = this._actorToFollow.y;
         this._distanceBetween = this._current.distance(this._end);
         this._dir = this._end.minus(this._current).normalize();

         if (this._distanceBetween >= this._maximumDistance){
            var m = this._dir.scale(this._speed);
            this._actor.dx = m.x;
            this._actor.dy = m.y;
         } else {
            this._actor.dx = 0;
            this._actor.dy = 0;
         }

         if (this.isComplete(this._actor)){
            // TODO this should never occur
            this._actor.x = this._end.x;
            this._actor.y = this._end.y;
            this._actor.dy = 0;
            this._actor.dx = 0;
         }
      }

      public stop(): void {
            this._actor.dy = 0;
            this._actor.dx = 0;
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
      private _actor : Actor;
      private _actorToMeet : Actor;
      public x : number;
      public y : number;
      private _current : Vector;
      private _end : Vector;
      private _dir : Vector;
      private _speed : number;
      private _distanceBetween : number;
      private _started = false;
      private _stopped = false;
      private _speedWasSpecified = false;

      constructor(actor: Actor, actorToMeet : Actor, speed? : number){
         this._actor = actor;
         this._actorToMeet = actorToMeet;
         this._current = new Vector(this._actor.x, this._actor.y);
         this._end = new Vector(actorToMeet.x, actorToMeet.y);
         this._speed = speed || 0;

         if (speed != undefined){
            this._speedWasSpecified = true;
         }
      }

      public update(delta : number) : void {
         if(!this._started){
            this._started = true;
            this._distanceBetween = this._current.distance(this._end);
            this._dir = this._end.minus(this._current).normalize();
         }

         var actorToMeetSpeed = Math.sqrt(Math.pow(this._actorToMeet.dx, 2) + Math.pow(this._actorToMeet.dy, 2));
         if ((actorToMeetSpeed != 0) && (!this._speedWasSpecified)){
            this._speed = actorToMeetSpeed;
         }
         this._current.x = this._actor.x;
         this._current.y = this._actor.y;

         this._end.x = this._actorToMeet.x;
         this._end.y = this._actorToMeet.y;
         this._distanceBetween = this._current.distance(this._end);
         this._dir = this._end.minus(this._current).normalize();

         var m = this._dir.scale(this._speed);
         this._actor.dx = m.x;
         this._actor.dy = m.y;

         if (this.isComplete(this._actor)){
            // console.log("meeting is complete")
            this._actor.x = this._end.x;
            this._actor.y = this._end.y;
            this._actor.dy = 0;
            this._actor.dx = 0;
         }
      }

      public isComplete(actor : Actor) : boolean{
         return this._stopped || (this._distanceBetween <= 1);
      }

      public stop(): void {
         this._actor.dy = 0;
         this._actor.dx = 0;
         this._stopped = true;
      }

      public reset() : void {
         this._started = false;
      }
   }

   export class RotateTo implements IAction {
      private _actor: Actor;
      public x: number;
      public y: number;
      private _start: number;
      private _end: number;
      private _speed: number;
      private _distance: number;
      private _started = false;
      private _stopped = false;
      constructor(actor: Actor, angleRadians: number, speed: number) {
         this._actor = actor;
         this._end = angleRadians;
         this._speed = speed;

      }

      public update(delta: number): void {
         if (!this._started) {
            this._started = true;
            this._start = this._actor.rotation;
            this._distance = Math.abs(this._end - this._start);
         }
         this._actor.rx = this._speed;

         //Logger.getInstance().log("Pos x: " + this.actor.x +"  y:" + this.actor.y, Log.DEBUG);
         if (this.isComplete(this._actor)) {
            this._actor.rotation = this._end;
            this._actor.rx = 0;
         }
      }

      public isComplete(actor: Actor): boolean {
         return this._stopped || (Math.abs(this._actor.rotation - this._start) >= this._distance);
      }

      public stop(): void {
         this._actor.rx = 0;
         this._stopped = true;
      }

      public reset(): void {
         this._started = false;
      }
   }

   export class RotateBy implements IAction {
      private _actor: Actor;
      public x: number;
      public y: number;
      private _start: number;
      private _end: number;
      private _time: number;
      private _distance: number;
      private _started = false;
      private _stopped = false;
      private _speed: number;
      constructor(actor: Actor, angleRadians: number, time: number) {
         this._actor = actor;
         this._end = angleRadians;
         this._time = time;
         this._speed = (this._end - this._actor.rotation) / time * 1000;

      }

      public update(delta: number): void {
         if (!this._started) {
            this._started = true;
            this._start = this._actor.rotation;
            this._distance = Math.abs(this._end - this._start);
         }
         this._actor.rx = this._speed;

         //Logger.getInstance().log("Pos x: " + this.actor.x +"  y:" + this.actor.y, Log.DEBUG);
         if (this.isComplete(this._actor)) {
            this._actor.rotation = this._end;
            this._actor.rx = 0;
         }
      }

      public isComplete(actor: Actor): boolean {
         return this._stopped || (Math.abs(this._actor.rotation - this._start) >= this._distance);
      }

      public stop(): void {
         this._actor.rx = 0;
         this._stopped = true;
      }

      public reset(): void {
         this._started = false;
      }
   }

   export class ScaleTo implements IAction {
      private _actor: Actor;
      public x: number;
      public y: number;
      private _startX: number;
      private _startY: number;
      private _endX: number;
      private _endY: number;
      private _speedX: number;
      private _speedY: number;
      private _distanceX: number;
      private _distanceY: number;
      private _started = false;
      private _stopped = false;
      constructor(actor: Actor, scaleX: number, scaleY: number, speedX: number, speedY: number) {
         this._actor = actor;
         this._endX = scaleX;
         this._endY = scaleY;
         this._speedX = speedX;
         this._speedY = speedY;

      }

      public update(delta: number): void {
         if (!this._started) {
            this._started = true;
            this._startX = this._actor.scaleX;
            this._startY = this._actor.scaleY;
            this._distanceX = Math.abs(this._endX - this._startX);
            this._distanceY = Math.abs(this._endY - this._startY);
         }

         if (!(Math.abs(this._actor.scaleX - this._startX) >= this._distanceX)) {
            var directionX = this._endY < this._startY ? -1 : 1;
            this._actor.sx = this._speedX * directionX;
         } else {
            this._actor.sx = 0;
         }
         
         if (!(Math.abs(this._actor.scaleY - this._startY) >= this._distanceY)) {
            var directionY = this._endY < this._startY ? -1 : 1;
            this._actor.sy = this._speedY * directionY;
         } else {
            this._actor.sy = 0;
         }

         //Logger.getInstance().log("Pos x: " + this.actor.x +"  y:" + this.actor.y, Log.DEBUG);
         if (this.isComplete(this._actor)) {
            this._actor.scaleX = this._endX;
            this._actor.scaleY = this._endY;
            this._actor.sx = 0;
            this._actor.sy = 0;
         }
      }

      public isComplete(actor: Actor): boolean {
         return this._stopped || ((Math.abs(this._actor.scaleX - this._startX) >= this._distanceX) && (Math.abs(this._actor.scaleY - this._startY) >= this._distanceY));
      }

      public stop(): void {
         this._actor.sx = 0;
         this._actor.sy = 0;
         this._stopped = true;
      }

      public reset(): void {
         this._started = false;
      }
   }

   export class ScaleBy implements IAction {
      private _actor: Actor;
      public x: number;
      public y: number;
      private _startX: number;
      private _startY: number;
      private _endX: number;
      private _endY: number;
      private _time: number;
      private _distanceX: number;
      private _distanceY: number;
      private _started = false;
      private _stopped = false;
      private _speedX: number;
      private _speedY: number;
      constructor(actor: Actor, scaleX: number, scaleY: number, time: number) {
         this._actor = actor;
         this._endX = scaleX;
         this._endY = scaleY;
         this._time = time;
         this._speedX = (this._endX - this._actor.scaleX) / time * 1000;
         this._speedY = (this._endY - this._actor.scaleY) / time * 1000;
      }

      public update(delta: number): void {
         if (!this._started) {
            this._started = true;
            this._startX = this._actor.scaleX;
            this._startY = this._actor.scaleY;
            this._distanceX = Math.abs(this._endX - this._startX);
            this._distanceY = Math.abs(this._endY - this._startY);
         }
         var directionX = this._endX < this._startX ? -1 : 1;
         var directionY = this._endY < this._startY ? -1 : 1;
         this._actor.sx = this._speedX * directionX;
         this._actor.sy = this._speedY * directionY;

         //Logger.getInstance().log("Pos x: " + this.actor.x +"  y:" + this.actor.y, Log.DEBUG);
         if (this.isComplete(this._actor)) {
            this._actor.scaleX = this._endX;
            this._actor.scaleY = this._endY;
            this._actor.sx = 0;
            this._actor.sy = 0;
         }
      }

      public isComplete(actor: Actor): boolean {
         return this._stopped || ((Math.abs(this._actor.scaleX - this._startX) >= this._distanceX) && (Math.abs(this._actor.scaleY - this._startY) >= this._distanceY));
      }

      public stop(): void {
         this._actor.sx = 0;
         this._actor.sy = 0;
         this._stopped = true;
      }

      public reset(): void {
         this._started = false;
      }
   }

   export class Delay implements IAction {
      public x: number;
      public y: number;
      private _actor: Actor;
      private _elapsedTime: number = 0;
      private _delay: number;
      private _started: boolean = false;
      private _stopped = false;
      constructor(actor: Actor, delay: number) {
         this._actor = actor;
         this._delay = delay;
      }

      public update(delta: number): void {
         if (!this._started) {
            this._started = true;
         }

         this.x = this._actor.x;
         this.y = this._actor.y;

         this._elapsedTime += delta;
      }

      isComplete(actor: Actor): boolean {
         return this._stopped || (this._elapsedTime >= this._delay);
      }

      public stop(): void {
         this._stopped = true;
      }

      reset(): void {
         this._elapsedTime = 0;
         this._started = false;
      }
   }

   export class Blink implements IAction {
      private _timeVisible: number = 0;
      private _timeNotVisible: number = 0;
      private _elapsedTime: number = 0;
      private _totalTime: number = 0;
      private _actor: Actor;
      private _duration: number;
      private _stopped: boolean = false;
      private _started: boolean = false;
      constructor(actor: Actor, timeVisible: number, timeNotVisible: number, numBlinks: number = 1) {
         this._actor = actor;
         this._timeVisible = timeVisible;
         this._timeNotVisible = timeNotVisible;
         this._duration = (timeVisible + timeNotVisible) * numBlinks;
      }

      public update(delta): void {
         if (!this._started) {
            this._started = true;
         }

         this._elapsedTime += delta;
         this._totalTime += delta;
         if (this._actor.visible && this._elapsedTime >= this._timeVisible) {
            this._actor.visible = false;
            this._elapsedTime = 0;
         }

         if (!this._actor.visible && this._elapsedTime >= this._timeNotVisible) {
            this._actor.visible = true;
            this._elapsedTime = 0;
         }

         if (this.isComplete(this._actor)) {
            this._actor.visible = true;
         }

      }

      public isComplete(actor: Actor): boolean {
         return this._stopped || (this._totalTime >= this._duration);
      }

      public stop(): void {
         this._actor.visible = true;
         this._stopped = true;
      }

      public reset() {
         this._started = false;
         this._elapsedTime = 0;
         this._totalTime = 0;
      }
   }

   export class Fade implements IAction {
      public x: number;
      public y: number;

      private _actor: Actor;
      private _endOpacity: number;
      private _speed: number;
      private _multiplyer: number = 1;
      private _started = false;
      private _stopped = false;

      constructor(actor: Actor, endOpacity: number, speed: number) {
         this._actor = actor;
         this._endOpacity = endOpacity;
         this._speed = speed;
         if (endOpacity < actor.opacity) {
            this._multiplyer = -1;
         }
      }

      public update(delta: number): void {
         if (!this._started) {
            this._started = true;
         }
         if (this._speed > 0) {
            this._actor.opacity += this._multiplyer * (Math.abs(this._actor.opacity - this._endOpacity) * delta) / this._speed;
         }
         this._speed -= delta;

         Logger.getInstance().debug("actor opacity: " + this._actor.opacity);
         if (this.isComplete(this._actor)) {
            this._actor.opacity = this._endOpacity;
         }
      }

      public isComplete(actor: Actor): boolean {
         return this._stopped || (Math.abs(this._actor.opacity - this._endOpacity) < 0.05);
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

      private _actor: Actor;

      private _started = false;
      private _stopped = false;

      constructor(actor: Actor) {
         this._actor = actor;
      }

      public update(delta: number): void {
         this._actor.actionQueue.clearActions();
         this._actor.kill();
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
      private _actor: Actor;
      private _actionQueue: ActionQueue;
      private _repeat: number;
      private _originalRepeat: number;
      private _stopped: boolean = false;
      constructor(actor: Actor, repeat: number, actions: IAction[]) {
         this._actor = actor;
         this._actionQueue = new ActionQueue(actor);
         this._repeat = repeat;
         this._originalRepeat = repeat;
         actions.forEach((action) => {
            action.reset();
            this._actionQueue.add(action);
         });
      }

      public update(delta): void {
         this.x = this._actor.x;
         this.y = this._actor.y;
         if (!this._actionQueue.hasNext()) {
            this._actionQueue.reset();
            this._repeat--;
         }
         this._actionQueue.update(delta);
      }

      public isComplete(): boolean {
         return this._stopped || (this._repeat <= 0);
      }

      public stop(): void {
         this._stopped = true;
      }

      public reset(): void {
         this._repeat = this._originalRepeat;
      }
   }

   export class RepeatForever implements IAction {
      public x: number;
      public y: number;
      private _actor: Actor;
      private _actionQueue: ActionQueue;
      private _stopped: boolean = false;
      constructor(actor: Actor, actions: IAction[]) {
         this._actor = actor;
         this._actionQueue = new ActionQueue(actor);
         actions.forEach((action) => {
            action.reset();
            this._actionQueue.add(action);
         });
      }

      public update(delta): void {
         this.x = this._actor.x;
         this.y = this._actor.y;
         if (this._stopped) {
            return;
         }


         if (!this._actionQueue.hasNext()) {
            this._actionQueue.reset();
         }

         this._actionQueue.update(delta);

      }

      public isComplete(): boolean {
         return this._stopped;
      }

      public stop(): void {
         this._stopped = true;
         this._actionQueue.clearActions();
      }

      public reset(): void { }
   }

   export class ActionQueue {
      private _actor;
      private _actions: IAction[] = [];
      private _currentAction: IAction;
      private _completedActions: IAction[] = [];
      constructor(actor: Actor) {
         this._actor = actor;
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
         });
      this._completedActions = [];
      }

      public update(delta: number) {
         if (this._actions.length > 0) {
            this._currentAction = this._actions[0];
            this._currentAction.update(delta);

            if (this._currentAction.isComplete(this._actor)) {
               //Logger.getInstance().log("Action complete!", Log.DEBUG);
               this._completedActions.push(this._actions.shift());
            }
         }
      }
   }
}