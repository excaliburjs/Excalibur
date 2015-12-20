/// <reference path="Action.ts"/>

module ex {

   /**
    * Action API
    *
    * The fluent Action API allows you to perform "actions" on
    * [[Actor|Actors]] such as following, moving, rotating, and
    * more. You can implement your own actions by implementing
    * the [[IAction]] interface.
    *
    * Actions can be chained together and can be set to repeat,
    * or can be interrupted to change.
    *
    * ## Chaining Actions
    *
    * You can chain actions to create a script because the action
    * methods return the context, allowing you to build a queue of
    * actions that get executed as part of an [[ActionQueue]].
    *
    * ```ts
    * class Enemy extends ex.Actor {
    *
    *   public patrol() {
    *
    *      // clear existing queue
    *      this.clearActions();
    *
    *      // guard a choke point
    *      // move to 100, 100 and take 1.2s
    *      // wait for 3s
    *      // move back to 0, 100 and take 1.2s
    *      // wait for 3s
    *      // repeat
    *      this.moveTo(100, 100, 1200)
    *        .delay(3000)
    *        .moveTo(0, 100, 1200)
    *        .delay(3000)
    *        .repeatForever();
    *   }
    * }
    * ```
    *
    * ## Example: Follow a Path
    *
    * You can use [[Actor.moveTo]] to move to a specific point,
    * allowing you to chain together actions to form a path.
    *
    * This example has a `Ship` follow a path that it guards by
    * spawning at the start point, moving to the end, then reversing
    * itself and repeating that forever.
    *
    * ```ts
    * public Ship extends ex.Actor {
    *
    *   public onInitialize() {
    *     var path = [
    *       new ex.Point(20, 20),
    *       new ex.Point(50, 40),
    *       new ex.Point(25, 30),
    *       new ex.Point(75, 80)
    *     ];
    *
    *     // spawn at start point
    *     this.x = path[0].x;
    *     this.y = path[0].y;
    *
    *     // create action queue
    *
    *     // forward path (skip first spawn point)
    *     for (var i = 1; i < path.length; i++) {
    *       this.moveTo(path[i].x, path[i].y, 300);
    *     }
    *     
    *     // reverse path (skip last point)
    *     for (var j = path.length - 2; j >= 0; j--) {
    *       this.moveTo(path[j].x, path[j].y, 300);
    *     }
    *
    *     // repeat
    *     this.repeatForever();
    *   }
    * }
    * ```
    *
    * While this is a trivial example, the Action API allows complex
    * routines to be programmed for Actors. For example, using the
    * [Tiled Map Editor](http://mapeditor.org) you can create a map that
    * uses polylines to create paths, load in the JSON using a 
    * [[Resource|Generic Resource]], create a [[TileMap]],
    * and spawn ships programmatically  while utilizing the polylines 
    * to automatically generate the actions needed to do pathing.
    *
    * ## Custom Actions
    *
    * The API does allow you to implement new actions by implementing the [[IAction]]
    * interface, but this will be improved in future versions as right now it
    * is meant for the Excalibur team and can be advanced to implement.
    *
    * You can manually manipulate an Actor's [[ActionQueue]] using 
    * [[Actor.actionQueue]]. For example, using [[ActionQueue.add]] for
    * custom actions.
    *
    * ## Future Plans
    *
    * The Excalibur team is working on extending and rebuilding the Action API
    * in future versions to support multiple timelines/scripts, better eventing,
    * and a more robust API to allow for complex and customized actions.
    *
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
       */
      public rotateTo(angleRadians: number, speed: number): ActionContext {
         var i = 0, len = this._queues.length;
         for (i; i < len; i++) {
            this._queues[i].add(new ex.Internal.Actions.RotateTo(this._actors[i], angleRadians, speed));
         }
         return this;
      }

      /**
       * This method will rotate an actor to the specified angle by a certain
       * time (in milliseconds) and return back the actor. This method is part
       * of the actor 'Action' fluent API allowing action chaining.
       * @param angleRadians  The angle to rotate to in radians
       * @param time          The time it should take the actor to complete the rotation in milliseconds
       */
      public rotateBy(angleRadians: number, time: number): ActionContext {
         var i = 0, len = this._queues.length;
         for (i; i < len; i++) {
            this._queues[i].add(new ex.Internal.Actions.RotateBy(this._actors[i], angleRadians, time));
         }
         return this;
      }

      /**
       * This method will scale an actor to the specified size at the speed
       * specified (in magnitude increase per second) and return back the 
       * actor. This method is part of the actor 'Action' fluent API allowing 
       * action chaining.
       * @param size   The scaling factor to apply
       * @param speed  The speed of scaling specified in magnitude increase per second
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
       * @param size   The scaling factor to apply
       * @param time   The time it should take to complete the scaling in milliseconds
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
       * action, i.e An actor arrives at a destinatino after traversing a path
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