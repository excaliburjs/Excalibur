import type { Color } from '../../color';
import type { CollisionContact } from '../detection/collision-contact';
import type { BoundingBox } from '../bounding-box';
import type { Projection } from '../../math/projection';
import type { LineSegment } from '../../math/line-segment';
import { Vector } from '../../math/vector';
import type { Ray } from '../../math/ray';
import type { Clonable } from '../../interfaces/clonable';
import type { Entity } from '../../entity-component-system';
import type { Id } from '../../id';
import { createId } from '../../id';
import type { ExcaliburGraphicsContext } from '../../graphics/context/excalibur-graphics-context';
import type { Transform } from '../../math/transform';
import { EventEmitter } from '../../event-emitter';
import type { RayCastHit } from '../detection/ray-cast-hit';
import type { CompositeCollider } from './composite-collider';

/**
 * A collision collider specifies the geometry that can detect when other collision colliders intersect
 * for the purposes of colliding 2 objects in excalibur.
 */
export abstract class Collider implements Clonable<Collider> {
  private static _ID = 0;
  public readonly id: Id<'collider'> = createId('collider', Collider._ID++);
  /**
   * Composite collider if any this collider is attached to
   *
   * **WARNING** do not tamper with this property
   */
  public composite: CompositeCollider | null = null;
  public events = new EventEmitter();

  /**
   * Returns a boolean indicating whether this body collided with
   * or was in stationary contact with
   * the body of the other {@apilink Collider}
   */
  public touching(other: Collider): boolean {
    const contact = this.collide(other);

    // if there is a contact then we are touching
    if (contact && contact.length > 0) {
      return true;
    }

    return false;
  }

  public owner: Entity;

  /**
   * Pixel offset of the collision collider relative to the collider, by default (0, 0) meaning the collider is positioned
   * on top of the collider.
   */
  offset: Vector = Vector.Zero;

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
  abstract rayCast(ray: Ray, max?: number): RayCastHit | null;

  /**
   * Create a projection of this collider along an axis. Think of this as casting a "shadow" along an axis
   */
  abstract project(axis: Vector): Projection;

  /**
   * Updates collider world space geometry
   */
  abstract update(transform: Transform): void;

  abstract debug(ex: ExcaliburGraphicsContext, color: Color, options?: { lineWidth: number; pointSize: number }): void;

  abstract clone(): Collider;
}
