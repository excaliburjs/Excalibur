/**
Copyright (c) 2013 Erik Onarheim
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.
3. All advertising materials mentioning features or use of this software
   must display the following acknowledgement:
   This product includes software developed by the GameTS Team.
4. Neither the name of the creator nor the
   names of its contributors may be used to endorse or promote products
   derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE GAMETS TEAM ''AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE GAMETS TEAM BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/// <reference path="Algebra.ts" />
/// <reference path="Core.ts" />
/// <reference path="Entities.ts" />


interface IAction {
   x : number
   y : number
   update(delta : number) : void
   isComplete(actor : Actor) : boolean
   reset() : void
}

class MoveTo implements IAction{
   private actor : Actor;
   public x : number;
   public y : number;
   private start : Vector;
   private end : Vector;
   private dir : Vector;
   private speed : number;
   private distance : number;
   private _started = false;
   constructor(actor: Actor, destx : number, desty : number, speed : number){
      this.actor = actor;
      this.end = new Vector(destx, desty);
      this.speed = speed;
      
   }

   public update(delta : number) : void {
      if(!this._started){
         this._started = true;
         this.start = new Vector(this.actor.x, this.actor.y);
         this.distance = this.start.distance(this.end);
         this.dir = this.end.minus(this.start).normalize();
      }
      var m = this.dir.scale(this.speed);
      this.actor.dx = m.x;
      this.actor.dy = m.y;

      //Logger.getInstance().log("Pos x: " + this.actor.x +"  y:" + this.actor.y, Log.DEBUG);
      if(this.isComplete(this.actor)){
         this.actor.x = this.end.x;
         this.actor.y = this.end.y;
         this.actor.dy = 0;
         this.actor.dx = 0;
      }
   }

   public isComplete(actor : Actor) : boolean{
      return (new Vector(actor.x, actor.y)).distance(this.start) >= this.distance;
   }

   public reset() : void {
      this._started = false;
   }
}

class MoveBy implements IAction {
   private actor : Actor;
   public x : number;
   public y : number;
   private distance : number;
   private speed : number;
   private time : number;

   private start : Vector;
   private end : Vector;
   private dir : Vector;
   private _started = false;
   constructor(actor: Actor, destx : number, desty : number, time : number){
      this.actor = actor;
      this.end = new Vector(destx, desty);
      if(time <= 0) {
         Logger.getInstance().log("Attempted to moveBy time less than or equal to zero : " + time, Log.ERROR);
         throw new Error("Cannot move in time <= 0");
      }
      this.time = time;

   }

   public update(delta : Number){
      if(!this._started){
         this._started = true;
         this.start = new Vector(this.actor.x, this.actor.y);
         this.distance = this.start.distance(this.end);
         this.dir = this.end.minus(this.start).normalize();
         this.speed = this.distance/(this.time);
      }

      var m = this.dir.scale(this.speed);
      this.actor.dx = m.x;
      this.actor.dy = m.y;

      //Logger.getInstance().log("Pos x: " + this.actor.x +"  y:" + this.actor.y, Log.DEBUG);
      if(this.isComplete(this.actor)){
         this.actor.x = this.end.x;
         this.actor.y = this.end.y;
         this.actor.dy = 0;
         this.actor.dx = 0;
      }
   }

   public isComplete(actor : Actor) : boolean{
      return (new Vector(actor.x, actor.y)).distance(this.start) >= this.distance;
   }

   public reset() : void {
      this._started = false;
   }
}

class RotateTo implements IAction{
   private actor : Actor;
   public x : number;
   public y : number;
   private start : number;
   private end : number;
   private speed : number;
   private distance : number;
   private _started = false;
   constructor(actor: Actor, angleRadians : number, speed : number){
      this.actor = actor;
      this.end = angleRadians;
      this.speed = speed;
      
   }

   public update(delta : number) : void {
      if(!this._started){
         this._started = true;
         this.start = this.actor.rotation;
         this.distance = Math.abs(this.end - this.start);
      }
      this.actor.rx = this.speed;

      //Logger.getInstance().log("Pos x: " + this.actor.x +"  y:" + this.actor.y, Log.DEBUG);
      if(this.isComplete(this.actor)){
         this.actor.rotation = this.end;
         this.actor.rx = 0;
      }
   }

   public isComplete(actor : Actor) : boolean{
      return Math.abs(this.actor.rotation - this.start) >= this.distance;
   }

   public reset() : void {
      this._started = false;
   }
}

class RotateBy implements IAction{
   private actor : Actor;
   public x : number;
   public y : number;
   private start : number;
   private end : number;
   private time : number;
   private distance : number;
   private _started = false;
   private speed : number;
   constructor(actor: Actor, angleRadians : number, time : number){
      this.actor = actor;
      this.end = angleRadians;
      this.time = time;
      this.speed = (this.end - this.actor.rotation)/time*1000;
      
   }

   public update(delta : number) : void {
      if(!this._started){
         this._started = true;
         this.start = this.actor.rotation;
         this.distance = Math.abs(this.end - this.start);
      }
      this.actor.rx = this.speed;

      //Logger.getInstance().log("Pos x: " + this.actor.x +"  y:" + this.actor.y, Log.DEBUG);
      if(this.isComplete(this.actor)){
         this.actor.rotation = this.end;
         this.actor.rx = 0;
      }
   }

   public isComplete(actor : Actor) : boolean{
      return Math.abs(this.actor.rotation - this.start) >= this.distance;
   }

   public reset() : void {
      this._started = false;
   }
}

class ScaleTo implements IAction{
   private actor : Actor;
   public x : number;
   public y : number;
   private start : number;
   private end : number;
   private speed : number;
   private distance : number;
   private _started = false;
   constructor(actor: Actor, scale : number, speed : number){
      this.actor = actor;
      this.end = scale;
      this.speed = speed;
      
   }

   public update(delta : number) : void {
      if(!this._started){
         this._started = true;
         this.start = this.actor.scale;
         this.distance = Math.abs(this.end - this.start);
      }
      var direction = this.end < this.start ? -1 : 1;
      this.actor.sx = this.speed * direction;

      //Logger.getInstance().log("Pos x: " + this.actor.x +"  y:" + this.actor.y, Log.DEBUG);
      if(this.isComplete(this.actor)){
         this.actor.scale = this.end;
         this.actor.sx = 0;
      }
   }

   public isComplete(actor : Actor) : boolean{
      return Math.abs(this.actor.scale - this.start) >= this.distance;
   }

   public reset() : void {
      this._started = false;
   }
}

class ScaleBy implements IAction{
   private actor : Actor;
   public x : number;
   public y : number;
   private start : number;
   private end : number;
   private time : number;
   private distance : number;
   private _started = false;
   private speed : number;
   constructor(actor: Actor, scale : number, time : number){
      this.actor = actor;
      this.end = scale;
      this.time = time;
      this.speed = (this.end - this.actor.scale)/time*1000;
      
   }

   public update(delta : number) : void {
      if(!this._started){
         this._started = true;
         this.start = this.actor.scale;
         this.distance = Math.abs(this.end - this.start);
      }
      var direction = this.end < this.start ? -1 : 1;
      this.actor.sx = this.speed * direction;

      //Logger.getInstance().log("Pos x: " + this.actor.x +"  y:" + this.actor.y, Log.DEBUG);
      if(this.isComplete(this.actor)){
         this.actor.scale = this.end;
         this.actor.sx = 0;
      }
   }

   public isComplete(actor : Actor) : boolean{
      return Math.abs(this.actor.scale - this.start) >= this.distance;
   }

   public reset() : void {
      this._started = false;
   }
}

class Delay implements IAction {
   public x : number;
   public y : number;
   private actor : Actor;
   private elapsedTime : number = 0;
   private delay : number;
   private _started : boolean = false;
   constructor(actor : Actor, delay : number){
      this.actor = actor;
      this.delay = delay;
   }

   public update(delta : number) : void {
      if(!this._started){
         this._started = true;
      }

      this.x = this.actor.x;
      this.y = this.actor.y;

      this.elapsedTime += delta;
   }

   isComplete(actor : Actor) : boolean {
      return this.elapsedTime >= this.delay;
   }

   reset() : void {
      this.elapsedTime = 0;
      this._started = false;
   }
}


class Blink implements IAction {
   public x : number;
   public y : number;

   private frequency : number;
   private duration : number;
   private actor : Actor;
   private numBlinks : number;

   private _started : boolean = false;
   private nextBlink : number = 0;
   private elapsedTime : number = 0;
   private isBlinking : boolean = false;
   constructor(actor : Actor, frequency : number, duration : number){
      this.actor = actor;
      this.frequency = frequency;
      this.duration = duration;
      this.numBlinks = Math.floor(frequency * duration);
   }

   public update(delta) : void {
      if(!this._started){
         this._started = true;
         this.nextBlink += this.duration/this.numBlinks;
      }
      this.x = this.actor.x;
      this.y = this.actor.y;

      this.elapsedTime += delta;
      if(this.elapsedTime+100>this.nextBlink && this.nextBlink>this.elapsedTime-100){
         this.isBlinking = true;
         this.actor.invisible = true;
      } else {
         if(this.isBlinking){
            this.isBlinking = false;
            this.nextBlink += this.duration/this.numBlinks;
         }
      
         this.actor.invisible = false;;
      }

      if(this.isComplete(this.actor)){
         this.actor.invisible = false;
      }

   }

   public isComplete(actor : Actor) : boolean {
      return this.elapsedTime >= this.duration;
   }

   public reset(){
      this._started = false;
      this.nextBlink = 0;
      this.elapsedTime = 0;
      this.isBlinking = false;
   }
}

class Repeat implements IAction {
   public x : number;
   public y : number;
   private actor : Actor;
   private actionQueue : ActionQueue;
   private repeat : number;
   private originalRepeat : number;
   constructor(actor : Actor, repeat : number, actions : IAction[]){
      this.actor = actor;
      this.actionQueue = new ActionQueue(actor);
      this.repeat = repeat;
      this.originalRepeat = repeat;
      actions.forEach((action)=>{
         action.reset();
         this.actionQueue.add(action);
      });
   }

   public update(delta) : void {
      this.x = this.actor.x;
      this.y = this.actor.y;
      if(!this.actionQueue.hasNext()){
         this.actionQueue.reset();
         this.repeat--;
      }
      this.actionQueue.update(delta);
   }

   public isComplete() : boolean {
      return this.repeat <= 0;
   }

   public reset() : void {
      this.repeat = this.originalRepeat;
   }
}

class RepeatForever implements IAction {
   public x : number;
   public y : number;
   private actor : Actor;
   private actionQueue : ActionQueue;
   constructor(actor : Actor, actions : IAction[]){
      this.actor = actor;
      this.actionQueue = new ActionQueue(actor);
      actions.forEach((action)=>{
         action.reset();
         this.actionQueue.add(action);
      });
   }

   public update(delta) : void {
      this.x = this.actor.x;
      this.y = this.actor.y;
      if(!this.actionQueue.hasNext()){
         this.actionQueue.reset();
      }
      this.actionQueue.update(delta);
   }

   public isComplete() : boolean {
      return false;
   }

   public reset() : void { }
}

class ActionQueue {
   private actor;
   private _actions : IAction[] = [];
   private _currentAction : IAction;
   private _completedActions : IAction[] = [];
   constructor(actor : Actor){
      this.actor = actor;
   }

   public add(action : IAction){
      this._actions.push(action);
   }

   public remove(action: IAction){
      var index = this._actions.indexOf(action);
      this._actions.splice(index, 1);
   }

   public getActions() : IAction[]{
      return this._actions.concat(this._completedActions);
   }

   public hasNext() : boolean {
      return this._actions.length > 1;
   }

   public reset() : void {
      this._actions = this.getActions();
      this._actions.forEach((action)=>{
         action.reset();
      })
      this._completedActions = [];
   }

   public update (delta: number){
      if(this._actions.length > 0){
         this._currentAction = this._actions[0];
         this._currentAction.update(delta);

         if(this._currentAction.isComplete(this.actor)){
            //Logger.getInstance().log("Action complete!", Log.DEBUG);
            this._completedActions.push(this._actions.shift());
         }
      }
   }
}