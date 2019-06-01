import { Color } from '../Drawing/Color';
import * as DrawUtil from '../Util/DrawUtil';
import { Eventable } from '../Interfaces/Index';
import { GameEvent } from '../Events';
import { Actor } from '../Actor';
import { Body } from './Body';
import { CollisionShape } from './CollisionShape';
import { Vector } from '../Algebra';
import { Physics } from '../Physics';
import { BoundingBox } from './BoundingBox';
import { CollisionType } from './CollisionType';
import { CollisionGroup } from './CollisionGroup';
import { CollisionContact } from './CollisionContact';
import { EventDispatcher } from '../EventDispatcher';
import { Pair } from './Pair';
import { Clonable } from '../Interfaces/Clonable';

/**
 * Type guard function to determine whether something is a Collider
 */
export function isCollider(x: Actor | Collider): x is Collider {
  return x instanceof Collider;
}

export interface ColliderOptions {
  /**
   * Optional [[shape|Shape]] to use with this collider, the shape defines the collidable region along with the [[bounding box|BoundingBox]]
   */
  shape?: CollisionShape;
  /**
   * Optional body to associate with this collider
   */
  body?: Body;
  /**
   * Optional collision group on this collider
   */
  group?: CollisionGroup;
  /**
   * Optional [[collision type|CollisionType]], if not specified the default is [[CollisionType.PreventCollision]]
   */
  type?: CollisionType;
  /**
   * Optional local bounds if other bounds are required instead of the bounding box from the shape. This overrides shape bounds.
   */
  localBounds?: BoundingBox;
  /**
   * Optional flag to indicate moment of inertia from the shape should be used, by default it is true.
   */
  useShapeInertia?: boolean;
}

/**
 * Collider describes material properties like shape,
 * bounds, friction of the physics object. Only **one** collider can be associated with a body at a time
 */

export class Collider implements Eventable, Clonable<Collider> {
  private _shape: CollisionShape;
  public useShapeInertia: boolean;
  private _events: EventDispatcher<Collider> = new EventDispatcher<Collider>(this);

  constructor({ body, type, group, shape, useShapeInertia = true }: ColliderOptions) {
    // If shape is not supplied see if the body has an existing collider with a shape
    if (body && body.collider && !shape) {
      this._shape = body.collider.shape;
    } else {
      this._shape = shape;
      this.body = body;
    }
    this.useShapeInertia = useShapeInertia;
    this._shape.collider = this;
    this.type = type || this.type;
    this.group = group || this.group;
  }

  /**
   * Returns a clone of the current collider, not associated with any body
   */
  public clone() {
    return new Collider({
      body: null,
      type: this.type,
      shape: this._shape.clone()
    });
  }

  /**
   * Get the unique id of the collider
   */
  public get id(): number {
    return this.body ? this.body.id : -1;
  }

  /**
   * Gets or sets the current collision type of this collider. By
   * default it is ([[CollisionType.PreventCollision]]).
   */
  public type: CollisionType = CollisionType.PreventCollision;

  /**
   * Gets or sets the current [[CollisionGroup|collision group]] for the collider, colliders with like collision groups do not collide.
   * By default, the collider will collide with [[CollisionGroup|all groups]].
   */
  public group: CollisionGroup = CollisionGroup.All;

  /*
   * Get the shape of the collider as a [[CollisionShape]]
   */
  public get shape(): CollisionShape {
    return this._shape;
  }

  /**
   * Set the shape of the collider as a [[CollisionShape]], if useShapeInertia is set the collider will use inertia from the shape.
   */
  public set shape(shape: CollisionShape) {
    this._shape = shape;
    this._shape.collider = this;
    if (this.useShapeInertia) {
      this.inertia = isNaN(this._shape.inertia) ? this.inertia : this._shape.inertia;
    }
  }

  /**
   * Return a reference to the body associated with this collider
   */
  public body: Body;

  /**
   * The center of the collider in world space
   */
  public get center(): Vector {
    return this.bounds.center;
  }

  /**
   * Is this collider active, if false it wont collide
   */
  public get active(): boolean {
    return this.body.active;
  }

  /**
   * Collide 2 colliders and product a collision contact if there is a collision, null if none
   *
   * Collision vector is in the direction of the other collider. Away from this collider, this -> other.
   * @param other
   */
  public collide(other: Collider): CollisionContact | null {
    return this.shape.collide(other.shape);
  }

  /**
   * The current mass of the actor, mass can be thought of as the resistance to acceleration.
   */
  public mass: number = 1.0;

  /**
   * The current moment of inertia, moment of inertia can be thought of as the resistance to rotation.
   */
  public inertia: number = 1000;

  /**
   * The coefficient of friction on this actor
   */
  public friction: number = 0.99;

  /**
   * The also known as coefficient of restitution of this actor, represents the amount of energy preserved after collision or the
   * bounciness. If 1, it is 100% bouncy, 0 it completely absorbs.
   */
  public bounciness: number = 0.2;

  /**
   * Returns a boolean indicating whether this body collided with
   * or was in stationary contact with
   * the body of the other [[Collider]]
   */
  public touching(other: Collider): boolean {
    const pair = new Pair(this, other);
    pair.collide();

    if (pair.collision) {
      return true;
    }

    return false;
  }

  /**
   * Returns the collider's [[BoundingBox]] calculated for this instant in world space.
   * If there is no shape, a point bounding box is returned
   */
  public get bounds(): BoundingBox {
    if (this.shape) {
      return this.shape.bounds;
    }

    if (this.body) {
      return new BoundingBox().translate(this.body.pos);
    }
    return new BoundingBox();
  }

  /**
   * Returns the collider's [[BoundingBox]] relative to the body's position.
   * If there is no shape, a point boudning box is returned
   */
  public get localBounds(): BoundingBox {
    if (this.shape) {
      return this.shape.localBounds;
    }
    return new BoundingBox();
  }

  /**
   * Updates the collision shapes geometry and internal caches if needed
   */
  public update() {
    if (this.shape) {
      this.shape.recalc();
    }
  }

  emit(eventName: string, event: GameEvent<Collider>): void {
    this._events.emit(eventName, event);
  }
  on(eventName: string, handler: (event: GameEvent<Collider>) => void): void {
    this._events.on(eventName, handler);
  }
  off(eventName: string, handler?: (event: GameEvent<Collider>) => void): void {
    this._events.off(eventName, handler);
  }
  once(eventName: string, handler: (event: GameEvent<Collider>) => void): void {
    this._events.once(eventName, handler);
  }

  clear() {
    this._events.clear();
  }

  /* istanbul ignore next */
  public debugDraw(ctx: CanvasRenderingContext2D) {
    // Draw motion vectors
    if (Physics.showMotionVectors) {
      DrawUtil.vector(ctx, Color.Yellow, this.body.pos, this.body.acc.add(Physics.acc));
      DrawUtil.vector(ctx, Color.Red, this.body.pos, this.body.vel);
      DrawUtil.point(ctx, Color.Red, this.body.pos);
    }

    if (Physics.showBounds) {
      this.bounds.debugDraw(ctx, Color.Yellow);
    }

    if (Physics.showArea) {
      this.shape.debugDraw(ctx, Color.Green);
    }
  }
}
