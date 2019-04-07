import { Color } from '../Drawing/Color';
import * as DrawUtil from '../Util/DrawUtil';
import { Eventable } from '../Interfaces/Index';
import { GameEvent, PostCollisionEvent, PreCollisionEvent } from '../Events';
import { Actor } from '../Actor';
import { Body } from './Body';
import { CollisionArea } from './CollisionArea';
import { Vector } from '../Algebra';
import { Physics, CollisionResolutionStrategy } from '../Physics';
import { BoundingBox } from './BoundingBox';
import { PolygonArea } from './PolygonArea';
import { CircleArea } from './CircleArea';
import { EdgeArea } from './EdgeArea';
import { CollisionType } from './CollisionType';

function isCollider(x: Actor | Collider): x is Collider {
  return !!x && x instanceof Collider;
}

// Describes material properties like shape, bounds, friction of the physics object
export class Collider implements Eventable {
  constructor(private _actor: Actor, private _body: Body) {}

  emit(eventName: string, event?: GameEvent<any>): void {
    if (event instanceof PreCollisionEvent && isCollider(event.actor) && isCollider(event.other)) {
      this._actor.emit(eventName, new PreCollisionEvent(event.actor._actor, event.other._actor, event.side, event.intersection));
    } else if (event instanceof PostCollisionEvent && isCollider(event.actor) && isCollider(event.other)) {
      this._actor.emit(eventName, new PostCollisionEvent(event.actor._actor, event.other._actor, event.side, event.intersection));
    } else {
      this._actor.emit(eventName, event);
    }
  }
  on(eventName: string, handler: (event?: GameEvent<any>) => void): void {
    this._actor.on(eventName, handler);
  }
  off(eventName: string, handler?: (event?: GameEvent<any>) => void): void {
    this._actor.off(eventName, handler);
  }
  once(eventName: string, handler: (event?: GameEvent<any>) => void): void {
    this._actor.once(eventName, handler);
  }

  public get id(): number {
    return this._actor.id;
  }

  public get collisionType(): CollisionType {
    return this._actor.collisionType;
  }

  public set collisionType(type: CollisionType) {
    this._actor.collisionType = type;
  }

  public get shape(): CollisionArea {
    return this._actor.collisionArea;
  }

  public set shape(shape: CollisionArea) {
    this._actor.collisionArea = shape;
  }

  public get body(): Body {
    return this._body;
  }

  public get center(): Vector {
    return this._actor.getCenter();
  }

  /**
   * The current mass of the actor, mass can be thought of as the resistance to acceleration.
   */
  public mass: number = 1.0;

  /**
   * The current moment of inertia, moi can be thought of as the resistance to rotation.
   */
  public moi: number = 1000;

  /**
   * The coefficient of friction on this actor
   */
  public friction: number = 0.99;

  /**
   * The coefficient of restitution of this actor, represents the amount of energy preserved after collision
   */
  public restitution: number = 0.2;

  /**
   * Returns the body's [[BoundingBox]] calculated for this instant in world space.
   */
  public getBounds(): BoundingBox {
    if (Physics.collisionResolutionStrategy === CollisionResolutionStrategy.Box) {
      return this._actor.getBounds();
    } else {
      return this.shape.getBounds();
    }
  }

  /**
   * Returns the actor's [[BoundingBox]] relative to the actors position.
   */
  public getRelativeBounds(): BoundingBox {
    if (Physics.collisionResolutionStrategy === CollisionResolutionStrategy.Box) {
      return this._actor.getRelativeBounds();
    } else {
      return this._actor.getRelativeBounds();
    }
  }

  /**
   * Updates the collision area geometry and internal caches
   */
  public update() {
    if (this.shape) {
      // Update the geometry if needed
      if (this.body && this.body.isGeometryDirty && this.shape instanceof PolygonArea) {
        this.shape.points = this._actor.getRelativeGeometry();
      }

      this.shape.recalc();
    }
  }

  /**
   * Sets up a box collision area based on the current bounds of the associated actor of this physics body.
   *
   * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
   */
  public useBoxCollision(center: Vector = Vector.Zero) {
    this.shape = new PolygonArea({
      body: this._body,
      points: this._actor.getRelativeGeometry(),
      pos: center // position relative to actor
    });

    // in case of a nan moi, coalesce to a safe default
    this.moi = this.shape.getMomentOfInertia() || this.moi;
  }

  /**
   * Sets up a polygon collision area based on a list of of points relative to the anchor of the associated actor of this physics body.
   *
   * Only [convex polygon](https://en.wikipedia.org/wiki/Convex_polygon) definitions are supported.
   *
   * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
   */
  public usePolygonCollision(points: Vector[], center: Vector = Vector.Zero) {
    this.shape = new PolygonArea({
      body: this._body,
      points: points,
      pos: center // position relative to actor
    });

    // in case of a nan moi, collesce to a safe default
    this.moi = this.shape.getMomentOfInertia() || this.moi;
  }

  /**
   * Sets up a [[CircleArea|circle collision area]] with a specified radius in pixels.
   *
   * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
   */
  public useCircleCollision(radius?: number, center: Vector = Vector.Zero) {
    if (!radius) {
      radius = this._actor.getWidth() / 2;
    }
    this.shape = new CircleArea({
      body: this._body,
      radius: radius,
      pos: center
    });
    this.moi = this.shape.getMomentOfInertia() || this.moi;
  }

  /**
   * Sets up an [[EdgeArea|edge collision]] with a start point and an end point relative to the anchor of the associated actor
   * of this physics body.
   *
   * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
   */
  public useEdgeCollision(begin: Vector, end: Vector) {
    this.shape = new EdgeArea({
      begin: begin,
      end: end,
      body: this._body
    });

    this.moi = this.shape.getMomentOfInertia() || this.moi;
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
