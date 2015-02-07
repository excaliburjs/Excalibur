/// <reference path="Action.ts"/>

module ex {

   export class ActionContext {
      private _actors: Actor[] = [];
      private _queues: ex.Internal.Actions.ActionQueue[] = [];

      constructor();
      constructor(actor: Actor);
      constructor(actors: Actor[]);
      constructor() {
         if (arguments !== null) {
            this._actors = Array.prototype.slice.call(arguments, 0);
            this._queues = this._actors.map((a) => {
               return a.actionQueue;
            });
         }
      }

      /**
      * Clears all queued actions from the Actor
      * @method clearActions
       */
      public clearActions(): void {
         this._queues.forEach(q => q.clearActions());
      }

      public addActorToContext(actor: Actor) {
         this._actors.push(actor);
         // if we run into problems replace the line below with:
         this._queues.push(actor.actionQueue);
      }

      public removeActorFromContext(actor: Actor) {
         var index = this._actors.indexOf(actor);
         if (index > -1) {
            this._actors.splice(index, 1);
            this._queues.splice(index, 1);
         }
      }

      /**
       * This method will move an actor to the specified x and y position at the 
       * speed specified (in pixels per second) and return back the actor. This 
       * method is part of the actor 'Action' fluent API allowing action chaining.
       * @method moveTo
       * @param x {number} The x location to move the actor to
       * @param y {number} The y location to move the actor to
       * @param speed {number} The speed in pixels per second to move
       * @returns Actor
        */
      public moveTo(x: number, y: number, speed: number): ActionContext {
         this._queues.forEach((q, i) => {
            q.add(new ex.Internal.Actions.MoveTo(this._actors[i], x, y, speed));
         });

         return this;
      }

      /**
       * This method will move an actor to the specified x and y position by a 
       * certain time (in milliseconds). This method is part of the actor 
       * 'Action' fluent API allowing action chaining.
       * @method moveBy
       * @param x {number} The x location to move the actor to
       * @param y {number} The y location to move the actor to
       * @param time {number} The time it should take the actor to move to the new location in milliseconds
       * @returns Actor
        */
      public moveBy(x: number, y: number, time: number): ActionContext {
         this._queues.forEach((q, i) => {
            q.add(new ex.Internal.Actions.MoveBy(this._actors[i], x, y, time));
         });
         return this;
      }

      /**
       * This method will rotate an actor to the specified angle at the speed
       * specified (in radians per second) and return back the actor. This 
       * method is part of the actor 'Action' fluent API allowing action chaining.
       * @method rotateTo
       * @param angleRadians {number} The angle to rotate to in radians
       * @param speed {number} The angular velocity of the rotation specified in radians per second
       * @returns Actor
        */
      public rotateTo(angleRadians: number, speed: number): ActionContext {
         this._queues.forEach((q, i) => {
            q.add(new ex.Internal.Actions.RotateTo(this._actors[i], angleRadians, speed));
         });
         return this;
      }

      /**
       * This method will rotate an actor to the specified angle by a certain
       * time (in milliseconds) and return back the actor. This method is part
       * of the actor 'Action' fluent API allowing action chaining.
       * @method rotateBy
       * @param angleRadians {number} The angle to rotate to in radians
       * @param time {number} The time it should take the actor to complete the rotation in milliseconds
       * @returns Actor
        */
      public rotateBy(angleRadians: number, time: number): ActionContext {
         this._queues.forEach((q, i) => {
            q.add(new ex.Internal.Actions.RotateBy(this._actors[i], angleRadians, time));
         });
         return this;
      }

      /**
       * This method will scale an actor to the specified size at the speed
       * specified (in magnitude increase per second) and return back the 
       * actor. This method is part of the actor 'Action' fluent API allowing 
       * action chaining.
       * @method scaleTo
       * @param size {number} The scaling factor to apply
       * @param speed {number} The speed of scaling specified in magnitude increase per second
       * @returns Actor
        */
      public scaleTo(sizeX: number, sizeY: number, speedX: number, speedY: number): ActionContext {
         this._queues.forEach((q, i) => {
            q.add(new ex.Internal.Actions.ScaleTo(this._actors[i], sizeX, sizeY, speedX, speedY));
         });
         return this;
      }

      /**
       * This method will scale an actor to the specified size by a certain time
       * (in milliseconds) and return back the actor. This method is part of the
       * actor 'Action' fluent API allowing action chaining.
       * @method scaleBy
       * @param size {number} The scaling factor to apply
       * @param time {number} The time it should take to complete the scaling in milliseconds
       * @returns Actor
        */
      public scaleBy(sizeX: number, sizeY: number, time: number): ActionContext {
         this._queues.forEach((q, i) => {
            q.add(new ex.Internal.Actions.ScaleBy(this._actors[i], sizeX, sizeY, time));
         });
         return this;
      }

      /**
       * This method will cause an actor to blink (become visible and not 
       * visible). Optionally, you may specify the number of blinks. Specify the amount of time 
       * the actor should be visible per blink, and the amount of time not visible.
       * This method is part of the actor 'Action' fluent API allowing action chaining.
       * @method blink
       * @param timeVisible {number} The amount of time to stay visible per blink in milliseconds
       * @param timeNotVisible {number} The amount of time to stay not visible per blink in milliseconds
       * @param [numBlinks] {number} The number of times to blink
       * @returns Actor
        */
      public blink(timeVisible: number, timeNotVisible: number, numBlinks: number = 1): ActionContext {
         this._queues.forEach((q, i) => {
            q.add(new ex.Internal.Actions.Blink(this._actors[i], timeVisible, timeNotVisible, numBlinks));
         });
         return this;
      }

      /**
       * This method will cause an actor's opacity to change from its current value
       * to the provided value by a specified time (in milliseconds). This method is
       * part of the actor 'Action' fluent API allowing action chaining.
       * @method fade
       * @param opacity {number} The ending opacity
       * @param time {number} The time it should take to fade the actor (in milliseconds)
       * @returns Actor
        */
      public fade(opacity: number, time: number): ActionContext {
         this._queues.forEach((q, i) => {
            q.add(new ex.Internal.Actions.Fade(this._actors[i], opacity, time));
         });
         return this;
      }

      /**
       * This method will delay the next action from executing for a certain 
       * amount of time (in milliseconds). This method is part of the actor 
       * 'Action' fluent API allowing action chaining.
       * @method delay
       * @param time {number} The amount of time to delay the next action in the queue from executing in milliseconds
       * @returns Actor
        */
      public delay(time: number): ActionContext {
         this._queues.forEach((q, i) => {
            q.add(new ex.Internal.Actions.Delay(this._actors[i], time));
         });
         return this;
      }

      /**
       * This method will add an action to the queue that will remove the actor from the 
       * scene once it has completed its previous actions. Any actions on the
       * action queue after this action will not be executed.
       * @method die
       * @returns Actor
        */
      public die(): ActionContext {
         this._queues.forEach((q, i) => {
            q.add(new ex.Internal.Actions.Die(this._actors[i]));
         });
         return this;
      }

      /**
       * This method allows you to call an arbitrary method as the next action in the
       * action queue. This is useful if you want to execute code in after a specific
       * action, i.e An actor arrives at a destinatino after traversing a path
       * @method callMethod
       * @returns Actor
        */
      public callMethod(method: () => any): ActionContext {
         this._queues.forEach((q, i) => {
            q.add(new ex.Internal.Actions.CallMethod(this._actors[i], method));
         });
         return this;
      }

      /**
       * This method will cause the actor to repeat all of the previously 
       * called actions a certain number of times. If the number of repeats 
       * is not specified it will repeat forever. This method is part of 
       * the actor 'Action' fluent API allowing action chaining
       * @method repeat
       * @param [times=undefined] {number} The number of times to repeat all the previous actions in the action queue. If nothing is specified the actions will repeat forever
       * @returns Actor
        */
      public repeat(times?: number): ActionContext {
         if (!times) {
            this.repeatForever();
            return this;
         }
         this._queues.forEach((q, i) => {
            q.add(new ex.Internal.Actions.Repeat(this._actors[i], times, this._actors[i].actionQueue.getActions()));
         });

         return this;
      }

      /**
       * This method will cause the actor to repeat all of the previously 
       * called actions forever. This method is part of the actor 'Action'
       * fluent API allowing action chaining.
       * @method repeatForever
       * @returns Actor
        */
      public repeatForever(): ActionContext {
         this._queues.forEach((q, i) => {
            q.add(new ex.Internal.Actions.RepeatForever(this._actors[i], this._actors[i].actionQueue.getActions()));
         });
         return this;
      }

      /**
       * This method will cause the actor to follow another at a specified distance
       * @method follow
       * @param actor {Actor} The actor to follow
       * @param [followDistance=currentDistance] {number} The distance to maintain when following, if not specified the actor will follow at the current distance.
       * @returns Actor
       */
      public follow(actor: Actor, followDistance?: number): ActionContext {
         this._queues.forEach((q, i) => {
            if (followDistance == undefined) {
               q.add(new ex.Internal.Actions.Follow(this._actors[i], actor));
            } else {
               q.add(new ex.Internal.Actions.Follow(this._actors[i], actor, followDistance));
            }
         });
         return this;
      }

      /**
       * This method will cause the actor to move towards another until they 
       * collide "meet" at a specified speed.
       * @method meet
       * @param actor {Actor} The actor to meet
       * @param [speed=0] {number} The speed in pixels per second to move, if not specified it will match the speed of the other actor
       * @returns Actor
       */
      public meet(actor: Actor, speed?: number): ActionContext {
         this._queues.forEach((q, i) => {
            if (speed == undefined) {
               q.add(new ex.Internal.Actions.Meet(this._actors[i], actor));
            } else {
               q.add(new ex.Internal.Actions.Meet(this._actors[i], actor, speed));
            }
         });
         return this;
      }


      /**
       * Returns a promise that resolves when the current action queue up to now
       * is finished.
       * @method asPromise
       * @returns Promise
       */
      public asPromise<T>(): Promise<T> {
         var promises = this._queues.map((q, i) => {
            var temp = new Promise<T>();
            q.add(new ex.Internal.Actions.CallMethod(this._actors[i],() => {
               temp.resolve();
            }));
            return temp;
         });
         return Promise.join.apply(this, promises);
      }

   }
} 