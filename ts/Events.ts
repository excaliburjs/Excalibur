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
   This product includes software developed by the ExcaliburJS Team.
4. Neither the name of the creator nor the
   names of its contributors may be used to endorse or promote products
   derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE EXCALIBURJS TEAM ''AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE EXCALIBURJS TEAM BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSIENSS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/// <reference path="Core.ts" />
/// <reference path="Entities.ts" />
/// <reference path="Log.ts" />

enum EventType {
   KEYDOWN,
   KEYUP,
   KEYPRESS,
   MOUSEDOWN,
   MOUSEUP,
   CLICK,
   USEREVENT,
   COLLISION,
   BLUR,
   FOCUS,
   UPDATE
}

class ActorEvent {
   constructor(){}
}

class CollisionEvent extends ActorEvent {
   constructor(public actor : Actor, public other : Actor, public side : Side) {
      super();
   }
}

class UpdateEvent extends ActorEvent {
   constructor(public delta : number){
      super();
   }
}

class KeyEvent extends ActorEvent {
   constructor(public actor : Actor, public key : Keys){
      super();
   }
}

class KeyDown extends ActorEvent {
   constructor(public key : Keys){
      super();
   }
}

class KeyUp extends ActorEvent {
   constructor(public key : Keys){
      super();
   }
}

class KeyPress extends ActorEvent {
   constructor(public key : Keys){
      super();
   }
}

class MouseDown extends ActorEvent {
   constructor(public x : number, public y : number){
      super();
   }
}

class MouseUp extends ActorEvent {
   constructor(public x : number, public y : number){
      super();
   }
}

class Click extends ActorEvent {
   constructor(public x : number, public y : number){
      super();
   }
}

class EventDispatcher {
   private _handlers : {[key : string] : { (event?: ActorEvent) : void}[]; } = {};
   private queue : {(any: void):void}[] = [];
   private target : any;
   private log : Logger = Logger.getInstance();
   constructor(target){
      this.target = target;
   }

   public publish(eventName: string, event?: ActorEvent){
      if(!eventName){
         // key not mapped
         return;
      }
      eventName = eventName.toLowerCase();
      var queue = this.queue;
      var target = this.target;
      if(this._handlers[eventName]){
         this._handlers[eventName].forEach(function(callback){
            queue.push(function(){
               callback.call(target, event);
            });
         });
      }
   }

   public subscribe(eventName: string, handler: (event?: ActorEvent) => void){
      eventName = eventName.toLowerCase();
      if(!this._handlers[eventName]){
         this._handlers[eventName] = [];
      }
      this._handlers[eventName].push(handler);
   }

   public update(){
      var callback;
      while(callback = this.queue.shift()){
         callback();
      }
   }

}