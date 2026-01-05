import type { EasingFunction } from '../util/easing-functions';
import { EasingFunctions } from '../util/easing-functions';
import { ActionQueue } from './action-queue';
import { Repeat } from './action/repeat';
import { RepeatForever } from './action/repeat-forever';
import type { MoveByOptions } from './action/move-by';
import { isMoveByOptions, MoveBy, MoveByWithOptions } from './action/move-by';
import type { MoveToOptions } from './action/move-to';
import { isMoveToOptions, MoveTo, MoveToWithOptions } from './action/move-to';
import type { RotateToOptions } from './action/rotate-to';
import { RotateTo, RotateToWithOptions } from './action/rotate-to';
import type { RotateByOptions } from './action/rotate-by';
import { RotateBy, RotateByWithOptions } from './action/rotate-by';
import type { ScaleToOptions } from './action/scale-to';
import { isScaleToOptions, ScaleTo, ScaleToWithOptions } from './action/scale-to';
import type { ScaleByOptions } from './action/scale-by';
import { isScaleByOptions, ScaleBy, ScaleByWithOptions } from './action/scale-by';
import { CallMethod } from './action/call-method';
import { EaseTo } from './action/ease-to';
import { EaseBy } from './action/ease-by';
import { Blink } from './action/blink';
import { Fade } from './action/fade';
import { Delay } from './action/delay';
import { Die } from './action/die';
import { Follow } from './action/follow';
import { Meet } from './action/meet';
import type { RotationType } from '../math';
import { Vector } from '../math';
import type { Entity } from '../entity-component-system/entity';
import type { Action } from './action';
import type { Color } from '../color';
import { Flash } from './action/flash';
import type { CurveToOptions } from './action/curve-to';
import { CurveTo } from './action/curve-to';
import type { CurveByOptions } from './action/curve-by';
import { CurveBy } from './action/curve-by';

/**
 * The fluent Action API allows you to perform "actions" on
 * {@apilink Actor | `actors`} such as following, moving, rotating, and
 * more. You can implement your own actions by implementing
 * the {@apilink Action} interface.
 */
export class ActionContext {
  private _entity: Entity;
  private _queue: ActionQueue;

  constructor(entity: Entity) {
    this._entity = entity;
    this._queue = new ActionQueue(entity);
  }

  public getQueue(): ActionQueue {
    return this._queue;
  }

  public update(elapsed: number) {
    this._queue.update(elapsed);
  }

  /**
   * Clears all queued actions from the Actor
   */
  public clearActions(): void {
    this._queue.clearActions();
  }

  public runAction(action: Action) {
    action.reset();
    this._queue.add(action);
    return this;
  }

  /**
   * Animates an actor with a specified bezier curve by an offset to the current position, the start point is assumed
   * to be the actors current position
   * @param options
   */
  public curveBy(options: CurveByOptions): ActionContext {
    this._queue.add(new CurveBy(this._entity, options));
    return this;
  }

  /**
   * Animates an actor with a specified bezier curve to an absolute world space coordinate, the start point is assumed
   * to be the actors current position
   * @param options
   */
  public curveTo(options: CurveToOptions): ActionContext {
    this._queue.add(new CurveTo(this._entity, options));
    return this;
  }

  /**
   * This method will move an actor to the specified `x` and `y` position over the
   * specified duration using a given {@apilink EasingFunctions} and return back the actor. This
   * method is part of the actor 'Action' fluent API allowing action chaining.
   * @param pos       The x,y vector location to move the actor to
   * @param duration  The time it should take the actor to move to the new location in milliseconds
   * @param easingFcn Use {@apilink EasingFunction} or a custom function to use to calculate position, Default is {@apilink EasingFunctions.Linear}
   * @deprecated use new moveTo({pos: Vector, duration: number, easing: EasingFunction})
   */
  public easeTo(pos: Vector, duration: number, easingFcn?: EasingFunction): ActionContext;
  /**
   * This method will move an actor to the specified `x` and `y` position over the
   * specified duration using a given {@apilink EasingFunctions} and return back the actor. This
   * method is part of the actor 'Action' fluent API allowing action chaining.
   * @param x         The x location to move the actor to
   * @param y         The y location to move the actor to
   * @param duration  The time it should take the actor to move to the new location in milliseconds
   * @param easingFcn Use {@apilink EasingFunction} or a custom function to use to calculate position, Default is {@apilink EasingFunctions.Linear}
   * @deprecated use new moveTo({pos: Vector, duration: number, easing: EasingFunction})
   */
  public easeTo(x: number, y: number, duration: number, easingFcn?: EasingFunction): ActionContext;
  public easeTo(...args: any[]): ActionContext {
    let x = 0;
    let y = 0;
    let duration = 0;
    let easingFcn = EasingFunctions.Linear;
    if (args[0] instanceof Vector) {
      x = args[0].x;
      y = args[0].y;
      duration = args[1];
      easingFcn = args[2] ?? easingFcn;
    } else {
      x = args[0];
      y = args[1];
      duration = args[2];
      easingFcn = args[3] ?? easingFcn;
    }

    this._queue.add(new EaseTo(this._entity, x, y, duration, easingFcn));
    return this;
  }

  /**
   * This method will move an actor by a specified vector offset relative to the current position given
   * a duration and a {@apilink EasingFunction}. This method is part of the actor 'Action' fluent API allowing action chaining.
   * @param offset Vector offset relative to the current position
   * @param duration The duration in milliseconds
   * @param easingFcn Use {@apilink EasingFunction} or a custom function to use to calculate position, Default is {@apilink EasingFunctions.Linear}
   * @deprecated use new moveBy({offset: Vector, duration: number, easing: EasingFunction})
   */
  public easeBy(offset: Vector, duration: number, easingFcn?: EasingFunction): ActionContext;
  /**
   * This method will move an actor by a specified x and y offset relative to the current position given
   * a duration and a {@apilink EasingFunction}. This method is part of the actor 'Action' fluent API allowing action chaining.
   * @param offset Vector offset relative to the current position
   * @param duration The duration in milliseconds
   * @param easingFcn Use {@apilink EasingFunction} or a custom function to use to calculate position, Default is {@apilink EasingFunctions.Linear}
   * @deprecated use new moveBy({offset: Vector, duration: number, easing: EasingFunction})
   */
  public easeBy(offsetX: number, offsetY: number, duration: number, easingFcn?: EasingFunction): ActionContext;
  public easeBy(...args: any[]): ActionContext {
    let offsetX = 0;
    let offsetY = 0;
    let duration = 0;
    let easingFcn = EasingFunctions.Linear;
    if (args[0] instanceof Vector) {
      offsetX = args[0].x;
      offsetY = args[0].y;
      duration = args[1];
      easingFcn = args[2] ?? easingFcn;
    } else {
      offsetX = args[0];
      offsetY = args[1];
      duration = args[2];
      easingFcn = args[3] ?? easingFcn;
    }

    this._queue.add(new EaseBy(this._entity, offsetX, offsetY, duration, easingFcn));
    return this;
  }

  /**
   * Moves an actor to a specified {@link Vector} in a given duration in milliseconds.
   * You may optionally specify an {@link EasingFunction}
   * @param options
   */
  public moveTo(options: MoveToOptions): ActionContext;
  /**
   * This method will move an actor to the specified x and y position at the
   * speed specified (in pixels per second) and return back the actor. This
   * method is part of the actor 'Action' fluent API allowing action chaining.
   * @param pos    The x,y vector location to move the actor to
   * @param speed  The speed in pixels per second to move
   */
  public moveTo(pos: Vector, speed: number): ActionContext;
  /**
   * This method will move an actor to the specified x and y position at the
   * speed specified (in pixels per second) and return back the actor. This
   * method is part of the actor 'Action' fluent API allowing action chaining.
   * @param x      The x location to move the actor to
   * @param y      The y location to move the actor to
   * @param speed  The speed in pixels per second to move
   */
  public moveTo(x: number, y: number, speed: number): ActionContext;
  public moveTo(xOrPosOrOptions: number | Vector | MoveToOptions, yOrSpeed?: number, speedOrUndefined?: number): ActionContext {
    let x = 0;
    let y = 0;
    let speed = 0;
    if (xOrPosOrOptions instanceof Vector) {
      x = xOrPosOrOptions.x;
      y = xOrPosOrOptions.y;
      speed = +(yOrSpeed ?? 0);
      this._queue.add(new MoveTo(this._entity, x, y, speed));
    } else if (typeof xOrPosOrOptions === 'number' && typeof yOrSpeed === 'number' && typeof speedOrUndefined === 'number') {
      x = xOrPosOrOptions;
      y = yOrSpeed;
      speed = speedOrUndefined;
      this._queue.add(new MoveTo(this._entity, x, y, speed));
    } else if (isMoveToOptions(xOrPosOrOptions)) {
      this._queue.add(new MoveToWithOptions(this._entity, xOrPosOrOptions));
    }
    return this;
  }

  /**
   * Moves an actor by a specified offset {@link Vector} in a given duration in milliseconds.
   * You may optionally specify an {@link EasingFunction}
   * @param options
   */
  public moveBy(options: MoveByOptions): ActionContext;
  /**
   * This method will move an actor by the specified x offset and y offset from its current position, at a certain speed.
   * This method is part of the actor 'Action' fluent API allowing action chaining.
   * @param xOffset     The x offset to apply to this actor
   * @param yOffset     The y location to move the actor to
   * @param speed  The speed in pixels per second the actor should move
   */
  public moveBy(offset: Vector, speed: number): ActionContext;
  public moveBy(xOffset: number, yOffset: number, speed: number): ActionContext;
  public moveBy(
    xOffsetOrVectorOrOptions: number | Vector | MoveByOptions,
    yOffsetOrSpeed?: number,
    speedOrUndefined?: number
  ): ActionContext {
    let xOffset = 0;
    let yOffset = 0;
    let speed = 0;
    if (xOffsetOrVectorOrOptions instanceof Vector && typeof yOffsetOrSpeed === 'number') {
      xOffset = xOffsetOrVectorOrOptions.x;
      yOffset = xOffsetOrVectorOrOptions.y;
      speed = yOffsetOrSpeed;
      this._queue.add(new MoveBy(this._entity, xOffset, yOffset, speed));
    } else if (typeof xOffsetOrVectorOrOptions === 'number' && typeof yOffsetOrSpeed === 'number' && typeof speedOrUndefined === 'number') {
      xOffset = xOffsetOrVectorOrOptions;
      yOffset = yOffsetOrSpeed;
      speed = speedOrUndefined;
      this._queue.add(new MoveBy(this._entity, xOffset, yOffset, speed));
    } else if (isMoveByOptions(xOffsetOrVectorOrOptions)) {
      this._queue.add(new MoveByWithOptions(this._entity, xOffsetOrVectorOrOptions));
    }
    return this;
  }

  /**
   * Rotates an actor to a specified angle over a duration in milliseconds,
   * you make pick a rotation strategy {@link RotationType} to pick the direction
   * @param options
   */
  public rotateTo(options: RotateToOptions): ActionContext;
  /**
   * This method will rotate an actor to the specified angle at the speed
   * specified (in radians per second) and return back the actor. This
   * method is part of the actor 'Action' fluent API allowing action chaining.
   * @param angle  The angle to rotate to in radians
   * @param speed         The angular velocity of the rotation specified in radians per second
   * @param rotationType  The {@apilink RotationType} to use for this rotation
   */
  public rotateTo(angle: number, speed: number, rotationType?: RotationType): ActionContext;
  public rotateTo(angleRadiansOrOptions: number | RotateToOptions, speed?: number, rotationType?: RotationType): ActionContext {
    if (typeof angleRadiansOrOptions === 'number' && typeof speed === 'number') {
      this._queue.add(new RotateTo(this._entity, angleRadiansOrOptions, speed, rotationType));
    } else if (typeof angleRadiansOrOptions === 'object') {
      this._queue.add(new RotateToWithOptions(this._entity, angleRadiansOrOptions));
    }
    return this;
  }

  /**
   * Rotates an actor by a specified offset angle over a duration in milliseconds,
   * you make pick a rotation strategy {@link RotationType} to pick the direction
   * @param options
   */
  public rotateBy(options: RotateByOptions): ActionContext;
  /**
   * This method will rotate an actor by the specified angle offset, from it's current rotation given a certain speed
   * in radians/sec and return back the actor. This method is part
   * of the actor 'Action' fluent API allowing action chaining.
   * @param angleRadiansOffset  The angle to rotate to in radians relative to the current rotation
   * @param speed          The speed in radians/sec the actor should rotate at
   * @param rotationType  The {@apilink RotationType} to use for this rotation, default is shortest path
   */
  public rotateBy(angleRadiansOffset: number, speed: number, rotationType?: RotationType): ActionContext;
  public rotateBy(angleRadiansOffsetOrOptions: number | RotateByOptions, speed?: number, rotationType?: RotationType): ActionContext {
    if (typeof angleRadiansOffsetOrOptions === 'object') {
      this._queue.add(new RotateByWithOptions(this._entity, angleRadiansOffsetOrOptions));
    } else {
      this._queue.add(new RotateBy(this._entity, angleRadiansOffsetOrOptions, speed as number, rotationType));
    }
    return this;
  }

  /**
   * Scales an actor to a specified scale {@link Vector} over a duration in milliseconds
   * @param options
   */
  public scaleTo(options: ScaleToOptions): ActionContext;
  /**
   * This method will scale an actor to the specified size at the speed
   * specified (in magnitude increase per second) and return back the
   * actor. This method is part of the actor 'Action' fluent API allowing
   * action chaining.
   * @param size    The scale to adjust the actor to over time
   * @param speed   The speed of scaling specified in magnitude increase per second
   */
  public scaleTo(size: Vector, speed: Vector): ActionContext;
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
  public scaleTo(sizeX: number, sizeY: number, speedX: number, speedY: number): ActionContext;
  public scaleTo(
    sizeXOrVectorOrOptions: number | Vector | ScaleToOptions,
    sizeYOrSpeed?: number | Vector,
    speedXOrUndefined?: number | undefined,
    speedYOrUndefined?: number | undefined
  ): ActionContext {
    let sizeX = 1;
    let sizeY = 1;
    let speedX = 0;
    let speedY = 0;

    if (isScaleToOptions(sizeXOrVectorOrOptions)) {
      this._queue.add(new ScaleToWithOptions(this._entity, sizeXOrVectorOrOptions));
      return this;
    }

    if (sizeXOrVectorOrOptions instanceof Vector && sizeYOrSpeed instanceof Vector) {
      sizeX = sizeXOrVectorOrOptions.x;
      sizeY = sizeXOrVectorOrOptions.y;

      speedX = sizeYOrSpeed.x;
      speedY = sizeYOrSpeed.y;
    }
    if (typeof sizeXOrVectorOrOptions === 'number' && typeof sizeYOrSpeed === 'number') {
      sizeX = sizeXOrVectorOrOptions;
      sizeY = sizeYOrSpeed;

      speedX = speedXOrUndefined as any;
      speedY = speedYOrUndefined as any;
    }

    this._queue.add(new ScaleTo(this._entity, sizeX, sizeY, speedX, speedY));
    return this;
  }

  /**
   * Scales an actor by a specified scale offset {@link Vector} over a duration in milliseconds
   * @param options
   */
  public scaleBy(options: ScaleByOptions): ActionContext;
  /**
   * This method will scale an actor by an amount relative to the current scale at a certain speed in scale units/sec
   * and return back the actor. This method is part of the
   * actor 'Action' fluent API allowing action chaining.
   * @param offset   The scaling factor to apply to the actor
   * @param speed    The speed to scale at in scale units/sec
   */
  public scaleBy(offset: Vector, speed: number): ActionContext;
  /**
   * This method will scale an actor by an amount relative to the current scale at a certain speed in scale units/sec
   * and return back the actor. This method is part of the
   * actor 'Action' fluent API allowing action chaining.
   * @param sizeOffsetX   The scaling factor to apply on X axis
   * @param sizeOffsetY   The scaling factor to apply on Y axis
   * @param speed    The speed to scale at in scale units/sec
   */
  public scaleBy(sizeOffsetX: number, sizeOffsetY: number, speed: number): ActionContext;
  public scaleBy(
    sizeOffsetXOrVectorOrOptions: number | Vector | ScaleByOptions,
    sizeOffsetYOrSpeed?: number,
    speed?: number | undefined
  ): ActionContext {
    if (isScaleByOptions(sizeOffsetXOrVectorOrOptions)) {
      this._queue.add(new ScaleByWithOptions(this._entity, sizeOffsetXOrVectorOrOptions));
      return this;
    }
    let sizeOffsetX = 1;
    let sizeOffsetY = 1;

    if (sizeOffsetXOrVectorOrOptions instanceof Vector) {
      sizeOffsetX = sizeOffsetXOrVectorOrOptions.x;
      sizeOffsetY = sizeOffsetXOrVectorOrOptions.y;

      speed = sizeOffsetYOrSpeed;
    }
    if (typeof sizeOffsetXOrVectorOrOptions === 'number' && typeof sizeOffsetYOrSpeed === 'number') {
      sizeOffsetX = sizeOffsetXOrVectorOrOptions;
      sizeOffsetY = sizeOffsetYOrSpeed;
    }

    this._queue.add(new ScaleBy(this._entity, sizeOffsetX, sizeOffsetY, speed as any));
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
    this._queue.add(new Blink(this._entity, timeVisible, timeNotVisible, numBlinks));
    return this;
  }

  /**
   * This method will cause an actor's opacity to change from its current value
   * to the provided value by a specified time (in milliseconds). This method is
   * part of the actor 'Action' fluent API allowing action chaining.
   * @param opacity  The ending opacity
   * @param duration     The time it should take to fade the actor (in milliseconds)
   */
  public fade(opacity: number, duration: number): ActionContext {
    this._queue.add(new Fade(this._entity, opacity, duration));
    return this;
  }

  /**
   * This will cause an actor to flash a specific color for a period of time
   * @param color
   * @param duration The duration in milliseconds
   */
  public flash(color: Color, duration: number = 1000) {
    this._queue.add(new Flash(this._entity, color, duration));
    return this;
  }

  /**
   * This method will delay the next action from executing for a certain
   * amount of time (in milliseconds). This method is part of the actor
   * 'Action' fluent API allowing action chaining.
   * @param duration  The amount of time to delay the next action in the queue from executing in milliseconds
   */
  public delay(duration: number): ActionContext {
    this._queue.add(new Delay(duration));
    return this;
  }

  /**
   * This method will add an action to the queue that will remove the actor from the
   * scene once it has completed its previous  Any actions on the
   * action queue after this action will not be executed.
   */
  public die(): ActionContext {
    this._queue.add(new Die(this._entity));
    return this;
  }

  /**
   * This method allows you to call an arbitrary method as the next action in the
   * action queue. This is useful if you want to execute code in after a specific
   * action, i.e An actor arrives at a destination after traversing a path
   */
  public callMethod(method: () => any): ActionContext {
    this._queue.add(new CallMethod(method));
    return this;
  }

  /**
   * This method will cause the actor to repeat all of the actions built in
   * the `repeatBuilder` callback. If the number of repeats
   * is not specified it will repeat forever. This method is part of
   * the actor 'Action' fluent API allowing action chaining
   *
   * ```typescript
   * // Move up in a zig-zag by repeated moveBy's
   * actor.actions.repeat(repeatCtx => {
   * repeatCtx.moveBy(10, 0, 10);
   * repeatCtx.moveBy(0, 10, 10);
   * }, 5);
   * ```
   * @param repeatBuilder The builder to specify the repeatable list of actions
   * @param times  The number of times to repeat all the previous actions in the action queue. If nothing is specified the actions
   * will repeat forever
   */
  public repeat(repeatBuilder: (repeatContext: ActionContext) => any, times?: number): ActionContext {
    if (!times) {
      this.repeatForever(repeatBuilder);
      return this;
    }
    this._queue.add(new Repeat(this._entity, repeatBuilder, times));

    return this;
  }

  /**
   * This method will cause the actor to repeat all of the actions built in
   * the `repeatBuilder` callback. If the number of repeats
   * is not specified it will repeat forever. This method is part of
   * the actor 'Action' fluent API allowing action chaining
   *
   * ```typescript
   * // Move up in a zig-zag by repeated moveBy's
   * actor.actions.repeat(repeatCtx => {
   * repeatCtx.moveBy(10, 0, 10);
   * repeatCtx.moveBy(0, 10, 10);
   * }, 5);
   * ```
   * @param repeatBuilder The builder to specify the repeatable list of actions
   */
  public repeatForever(repeatBuilder: (repeatContext: ActionContext) => any): ActionContext {
    this._queue.add(new RepeatForever(this._entity, repeatBuilder));
    return this;
  }

  /**
   * This method will cause the entity to follow another at a specified distance
   * @param entity           The entity to follow
   * @param followDistance  The distance to maintain when following, if not specified the actor will follow at the current distance.
   */
  public follow(entity: Entity, followDistance?: number): ActionContext {
    if (followDistance === undefined) {
      this._queue.add(new Follow(this._entity, entity));
    } else {
      this._queue.add(new Follow(this._entity, entity, followDistance));
    }
    return this;
  }

  /**
   * This method will cause the entity to move towards another until they
   * collide "meet" at a specified speed.
   * @param entity  The entity to meet
   * @param speed  The speed in pixels per second to move, if not specified it will match the speed of the other actor
   * @param tolerance  The tolerance in pixels to meet, if not specified it will be 1 pixel
   */
  public meet(entity: Entity, speed?: number, tolerance?: number): ActionContext {
    if (speed === undefined && tolerance === undefined) {
      this._queue.add(new Meet(this._entity, entity));
    } else if (tolerance === undefined) {
      this._queue.add(new Meet(this._entity, entity, speed));
    } else {
      this._queue.add(new Meet(this._entity, entity, speed, tolerance));
    }
    return this;
  }

  /**
   * Returns a promise that resolves when the current action queue up to now
   * is finished.
   */
  public toPromise(): Promise<void> {
    const temp = new Promise<void>((resolve) => {
      this._queue.add(
        new CallMethod(() => {
          resolve();
        })
      );
    });
    return temp;
  }
}
