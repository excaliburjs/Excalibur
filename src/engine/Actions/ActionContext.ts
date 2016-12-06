/// <reference path="Action.ts"/>

module ex {

   /**
    * The fluent Action API allows you to perform "actions" on
    * [[Actor|Actors]] such as following, moving, rotating, and
    * more. You can implement your own actions by implementing
    * the [[IAction]] interface.
    *
    * [[include:Actions.md]]
    */
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
       */
      public clearActions(): void {
         var i = 0, len = this._queues.length;
         for (i; i < len; i++) {
            this._queues[i].clearActions();
         }
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
        * This method will move an actor to the specified `x` and `y` position over the 
        * specified duration using a given [[EasingFunctions]] and return back the actor. This 
        * method is part of the actor 'Action' fluent API allowing action chaining.
        * @param x         The x location to move the actor to
        * @param y         The y location to move the actor to
        * @param duration  The time it should take the actor to move to the new location in milliseconds
        * @param easingFcn Use [[EasingFunctions]] or a custom function to use to calculate position
        */
      public easeTo(x: number,
                    y: number,
                    duration: number,
                    easingFcn: EasingFunction = ex.EasingFunctions.Linear) {

         var i = 0, len = this._queues.length;
         
         for (i; i < len; i++) {
            this._queues[i].add(new ex.Internal.Actions.EaseTo(this._actors[i], x, y, duration, easingFcn));
         }
         
         return this;       
      }

      /**
       * This method will move an actor to the specified x and y position at the 
       * speed specified (in pixels per second) and return back the actor. This 
       * method is part of the actor 'Action' fluent API allowing action chaining.
       * @param x      The x location to move the actor to
       * @param y      The y location to move the actor to
       * @param speed  The speed in pixels per second to move
       */
      public moveTo(x: number, y: number, speed: number): ActionContext {
         var i = 0, len = this._queues.length;
         for (i; i < len; i++) {
            this._queues[i].add(new ex.Internal.Actions.MoveTo(this._actors[i], x, y, speed));
         }

         return this;
      }

      /**
       * This method will move an actor to the specified x and y position by a 
       * certain time (in milliseconds). This method is part of the actor 
       * 'Action' fluent API allowing action chaining.
       * @param x     The x location to move the actor to
       * @param y     The y location to move the actor to
       * @param time  The time it should take the actor to move to the new location in milliseconds
       */
      public moveBy(x: number, y: number, time: number): ActionContext {
         var i = 0, len = this._queues.length;
         for (i; i < len; i++) {
            this._queues[i].add(new ex.Internal.Actions.MoveBy(this._actors[i], x, y, time));
         }
         return this;
      }

      /**
       * This method will rotate an actor to the specified angle at the speed
       * specified (in radians per second) and return back the actor. This 
       * method is part of the actor 'Action' fluent API allowing action chaining.
       * @param angleRadians  The angle to rotate to in radians
       * @param speed         The angular velocity of the rotation specified in radians per second
       * @param rotationType  The [[RotationType]] to use for this rotation
       */
      public rotateTo(angleRadians: number, speed: number, rotationType?: RotationType): ActionContext {
         var i = 0, len = this._queues.length;
         for (i; i < len; i++) {
             this._queues[i].add(new ex.Internal.Actions.RotateTo(this._actors[i], angleRadians, speed, rotationType));
         }
         return this;
      }

      /**
       * This method will rotate an actor to the specified angle by a certain
       * time (in milliseconds) and return back the actor. This method is part
       * of the actor 'Action' fluent API allowing action chaining.
       * @param angleRadians  The angle to rotate to in radians
       * @param time          The time it should take the actor to complete the rotation in milliseconds
       * @param rotationType  The [[RotationType]] to use for this rotation
       */
      public rotateBy(angleRadians: number, time: number, rotationType?: RotationType): ActionContext {
         var i = 0, len = this._queues.length;
         for (i; i < len; i++) {
             this._queues[i].add(new ex.Internal.Actions.RotateBy(this._actors[i], angleRadians, time, rotationType));
         }
         return this;
      }

      /**
       * This method will scale an actor to the specified size at the speed
       * specified (in magnitude increase per second) and return back the 
       * actor. This method is part of the actor 'Action' fluent API allowing 
       * action chaining.
       * @param sizeX   The scaling factor to apply on X axis
       * @param sizeY   The scaling factor to apply on Y axis
       * @param speedX  The speed of scaling specified in magnitude increase per second on X axis
       * @param speedY  The speed of scaling specified in magnitude increase per second on Y axis
       */
      public scaleTo(sizeX: number, sizeY: number, speedX: number, speedY: number): ActionContext {
         var i = 0, len = this._queues.length;
         for (i; i < len; i++) {
            this._queues[i].add(new ex.Internal.Actions.ScaleTo(this._actors[i], sizeX, sizeY, speedX, speedY));
         }
         return this;
      }

      /**
       * This method will scale an actor to the specified size by a certain time
       * (in milliseconds) and return back the actor. This method is part of the
       * actor 'Action' fluent API allowing action chaining.
       * @param sizeX   The scaling factor to apply on X axis
       * @param sizeY   The scaling factor to apply on Y axis
       * @param time    The time it should take to complete the scaling in milliseconds
       */
      public scaleBy(sizeX: number, sizeY: number, time: number): ActionContext {
         var i = 0, len = this._queues.length;
         for (i; i < len; i++) {
            this._queues[i].add(new ex.Internal.Actions.ScaleBy(this._actors[i], sizeX, sizeY, time));
         }
         return this;
      }

      /**
       * This method will cause an actor to blink (become visible and not 
       * visible). Optionally, you may specify the number of blinks. Specify the amount of time 
       * the actor should be visible per blink, and the amount of time not visible.
       * This method is part of the actor 'Action' fluent API allowing action chaining.
       * @param timeVisible     The amount of time to stay visible per blink in milliseconds
       * @param timeNotVisible  The amount of time to stay not visible per blink in milliseconds
       * @param numBlinks       The number of times to blink
       */
      public blink(timeVisible: number, timeNotVisible: number, numBlinks: number = 1): ActionContext {
         var i = 0, len = this._queues.length;
         for (i; i < len; i++) {
            this._queues[i].add(new ex.Internal.Actions.Blink(this._actors[i], timeVisible, timeNotVisible, numBlinks));
         }
         return this;
      }

      /**
       * This method will cause an actor's opacity to change from its current value
       * to the provided value by a specified time (in milliseconds). This method is
       * part of the actor 'Action' fluent API allowing action chaining.
       * @param opacity  The ending opacity
       * @param time     The time it should take to fade the actor (in milliseconds)
       */
      public fade(opacity: number, time: number): ActionContext {
         var i = 0, len = this._queues.length;
         for (i; i < len; i++) {
            this._queues[i].add(new ex.Internal.Actions.Fade(this._actors[i], opacity, time));
         }
         return this;
      }

      /**
       * This method will delay the next action from executing for a certain 
       * amount of time (in milliseconds). This method is part of the actor 
       * 'Action' fluent API allowing action chaining.
       * @param time  The amount of time to delay the next action in the queue from executing in milliseconds
       */
      public delay(time: number): ActionContext {
         var i = 0, len = this._queues.length;
         for (i; i < len; i++) {
            this._queues[i].add(new ex.Internal.Actions.Delay(this._actors[i], time));
         }
         return this;
      }

      /**
       * This method will add an action to the queue that will remove the actor from the 
       * scene once it has completed its previous actions. Any actions on the
       * action queue after this action will not be executed.
       */
      public die(): ActionContext {
         var i = 0, len = this._queues.length;
         for (i; i < len; i++) {
            this._queues[i].add(new ex.Internal.Actions.Die(this._actors[i]));
         }
         return this;
      }

      /**
       * This method allows you to call an arbitrary method as the next action in the
       * action queue. This is useful if you want to execute code in after a specific
       * action, i.e An actor arrives at a destination after traversing a path
       */
      public callMethod(method: () => any): ActionContext {
         var i = 0, len = this._queues.length;
         for (i; i < len; i++) {
            this._queues[i].add(new ex.Internal.Actions.CallMethod(this._actors[i], method));
         }
         return this;
      }

      /**
       * This method will cause the actor to repeat all of the previously 
       * called actions a certain number of times. If the number of repeats 
       * is not specified it will repeat forever. This method is part of 
       * the actor 'Action' fluent API allowing action chaining
       * @param times  The number of times to repeat all the previous actions in the action queue. If nothing is specified the actions 
       * will repeat forever
       */
      public repeat(times?: number): ActionContext {
         if (!times) {
            this.repeatForever();
            return this;
         }
         var i = 0, len = this._queues.length;
         for (i; i < len; i++) {
            this._queues[i].add(new ex.Internal.Actions.Repeat(this._actors[i], times, this._actors[i].actionQueue.getActions()));
         }

         return this;
      }

      /**
       * This method will cause the actor to repeat all of the previously 
       * called actions forever. This method is part of the actor 'Action'
       * fluent API allowing action chaining.
       */
      public repeatForever(): ActionContext {
         var i = 0, len = this._queues.length;
         for (i; i < len; i++) {
            this._queues[i].add(new ex.Internal.Actions.RepeatForever(this._actors[i], this._actors[i].actionQueue.getActions()));
         }
         return this;
      }

      /**
       * This method will cause the actor to follow another at a specified distance
       * @param actor           The actor to follow
       * @param followDistance  The distance to maintain when following, if not specified the actor will follow at the current distance.
       */
      public follow(actor: Actor, followDistance?: number): ActionContext {
         var i = 0, len = this._queues.length;
         for (i; i < len; i++) {
            if (followDistance === undefined) {
               this._queues[i].add(new ex.Internal.Actions.Follow(this._actors[i], actor));
            } else {
               this._queues[i].add(new ex.Internal.Actions.Follow(this._actors[i], actor, followDistance));
            }
         }
         return this;
      }

      /**
       * This method will cause the actor to move towards another until they 
       * collide "meet" at a specified speed.
       * @param actor  The actor to meet
       * @param speed  The speed in pixels per second to move, if not specified it will match the speed of the other actor
       */
      public meet(actor: Actor, speed?: number): ActionContext {
         var i = 0, len = this._queues.length;
         for (i; i < len; i++) {
            if (speed === undefined) {
               this._queues[i].add(new ex.Internal.Actions.Meet(this._actors[i], actor));
            } else {
               this._queues[i].add(new ex.Internal.Actions.Meet(this._actors[i], actor, speed));
            }
         }
         return this;
      }


      /**
       * Returns a promise that resolves when the current action queue up to now
       * is finished.
       */
      public asPromise<T>(): Promise<T> {
         var promises = this._queues.map((q, i) => {
            var temp = new Promise<T>();
            q.add(new ex.Internal.Actions.CallMethod(this._actors[i], () => {
               temp.resolve();
            }));
            return temp;
         });
         return Promise.join.apply(this, promises);
      }

   }
} 