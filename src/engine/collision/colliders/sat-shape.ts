import type { Vector } from '../../math/vector';
import type { Id } from '../../id';
import type { Transform } from '../../math/transform';

/**
 * Minimal convex shape description the separating axis test and contact clipping operate on.
 *
 * {@apilink PolygonCollider} and {@apilink EdgeCollider} (as a two-sided, two point "polygon") both satisfy this.
 */
export interface SatShape {
  id: Id<'collider'>;
  /**
   * Points in local space (relative to `transform`), in perimeter order
   */
  points: readonly Vector[];
  /**
   * Outward normal for the side starting at each point, normals[i] belongs to side points[i] -> points[(i + 1) % length]
   */
  normals: readonly Vector[];
  /**
   * Transform from local space to world space
   */
  transform: Transform;
  /**
   * Center of the shape in world space
   */
  center: Vector;
}
