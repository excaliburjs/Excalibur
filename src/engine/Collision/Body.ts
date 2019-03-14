import { Pair } from './Pair';
import { Vector } from '../Algebra';
import { Actor } from '../Actor';
import { Collider } from './Collider';

/**
 * Body describes all the physical properties pos, vel, acc, rotation, angular velocity
 */
export class Body {
  private _collider: Collider;

  /**
   * Constructs a new physics body associated with an actor
   */
  constructor(private actor: Actor) {
    this._collider = new Collider(this.actor, this);
  }

  public get collisionType() {
    return this.actor.collisionType;
  }

  public set collider(collider: Collider) {
    this._collider = collider;
  }

  public get collider() {
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
   * The rotational velocity of the actor in radians/second
   */
  public rx: number = 0; //radians/sec

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
   * Returns a boolean indicating whether this body collided with
   * or was in stationary contact with
   * the body of the other [[Body]]
   */
  public touching(other: Body): boolean {
    var pair = new Pair(this, other);
    pair.collide();

    if (pair.collision) {
      return true;
    }

    return false;
  }
}
