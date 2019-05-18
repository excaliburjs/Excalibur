import { Color } from '../Drawing/Color';
import * as DrawUtil from '../Util/DrawUtil';
import { Eventable } from '../Interfaces/Index';
import { GameEvent } from '../Events';
import { Actor } from '../Actor';
import { Body } from './Body';
import { CollisionShape } from './CollisionShape';
import { Vector } from '../Algebra';
import { Physics, CollisionResolutionStrategy } from '../Physics';
import { BoundingBox } from './BoundingBox';
import { ConvexPolygon } from './ConvexPolygon';
import { CollisionType } from './CollisionType';
import { CollisionContact } from './CollisionContact';
import { EventDispatcher } from '../EventDispatcher';
import { Pair } from './Pair';

/**
 * Type guard function to determine whether something is a Collider
 */
export function isCollider(x: Actor | Collider): x is Collider {
  return x instanceof Collider;
}

/**
 * Collider describes material properties like shape,
 * bounds, friction of the physics object
 */

export class Collider implements Eventable {
  private _shape: CollisionShape;
  private _events: EventDispatcher<Collider> = new EventDispatcher<Collider>(this);

  constructor(public entity: Actor, private _body: Body) {}

  /**
   * Get the unique id of the collider
   */
  public get id(): number {
    return this.entity.id;
  }

  /**
   * Gets or sets the current collision type of this collider. By
   * default it is ([[CollisionType.PreventCollision]]).
   */
  public type: CollisionType = CollisionType.PreventCollision;

  /**
   * Get the shape of the collider as a [[CollisionShape]]
   */
  public get shape(): CollisionShape {
    return this._shape;
  }

  /**
   * Set the shape of the collider as a [[CollisionShape]]
   */
  public set shape(shape: CollisionShape) {
    this._shape = shape;
    this._shape.collider = this;
  }

  /**
   * Return a reference to the body associated with this collider
   */
  public get body(): Body {
    return this._body;
  }

  /**
   * The center of the collider
   */
  public get center(): Vector {
    return this.entity.getCenter();
  }

  /**
   * Is this collider active, if false it wont collide
   */
  public get active(): boolean {
    return !this.entity.isKilled();
  }

  /**
   * Collide 2 colliders and product a collision contact if there is a collision, null if none
   *
   * Collision vector is in the direction of the other collider. Away from this collider, this -> other.
   * @param other
   */
  public collide(other: Collider): CollisionContact {
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
   * The coefficient of restitution of this actor, represents the amount of energy preserved after collision
   */
  public restitution: number = 0.2;

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
   */
  public getBounds(): BoundingBox {
    if (Physics.collisionResolutionStrategy === CollisionResolutionStrategy.Box) {
      return this.entity.getBounds();
    } else {
      return this.shape.getBounds();
    }
  }

  /**
   * Returns the actor's [[BoundingBox]] relative to the actors position.
   */
  public getRelativeBounds(): BoundingBox {
    if (Physics.collisionResolutionStrategy === CollisionResolutionStrategy.Box) {
      return this.entity.getRelativeBounds();
    } else {
      return this.entity.getRelativeBounds();
    }
  }

  /**
   * Updates the collision area geometry and internal caches
   */
  public update() {
    if (this.shape) {
      // Update the geometry if needed
      if (this.body && this.body.isColliderShapeDirty && this.shape instanceof ConvexPolygon) {
        this.shape.points = this.entity.getRelativeGeometry();
      }

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
      DrawUtil.vector(ctx, Color.Yellow, this._body.pos, this._body.acc.add(Physics.acc));
      DrawUtil.vector(ctx, Color.Red, this._body.pos, this._body.vel);
      DrawUtil.point(ctx, Color.Red, this._body.pos);
    }

    if (Physics.showBounds) {
      this.getBounds().debugDraw(ctx, Color.Yellow);
    }

    if (Physics.showArea) {
      this.shape.debugDraw(ctx, Color.Green);
    }
  }
}
