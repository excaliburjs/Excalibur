import * as Actions from './Action';
import { RotationType } from './RotationType';

import { Actor } from '../Actor';
import { Promise } from '../Promises';
import { EasingFunction, EasingFunctions } from '../Util/EasingFunctions';

/**
 * The fluent Action API allows you to perform "actions" on
 * [[Actor|Actors]] such as following, moving, rotating, and
 * more. You can implement your own actions by implementing
 * the [[Action]] interface.
 */
export class ActionContext {
  private _actors: Actor[] = [];
  private _queues: Actions.ActionQueue[] = [];

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
    const len = this._queues.length;
    for (let i = 0; i < len; i++) {
      this._queues[i].clearActions();
    }
  }

  public addActorToContext(actor: Actor) {
    this._actors.push(actor);
    // if we run into problems replace the line below with:
    this._queues.push(actor.actionQueue);
  }

  public removeActorFromContext(actor: Actor) {
    const index = this._actors.indexOf(actor);
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
  public easeTo(x: number, y: number, duration: number, easingFcn: EasingFunction = EasingFunctions.Linear) {
    const len = this._queues.length;

    for (let i = 0; i < len; i++) {
      this._queues[i].add(new Actions.EaseTo(this._actors[i], x, y, duration, easingFcn));
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
    const len = this._queues.length;
    for (let i = 0; i < len; i++) {
      this._queues[i].add(new Actions.MoveTo(this._actors[i], x, y, speed));
    }

    return this;
  }

  /**
   * This method will move an actor by the specified x offset and y offset from its current position, at a certain speed.
   * This method is part of the actor 'Action' fluent API allowing action chaining.
   * @param xOffset     The x offset to apply to this actor
   * @param yOffset     The y location to move the actor to
   * @param speed  The speed in pixels per second the actor should move
   */
  public moveBy(xOffset: number, yOffset: number, speed: number): ActionContext {
    const len = this._queues.length;
    for (let i = 0; i < len; i++) {
      this._queues[i].add(new Actions.MoveBy(this._actors[i], xOffset, yOffset, speed));
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
    const len = this._queues.length;
    for (let i = 0; i < len; i++) {
      this._queues[i].add(new Actions.RotateTo(this._actors[i], angleRadians, speed, rotationType));
    }
    return this;
  }

  /**
   * This method will rotate an actor by the specified angle offset, from it's current rotation given a certain speed
   * in radians/sec and return back the actor. This method is part
   * of the actor 'Action' fluent API allowing action chaining.
   * @param angleRadiansOffset  The angle to rotate to in radians relative to the current rotation
   * @param speed          The speed in radians/sec the actor should rotate at
   * @param rotationType  The [[RotationType]] to use for this rotation, default is shortest path
   */
  public rotateBy(angleRadiansOffset: number, speed: number, rotationType?: RotationType): ActionContext {
    const len = this._queues.length;
    for (let i = 0; i < len; i++) {
      this._queues[i].add(new Actions.RotateBy(this._actors[i], angleRadiansOffset, speed, rotationType));
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
    const len = this._queues.length;
    for (let i = 0; i < len; i++) {
      this._queues[i].add(new Actions.ScaleTo(this._actors[i], sizeX, sizeY, speedX, speedY));
    }
    return this;
  }

  /**
   * This method will scale an actor by an amount relative to the current scale at a certain speed in scale units/sec
   * and return back the actor. This method is part of the
   * actor 'Action' fluent API allowing action chaining.
   * @param sizeOffsetX   The scaling factor to apply on X axis
   * @param sizeOffsetY   The scaling factor to apply on Y axis
   * @param speed    The speed to scale at in scale units/sec
   */
  public scaleBy(sizeOffsetX: number, sizeOffsetY: number, speed: number): ActionContext {
    const len = this._queues.length;
    for (let i = 0; i < len; i++) {
      this._queues[i].add(new Actions.ScaleBy(this._actors[i], sizeOffsetX, sizeOffsetY, speed));
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
    const len = this._queues.length;
    for (let i = 0; i < len; i++) {
      this._queues[i].add(new Actions.Blink(this._actors[i], timeVisible, timeNotVisible, numBlinks));
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
    const len = this._queues.length;
    for (let i = 0; i < len; i++) {
      this._queues[i].add(new Actions.Fade(this._actors[i], opacity, time));
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
    const len = this._queues.length;
    for (let i = 0; i < len; i++) {
      this._queues[i].add(new Actions.Delay(this._actors[i], time));
    }
    return this;
  }

  /**
   * This method will add an action to the queue that will remove the actor from the
   * scene once it has completed its previous actions. Any actions on the
   * action queue after this action will not be executed.
   */
  public die(): ActionContext {
    const len = this._queues.length;
    for (let i = 0; i < len; i++) {
      this._queues[i].add(new Actions.Die(this._actors[i]));
    }
    return this;
  }

  /**
   * This method allows you to call an arbitrary method as the next action in the
   * action queue. This is useful if you want to execute code in after a specific
   * action, i.e An actor arrives at a destination after traversing a path
   */
  public callMethod(method: () => any): ActionContext {
    const len = this._queues.length;
    for (let i = 0; i < len; i++) {
      this._queues[i].add(new Actions.CallMethod(this._actors[i], method));
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
    const len = this._queues.length;
    for (let i = 0; i < len; i++) {
      this._queues[i].add(new Actions.Repeat(this._actors[i], times, this._actors[i].actionQueue.getActions()));
    }

    return this;
  }

  /**
   * This method will cause the actor to repeat all of the previously
   * called actions forever. This method is part of the actor 'Action'
   * fluent API allowing action chaining.
   */
  public repeatForever(): ActionContext {
    const len = this._queues.length;
    for (let i = 0; i < len; i++) {
      this._queues[i].add(new Actions.RepeatForever(this._actors[i], this._actors[i].actionQueue.getActions()));
    }
    return this;
  }

  /**
   * This method will cause the actor to follow another at a specified distance
   * @param actor           The actor to follow
   * @param followDistance  The distance to maintain when following, if not specified the actor will follow at the current distance.
   */
  public follow(actor: Actor, followDistance?: number): ActionContext {
    const len = this._queues.length;
    for (let i = 0; i < len; i++) {
      if (followDistance === undefined) {
        this._queues[i].add(new Actions.Follow(this._actors[i], actor));
      } else {
        this._queues[i].add(new Actions.Follow(this._actors[i], actor, followDistance));
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
    const len = this._queues.length;
    for (let i = 0; i < len; i++) {
      if (speed === undefined) {
        this._queues[i].add(new Actions.Meet(this._actors[i], actor));
      } else {
        this._queues[i].add(new Actions.Meet(this._actors[i], actor, speed));
      }
    }
    return this;
  }

  /**
   * Returns a promise that resolves when the current action queue up to now
   * is finished.
   */
  public asPromise<T>(): Promise<T> {
    const promises = this._queues.map((q, i) => {
      const temp = new Promise<T>();
      q.add(
        new Actions.CallMethod(this._actors[i], () => {
          temp.resolve();
        })
      );
      return temp;
    });
    return Promise.join.apply(this, promises);
  }
}
