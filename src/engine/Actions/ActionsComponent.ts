import { ActionContext } from './ActionContext';
import { Component } from '../EntityComponentSystem/Component';
import { Entity } from '../EntityComponentSystem/Entity';
import { Actor } from '../Actor';
import { MotionComponent } from '../EntityComponentSystem/Components/MotionComponent';
import { TransformComponent } from '../EntityComponentSystem/Components/TransformComponent';
import { Vector } from '../Math/vector';
import { EasingFunction } from '../Util/EasingFunctions';
import { ActionQueue } from './ActionQueue';
import { RotationType } from './RotationType';
import { Action } from './Action';

export interface ActionContextMethods extends Pick<ActionContext, keyof ActionContext> { };

export class ActionsComponent extends Component<'ex.actions'> implements ActionContextMethods {
  public readonly type = 'ex.actions';
  dependencies = [TransformComponent, MotionComponent];
  private _ctx: ActionContext;

  onAdd(entity: Entity) {
    this._ctx = new ActionContext(entity);
  }

  onRemove() {
    this._ctx = null;
  }

  /**
   * Returns the internal action queue
   * @returns action queue
   */
  public getQueue(): ActionQueue {
    return this._ctx?.getQueue();
  }

  public runAction(action: Action): ActionContext {
    return this._ctx?.runAction(action);
  }

  /**
   * Updates the internal action context, performing action and moving through the internal queue
   * @param elapsedMs
   */
  public update(elapsedMs: number): void {
    return this._ctx?.update(elapsedMs);
  }

  /**
   * Clears all queued actions from the Actor
   */
  public clearActions(): void {
    this._ctx?.clearActions();
  }

  /**
   * This method will move an actor to the specified `x` and `y` position over the
   * specified duration using a given [[EasingFunctions]] and return back the actor. This
   * method is part of the actor 'Action' fluent API allowing action chaining.
   * @param pos       The x,y vector location to move the actor to
   * @param duration  The time it should take the actor to move to the new location in milliseconds
   * @param easingFcn Use [[EasingFunctions]] or a custom function to use to calculate position, Default is [[EasingFunctions.Linear]]
   */
  public easeTo(pos: Vector, duration: number, easingFcn?: EasingFunction): ActionContext;
  /**
   * This method will move an actor to the specified `x` and `y` position over the
   * specified duration using a given [[EasingFunctions]] and return back the actor. This
   * method is part of the actor 'Action' fluent API allowing action chaining.
   * @param x         The x location to move the actor to
   * @param y         The y location to move the actor to
   * @param duration  The time it should take the actor to move to the new location in milliseconds
   * @param easingFcn Use [[EasingFunctions]] or a custom function to use to calculate position, Default is [[EasingFunctions.Linear]]
   */
  public easeTo(x: number, y: number, duration: number, easingFcn?: EasingFunction): ActionContext;
  public easeTo(...args: any[]): ActionContext {
    return this._ctx.easeTo.apply(this._ctx, args);
  }

  public easeBy(offset: Vector, duration: number, easingFcn?: EasingFunction): ActionContext;
  public easeBy(offsetX: number, offsetY: number, duration: number, easingFcn?: EasingFunction): ActionContext;
  public easeBy(...args: any[]): ActionContext {
    return this._ctx.easeBy.apply(this._ctx, args);
  }

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
  public moveTo(xOrPos: number | Vector, yOrSpeed: number, speedOrUndefined?: number): ActionContext {
    return this._ctx.moveTo.apply(this._ctx, [xOrPos, yOrSpeed, speedOrUndefined]);
  }

  /**
   * This method will move an actor by the specified x offset and y offset from its current position, at a certain speed.
   * This method is part of the actor 'Action' fluent API allowing action chaining.
   * @param offset The (x, y) offset to apply to this actor
   * @param speed  The speed in pixels per second the actor should move
   */
  public moveBy(offset: Vector, speed: number): ActionContext;
  /**
   * This method will move an actor by the specified x offset and y offset from its current position, at a certain speed.
   * This method is part of the actor 'Action' fluent API allowing action chaining.
   * @param xOffset     The x offset to apply to this actor
   * @param yOffset     The y location to move the actor to
   * @param speed  The speed in pixels per second the actor should move
   */
  public moveBy(xOffset: number, yOffset: number, speed: number): ActionContext;
  public moveBy(xOffsetOrVector: number | Vector, yOffsetOrSpeed: number, speedOrUndefined?: number): ActionContext {
    return this._ctx.moveBy.apply(this._ctx, [xOffsetOrVector, yOffsetOrSpeed, speedOrUndefined]);
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
    return this._ctx.rotateTo(angleRadians, speed, rotationType);
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
    return this._ctx.rotateBy(angleRadiansOffset, speed, rotationType);
  }

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
    sizeXOrVector: number | Vector,
    sizeYOrSpeed: number | Vector,
    speedXOrUndefined?: number,
    speedYOrUndefined?: number): ActionContext {
    return this._ctx.scaleTo.apply(this._ctx, [sizeXOrVector, sizeYOrSpeed, speedXOrUndefined, speedYOrUndefined]);
  }

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
  public scaleBy(sizeOffsetXOrVector: number | Vector, sizeOffsetYOrSpeed: number, speed?: number): ActionContext {
    return this._ctx.scaleBy.apply(this._ctx, [sizeOffsetXOrVector, sizeOffsetYOrSpeed, speed]);
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
  public blink(timeVisible: number, timeNotVisible: number, numBlinks?: number): ActionContext {
    return this._ctx.blink(timeVisible, timeNotVisible, numBlinks);
  }

  /**
   * This method will cause an actor's opacity to change from its current value
   * to the provided value by a specified time (in milliseconds). This method is
   * part of the actor 'Action' fluent API allowing action chaining.
   * @param opacity  The ending opacity
   * @param time     The time it should take to fade the actor (in milliseconds)
   */
  public fade(opacity: number, time: number): ActionContext {
    return this._ctx.fade(opacity, time);
  }

  /**
   * This method will delay the next action from executing for a certain
   * amount of time (in milliseconds). This method is part of the actor
   * 'Action' fluent API allowing action chaining.
   * @param time  The amount of time to delay the next action in the queue from executing in milliseconds
   */
  public delay(time: number): ActionContext {
    return this._ctx.delay(time);
  }

  /**
   * This method will add an action to the queue that will remove the actor from the
   * scene once it has completed its previous  Any actions on the
   * action queue after this action will not be executed.
   */
  public die(): ActionContext {
    return this._ctx.die();
  }

  /**
   * This method allows you to call an arbitrary method as the next action in the
   * action queue. This is useful if you want to execute code in after a specific
   * action, i.e An actor arrives at a destination after traversing a path
   */
  public callMethod(method: () => any): ActionContext {
    return this._ctx.callMethod(method);
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
   *  repeatCtx.moveBy(10, 0, 10);
   *  repeatCtx.moveBy(0, 10, 10);
   * }, 5);
   * ```
   *
   * @param repeatBuilder The builder to specify the repeatable list of actions
   * @param times  The number of times to repeat all the previous actions in the action queue. If nothing is specified the actions
   * will repeat forever
   */
  public repeat(repeatBuilder: (repeatContext: ActionContext) => any, times?: number): ActionContext {
    return this._ctx.repeat(repeatBuilder, times);
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
   *  repeatCtx.moveBy(10, 0, 10);
   *  repeatCtx.moveBy(0, 10, 10);
   * }, 5);
   * ```
   *
   * @param repeatBuilder The builder to specify the repeatable list of actions
   */
  public repeatForever(repeatBuilder: (repeatContext: ActionContext) => any): ActionContext {
    return this._ctx.repeatForever(repeatBuilder);
  }

  /**
   * This method will cause the entity to follow another at a specified distance
   * @param entity           The entity to follow
   * @param followDistance  The distance to maintain when following, if not specified the actor will follow at the current distance.
   */
  public follow(entity: Actor, followDistance?: number): ActionContext {
    return this._ctx.follow(entity, followDistance);
  }

  /**
   * This method will cause the entity to move towards another until they
   * collide "meet" at a specified speed.
   * @param entity  The entity to meet
   * @param speed  The speed in pixels per second to move, if not specified it will match the speed of the other actor
   */
  public meet(entity: Actor, speed?: number): ActionContext {
    return this._ctx.meet(entity, speed);
  }

  /**
   * Returns a promise that resolves when the current action queue up to now
   * is finished.
   */
  public toPromise(): Promise<void> {
    return this._ctx.toPromise();
  }
}