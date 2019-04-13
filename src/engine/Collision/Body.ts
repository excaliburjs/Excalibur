import { Pair } from './Pair';
import { Vector } from '../Algebra';
import { Actor } from '../Actor';
import { Collider } from './Collider';
import { CollisionType } from './CollisionType';
import { Physics } from '../Physics';
import { ConvexPolygon } from './ConvexPolygon';
import { Circle } from './Circle';
import { Edge } from './Edge';

/**
 * Body describes all the physical properties pos, vel, acc, rotation, angular velocity
 */
export class Body {
  private _collider: Collider;

  /**
   * Constructs a new physics body associated with an actor
   */
  constructor(private _actor: Actor) {
    this._collider = new Collider(this._actor, this);
  }

  // TODO allow multiple colliders
  public set collider(collider: Collider) {
    this._collider = collider;
  }

  public get collider(): Collider {
    return this._collider;
  }

  /**
   * The (x, y) position of the actor this will be in the middle of the actor if the
   * [[Actor.anchor]] is set to (0.5, 0.5) which is default.
   * If you want the (x, y) position to be the top left of the actor specify an anchor of (0, 0).
   */
  public pos: Vector = new Vector(0, 0);

  /**
   * The position of the actor last frame (x, y) in pixels
   */
  public oldPos: Vector = new Vector(0, 0);

  /**
   * The current velocity vector (vx, vy) of the actor in pixels/second
   */
  public vel: Vector = new Vector(0, 0);

  /**
   * The velocity of the actor last frame (vx, vy) in pixels/second
   */
  public oldVel: Vector = new Vector(0, 0);

  /**
   * The curret acceleration vector (ax, ay) of the actor in pixels/second/second. An acceleration pointing down such as (0, 100) may
   * be useful to simulate a gravitational effect.
   */
  public acc: Vector = new Vector(0, 0);

  /**
   * Gets/sets the acceleration of the actor from the last frame. This does not include the global acc [[Physics.acc]].
   */
  public oldAcc: Vector = Vector.Zero;

  /**
   * The current torque applied to the actor
   */
  public torque: number = 0;

  /**
   * The current "motion" of the actor, used to calculated sleep in the physics simulation
   */
  public motion: number = 10;

  /**
   * The rotation of the actor in radians
   */
  public rotation: number = 0; // radians

  /**
   * The scale vector of the actor
   */
  public scale: Vector = Vector.One;

  /**
   * The scale of the actor last frame
   */
  public oldScale: Vector = Vector.One;

  /**
   * The x scalar velocity of the actor in scale/second
   */
  public sx: number = 0; //scale/sec
  /**
   * The y scalar velocity of the actor in scale/second
   */
  public sy: number = 0; //scale/sec

  /**
   * The rotational velocity of the actor in radians/second
   */
  public rx: number = 0; //radians/sec

  private _geometryDirty = false;

  private _totalMtv: Vector = Vector.Zero;

  /**
   * Add minimum translation vectors accumulated during the current frame to resolve collisions.
   */
  public addMtv(mtv: Vector) {
    this._totalMtv.addEqual(mtv);
  }

  /**
   * Applies the accumulated translation vectors to the actors position
   */
  public applyMtv(): void {
    this.pos.addEqual(this._totalMtv);
    this._totalMtv.setTo(0, 0);
  }

  public taintCollisionGeometry() {
    this._geometryDirty = true;
  }

  public get isGeometryDirty(): boolean {
    return this._geometryDirty;
  }

  /**
   * Sets the old versions of pos, vel, acc, and scale.
   */
  public captureOldTransform() {
    // Capture old values before integration step updates them
    this.oldVel.setTo(this.vel.x, this.vel.y);
    this.oldPos.setTo(this.pos.x, this.pos.y);
    this.oldAcc.setTo(this.acc.x, this.acc.y);
    this.oldScale.setTo(this.scale.x, this.scale.y);
  }

  /**
   * Perform euler integration at the specified time step
   */
  public integrate(delta: number) {
    // Update placements based on linear algebra
    var seconds = delta / 1000;

    var totalAcc = this.acc.clone();
    // Only active vanilla actors are affected by global acceleration
    if (this.collider.collisionType === CollisionType.Active) {
      totalAcc.addEqual(Physics.acc);
    }

    this.vel.addEqual(totalAcc.scale(seconds));
    this.pos.addEqual(this.vel.scale(seconds)).addEqual(totalAcc.scale(0.5 * seconds * seconds));

    this.rx += this.torque * (1.0 / this.collider.moi) * seconds;
    this.rotation += this.rx * seconds;

    this.scale.x += (this.sx * delta) / 1000;
    this.scale.y += (this.sy * delta) / 1000;

    if (!this.scale.equals(this.oldScale)) {
      // change in scale effects the geometry
      this._geometryDirty = true;
    }

    // Update colliders
    this.collider.update();
    this._geometryDirty = false;
  }

  /**
   * Sets up a box collision area based on the current bounds of the associated actor of this physics body.
   *
   * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
   */
  public useBoxCollision(center: Vector = Vector.Zero) {
    this.collider.shape = new ConvexPolygon({
      collider: this.collider,
      points: this._actor.getRelativeGeometry(),
      pos: center // position relative to actor
    });

    // in case of a nan moi, coalesce to a safe default
    this.collider.moi = this.collider.shape.getMomentOfInertia() || this.collider.moi;
  }

  /**
   * Sets up a polygon collision area based on a list of of points relative to the anchor of the associated actor of this physics body.
   *
   * Only [convex polygon](https://en.wikipedia.org/wiki/Convex_polygon) definitions are supported.
   *
   * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
   */
  public usePolygonCollision(points: Vector[], center: Vector = Vector.Zero) {
    this.collider.shape = new ConvexPolygon({
      collider: this.collider,
      points: points,
      pos: center // position relative to actor
    });

    // in case of a nan moi, collesce to a safe default
    this.collider.moi = this.collider.shape.getMomentOfInertia() || this.collider.moi;
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
    this.collider.shape = new Circle({
      collider: this.collider,
      radius: radius,
      pos: center
    });
    this.collider.moi = this.collider.shape.getMomentOfInertia() || this.collider.moi;
  }

  /**
   * Sets up an [[EdgeArea|edge collision]] with a start point and an end point relative to the anchor of the associated actor
   * of this physics body.
   *
   * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
   */
  public useEdgeCollision(begin: Vector, end: Vector) {
    this.collider.shape = new Edge({
      collider: this.collider,
      begin: begin,
      end: end
    });

    this.collider.moi = this.collider.shape.getMomentOfInertia() || this.collider.moi;
  }

  /**
   * Returns a boolean indicating whether this body collided with
   * or was in stationary contact with
   * the body of the other [[Body]]
   */
  public touching(other: Body): boolean {
    var pair = new Pair(this.collider, other.collider);
    pair.collide();

    if (pair.collision) {
      return true;
    }

    return false;
  }
}
