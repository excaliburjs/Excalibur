import { Color } from '../Drawing/Color';
import { Actor } from '../Actor';
import { CollisionShape } from './CollisionShape';
import { Vector, Line } from '../Algebra';
import { Physics } from '../Physics';
import { BoundingBox } from './BoundingBox';
import { CollisionType } from './CollisionType';
import { CollisionGroup } from './CollisionGroup';
import { CollisionContact } from './CollisionContact';
import { EventDispatcher } from '../EventDispatcher';
import { Clonable } from '../Interfaces/Clonable';
import { BodyComponent } from './Body';
import { DrawUtil } from '../Util/Index';

/**
 * Type guard function to determine whether something is a Collider
 */
export function isCollider(x: Actor | Collider): x is Collider {
  return x instanceof Collider;
}

export interface ColliderOptions {
  /**
   * Optional [[CollisionShape|Shape]] to use with this collider, the shape defines the collidable
   * region along with the [[BoundingBox|bounding box]]
   */
  shape?: CollisionShape;
  /**
   * Optional pixel offset from the position of the body
   */
  offset?: Vector;
  /**
   * Optional collision group on this collider
   */
  group?: CollisionGroup;
  /**
   * Optional [[CollisionType|collision type]], if not specified the default is [[CollisionType.PreventCollision]]
   */
  type?: CollisionType;
  /**
   * Optional local bounds if other bounds are required instead of the bounding box from the shape. This overrides shape bounds.
   */
  localBounds?: BoundingBox;
}

/**
 * Collider describes material properties like shape,
 * bounds, friction of the physics object.
 */
export class Collider implements Clonable<Collider> {
  private static _ID = 0;
  private _id = Collider._ID++;
  private _shape: CollisionShape;
  public useShapeInertia: boolean;
  public events: EventDispatcher<Collider> = new EventDispatcher<Collider>(this);
  
  /**
   * Owning id
   */
  public owningId?: number = null;

  // TODO can we avoid this
  public body: BodyComponent;

  constructor(options: ColliderOptions) {
    const { shape, offset } = options
    this.shape = shape;
    this.offset = offset ?? Vector.Zero;
  }

  /**
   * Returns a clone of the current collider, not associated with any body
   */
  public clone() {
    return new Collider({
      // type: this.type,
      shape: this._shape.clone(),
      // group: this.group,
      offset: this.offset
    });
  }

  /**
   * Get the unique id of the collider
   */
  public get id(): number {
    return this._id;
  }

  // /**
  //  * Gets or sets the current collision type of this collider. By
  //  * default it is ([[CollisionType.PreventCollision]]).
  //  */
  // public type: CollisionType = CollisionType.PreventCollision;

  // /**
  //  * Gets or sets the current [[CollisionGroup|collision group]] for the collider, colliders with like collision groups do not collide.
  //  * By default, the collider will collide with [[CollisionGroup|all groups]].
  //  */
  // public group: CollisionGroup = CollisionGroup.All;

  /**
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
  }

  /**
   * The center of the collider in world space
   */
  public get center(): Vector {
    return this.bounds.center;
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
   * Find the closest line between 2 colliders
   *
   * Line is in the direction of the other collider. Away from this collider, this -> other.
   * @param other Other collider
   */
  public getClosestLineBetween(other: Collider): Line {
    return this.shape.getClosestLineBetween(other.shape);
  }

  /**
   * Gets the current pixel offset of the collider
   */
  public get offset() {
    return this.shape.offset.clone();
  }

  /**
   * Sets the pixel offset of the collider
   */
  public set offset(offset: Vector) {
    this.shape.offset = offset.clone();
  }

  /**
   * Returns a boolean indicating whether this body collided with
   * or was in stationary contact with
   * the body of the other [[Collider]]
   */
  public touching(other: Collider): boolean {
    const contact = this.collide(other);

    if (contact) {
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

    return new BoundingBox();
  }

  /**
   * Returns the collider's [[BoundingBox]] relative to the body's position.
   * If there is no shape, a point bounding box is returned
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
