import { Color } from '../Drawing/Color';
import { CollisionContact } from './CollisionContact';
import { Body } from './Body';
import { BoundingBox } from './BoundingBox';
import { Vector, Projection, Ray } from '../Algebra';
import { Collider } from './Collider';
import { Clonable } from '../Interfaces/Clonable';

/**
 * A collision shape specifies the geometry that can detect when other collision shapes intersect
 * for the purposes of colliding 2 objects in excalibur.
 */
export interface CollisionShape extends Clonable<CollisionShape> {
  /**
   * Position of the collision shape relative to the collider, by default (0, 0) meaning the shape is positioned on top of the collider.
   */
  pos: Vector;

  /**
   * Postion of the collision shape in world coordinates
   */
  worldPos: Vector;

  /**
   * Reference to the actor associated with this collision shape
   * @obsolete Will be removed in v0.24.0 please use [[collider]]
   */
  body: Body;

  /**
   * Reference to the collider associated with this collision shape geometry
   */
  collider?: Collider;

  /**
   * The center point of the collision shape, for example if the shape is a circle it would be the center.
   */
  getCenter(): Vector;

  /**
   * Find the furthest point on the convex hull of this particular shape in a certain direction.
   */
  getFurthestPoint(direction: Vector): Vector;

  /**
   * Return the axis-aligned bounding box of the collision shape in world coordinates
   */
  bounds: BoundingBox;

  /**
   * Return the axis-aligned boudning box of the collision shape in local coordinates
   */
  localBounds: BoundingBox;

  /**
   * Return the axes of this particular shape
   */
  axes: Vector[];

  /**
   * Return the calculated moment of intertia for this shape
   */
  inertia: number;

  // All new CollisionShape need to do the following
  // Create a new collision function in the CollisionJumpTable against all the primitives
  // Currently there are 3 primitive collision shape 3! = 6 jump functions
  collide(shape: CollisionShape): CollisionContact;

  /**
   * Return wether the shape contains a point inclusive to it's border
   */
  contains(point: Vector): boolean;

  /**
   * Return the point on the border of the collision shape that intersects with a ray (if any).
   */
  rayCast(ray: Ray, max?: number): Vector;

  /**
   * Create a projection of this shape along an axis. Think of this as casting a "shadow" along an axis
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

/**
 * @obsolete Use interface [[CollisionShape]], CollisionArea will be deprecated in v0.24.0
 */
export interface CollisionArea extends CollisionShape {}
