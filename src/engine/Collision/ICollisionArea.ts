import { Color } from './../Drawing/Color';
import { CollisionContact } from './CollisionContact';
import { Body } from './Body';
import { BoundingBox } from './BoundingBox';
import { Vector, Projection, Ray } from '../Algebra';

/**
 * A collision area is a region of space that can detect when other collision areas intersect
 * for the purposes of colliding 2 objects in excalibur.
 */
export interface ICollisionArea {
  /**
   * Position of the collision area relative to the actor if it exists
   */
  pos: Vector;

  /**
   * Reference to the actor associated with this collision area
   */
  body: Body;

  /**
   * The center point of the collision area, for example if the area is a circle it would be the center.
   */
  getCenter(): Vector;

  /**
   * Find the furthest point on the convex hull of this particular area in a certain direction.
   */
  getFurthestPoint(direction: Vector): Vector;

  /**
   * Return the axis-aligned bounding box of the collision area
   */
  getBounds(): BoundingBox;

  /**
   * Return the axes of this particular shape
   */
  getAxes(): Vector[];

  /**
   * Return the calculated moment of intertia for this area
   */
  getMomentOfInertia(): number;

  // All new ICollisionAreas need to do the following
  // Create a new collision function in the CollisionJumpTable against all the primitives
  // Currently there are 3 primitive collision areas 3! = 6 jump functions
  collide(area: ICollisionArea): CollisionContact;

  /**
   * Return wether the area contains a point inclusive to it's border
   */
  contains(point: Vector): boolean;

  /**
   * Return the point on the border of the collision area that intersects with a ray (if any).
   */
  rayCast(ray: Ray, max?: number): Vector;

  /**
   * Create a projection of this area along an axis. Think of this as casting a "shadow" along an axis
   */
  project(axis: Vector): Projection;

  /**
   * Recalculates internal caches and values
   */
  recalc(): void;

  /**
   * Draw any debug information
   */
  debugDraw(ctx: CanvasRenderingContext2D, color: Color): void;
}
