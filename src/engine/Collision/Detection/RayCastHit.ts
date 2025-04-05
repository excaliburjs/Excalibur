import type { Vector } from '../../Math/vector';
import type { Collider } from '../Colliders/Collider';
import type { BodyComponent } from '../BodyComponent';

export interface RayCastHit {
  /**
   * The distance along the ray cast in pixels that a hit was detected
   */
  distance: number;
  /**
   * Reference to the collider that was hit
   */
  collider: Collider;
  /**
   * Reference to the body that was hit
   */
  body: BodyComponent;
  /**
   * World space point of the hit
   */
  point: Vector;

  /**
   * Normal vector of hit collider
   */
  normal: Vector;
}
