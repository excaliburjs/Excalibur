import { Vector } from '../Algebra';
import { Actor } from '../Actor';
import { Collider } from './Collider';
import { CollisionType } from './CollisionType';
import { Physics } from '../Physics';
import { PreCollisionEvent, PostCollisionEvent, CollisionStartEvent, CollisionEndEvent } from '../Events';
import { Clonable } from '../Interfaces/Clonable';
import { Shape } from './Shape';
import { TransformComponent } from '../EntityComponentSystem/Components/TransformComponent';

export interface BodyOptions {
  /**
   * Optionally the actor associated with this body
   */
  actor?: Actor;
  /**
   * An optional collider to use in this body, if none is specified a default Box collider will be created.
   */
  collider?: Collider;
}

/**
 * Body describes all the physical properties pos, vel, acc, rotation, angular velocity
 */
export class Body implements Clonable<Body> {
  private _collider: Collider;
  public actor: Actor;
  /**
   * Constructs a new physics body associated with an actor
   */
  constructor({ actor, collider }: BodyOptions) {
    if (!actor && !collider) {
      throw new Error('An actor or collider are required to create a body');
    }

    this.actor = actor;
    if (!collider && actor) {
      this.collider = this.useBoxCollider(actor.width, actor.height, actor.anchor);
    } else {
      this.collider = collider;
    }
  }

  public get id() {
    return this.actor ? this.actor.id : -1;
  }

  /**
   * Returns a clone of this body, not associated with any actor
   */
  public clone() {
    return new Body({
      actor: null,
      collider: this.collider.clone()
    });
  }

  public get active() {
    return this.actor ? !this.actor.isKilled() : false;
  }

  public get center() {
    return this.pos;
  }

  // TODO allow multiple colliders for a single body
  public set collider(collider: Collider) {
    if (collider) {
      this._collider = collider;
      this._collider.body = this;
      this._wireColliderEventsToActor();
    }
  }

  public get collider(): Collider {
    return this._collider;
  }

  public get transform(): TransformComponent {
    return this.actor.components.transform;
  }

  /**
   * The (x, y) position of the actor this will be in the middle of the actor if the
   * [[Actor.anchor]] is set to (0.5, 0.5) which is default.
   * If you want the (x, y) position to be the top left of the actor specify an anchor of (0, 0).
   */
  public get pos(): Vector {
    return this.transform.pos;
  }

  public set pos(val: Vector) {
    this.transform.pos = val;
  }

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
   * The current acceleration vector (ax, ay) of the actor in pixels/second/second. An acceleration pointing down such as (0, 100) may
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
   * Gets/sets the rotation of the body from the last frame.
   */
  public oldRotation: number = 0; // radians

  /**
   * The rotation of the actor in radians
   */
  public get rotation() {
    return this.transform.rotation;
  }

  public set rotation(val: number) {
    this.transform.rotation = val;
  }

  /**
   * The scale vector of the actor
   * @obsolete ex.Body.scale will be removed in v0.25.0
   */
  public scale: Vector = Vector.One;

  /**
   * The scale of the actor last frame
   * @obsolete ex.Body.scale will be removed in v0.25.0
   */
  public oldScale: Vector = Vector.One;

  /**
   * The x scalar velocity of the actor in scale/second
   * @obsolete ex.Body.scale will be removed in v0.25.0
   */
  public sx: number = 0; //scale/sec
  /**
   * The y scalar velocity of the actor in scale/second
   * @obsolete ex.Body.scale will be removed in v0.25.0
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

  /**
   * Flags the shape dirty and must be recalculated in world space
   */
  public markCollisionShapeDirty() {
    this._geometryDirty = true;
  }

  public get isColliderShapeDirty(): boolean {
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
    this.oldRotation = this.rotation;
  }

  /**
   * Perform euler integration at the specified time step
   */
  public integrate(delta: number) {
    // Update placements based on linear algebra
    const seconds = delta / 1000;

    const totalAcc = this.acc.clone();
    // Only active vanilla actors are affected by global acceleration
    if (this.collider.type === CollisionType.Active) {
      totalAcc.addEqual(Physics.acc);
    }

    this.vel.addEqual(totalAcc.scale(seconds));
    this.pos.addEqual(this.vel.scale(seconds)).addEqual(totalAcc.scale(0.5 * seconds * seconds));

    this.rx += this.torque * (1.0 / this.collider.inertia) * seconds;
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
   * Sets up a box geometry based on the current bounds of the associated actor of this physics body.
   *
   * If no width/height are specified the body will attempt to use the associated actor's width/height.
   *
   * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
   */
  public useBoxCollider(width?: number, height?: number, anchor: Vector = Vector.Half, center: Vector = Vector.Zero): Collider {
    if (width === null || width === undefined) {
      width = this.actor ? this.actor.width : 0;
    }
    if (height === null || height === undefined) {
      height = this.actor ? this.actor.height : 0;
    }

    this.collider.shape = Shape.Box(width, height, anchor, center);
    return this.collider;
  }

  /**
   * Sets up a [[ConvexPolygon|convex polygon]] collision geometry based on a list of of points relative
   *  to the anchor of the associated actor
   * of this physics body.
   *
   * Only [convex polygon](https://en.wikipedia.org/wiki/Convex_polygon) definitions are supported.
   *
   * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
   */
  public usePolygonCollider(points: Vector[], center: Vector = Vector.Zero): Collider {
    this.collider.shape = Shape.Polygon(points, false, center);
    return this.collider;
  }

  /**
   * Sets up a [[Circle|circle collision geometry]] with a specified radius in pixels.
   *
   * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
   */
  public useCircleCollider(radius: number, center: Vector = Vector.Zero): Collider {
    this.collider.shape = Shape.Circle(radius, center);
    return this.collider;
  }

  /**
   * Sets up an [[Edge|edge collision geometry]] with a start point and an end point relative to the anchor of the associated actor
   * of this physics body.
   *
   * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
   */
  public useEdgeCollider(begin: Vector, end: Vector): Collider {
    this.collider.shape = Shape.Edge(begin, end);
    return this.collider;
  }

  // TODO remove this, eventually events will stay local to the thing they are around
  private _wireColliderEventsToActor() {
    this.collider.clear();
    this.collider.on('precollision', (evt: PreCollisionEvent<Collider>) => {
      if (this.actor) {
        this.actor.emit('precollision', new PreCollisionEvent(evt.target.body.actor, evt.other.body.actor, evt.side, evt.intersection));
      }
    });
    this.collider.on('postcollision', (evt: PostCollisionEvent<Collider>) => {
      if (this.actor) {
        this.actor.emit('postcollision', new PostCollisionEvent(evt.target.body.actor, evt.other.body.actor, evt.side, evt.intersection));
      }
    });
    this.collider.on('collisionstart', (evt: CollisionStartEvent<Collider>) => {
      if (this.actor) {
        this.actor.emit('collisionstart', new CollisionStartEvent(evt.target.body.actor, evt.other.body.actor, evt.pair));
      }
    });
    this.collider.on('collisionend', (evt: CollisionEndEvent<Collider>) => {
      if (this.actor) {
        this.actor.emit('collisionend', new CollisionEndEvent(evt.target.body.actor, evt.other.body.actor));
      }
    });
  }
}
