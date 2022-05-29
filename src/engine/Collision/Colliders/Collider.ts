import { Color } from '../../Color';
import { CollisionContact } from '../Detection/CollisionContact';
import { BoundingBox } from '../BoundingBox';
import { Projection } from '../../Math/projection';
import { LineSegment } from '../../Math/line-segment';
import { Vector } from '../../Math/vector';
import { Ray } from '../../Math/ray';
import { Clonable } from '../../Interfaces/Clonable';
import { Entity } from '../../EntityComponentSystem';
import { createId, Id } from '../../Id';
import { EventDispatcher } from '../../EventDispatcher';
import { ExcaliburGraphicsContext } from '../../Graphics/Context/ExcaliburGraphicsContext';
import { Transform } from '../../Math/transform';

/**
 * A collision collider specifies the geometry that can detect when other collision colliders intersect
 * for the purposes of colliding 2 objects in excalibur.
 */
export abstract class Collider implements Clonable<Collider> {
  private static _ID = 0;
  public readonly id: Id<'collider'> = createId('collider', Collider._ID++);
  /**
   * Excalibur uses this to signal to the [[CollisionSystem]] this is part of a composite collider
   * @internal
   * @hidden
   */
  public __compositeColliderId: Id<'collider'> | null = null;
  public events: EventDispatcher<Collider> = new EventDispatcher<Collider>();

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

  public owner: Entity;

  /**
   * Pixel offset of the collision collider relative to the collider, by default (0, 0) meaning the collider is positioned
   * on top of the collider.
   */
  offset: Vector;

  /**
   * Position of the collision collider in world coordinates
   */
  abstract get worldPos(): Vector;

  /**
   * The center point of the collision collider, for example if the collider is a circle it would be the center.
   */
  abstract get center(): Vector;

  /**
   * Return the axis-aligned bounding box of the collision collider in world coordinates
   */
  abstract get bounds(): BoundingBox;

  /**
   * Return the axis-aligned bounding box of the collision collider in local coordinates
   */
  abstract get localBounds(): BoundingBox;

  /**
   * Return the axes of this particular collider
   */
  abstract get axes(): Vector[];
  /**
   * Find the furthest point on the convex hull of this particular collider in a certain direction.
   */
  abstract getFurthestPoint(direction: Vector): Vector;

  abstract getInertia(mass: number): number;

  // All new CollisionShape need to do the following
  // Create a new collision function in the CollisionJumpTable against all the primitives
  // Currently there are 3 primitive collision collider 3! = 6 jump functions
  abstract collide(collider: Collider): CollisionContact[];

  /**
   * Returns the closest line between the surfaces this collider and another
   * @param collider
   */
  abstract getClosestLineBetween(collider: Collider): LineSegment;

  /**
   * Return wether the collider contains a point inclusive to it's border
   */
  abstract contains(point: Vector): boolean;

  /**
   * Return the point on the border of the collision collider that intersects with a ray (if any).
   */
  abstract rayCast(ray: Ray, max?: number): Vector;

  /**
   * Create a projection of this collider along an axis. Think of this as casting a "shadow" along an axis
   */
  abstract project(axis: Vector): Projection;

  /**
   * Updates collider world space geometry
   */
  abstract update(transform: Transform): void;


  abstract debug(ex: ExcaliburGraphicsContext, color: Color): void;

  abstract clone(): Collider;
}
