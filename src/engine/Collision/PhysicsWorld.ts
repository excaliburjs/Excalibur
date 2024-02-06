import { Ray } from '../Math/ray';
import { DeepRequired } from '../Util/Required';
import { DynamicTreeCollisionProcessor, RayCastHit, RayCastOptions } from './Index';
import { PhysicsConfig } from './PhysicsConfig';

export class PhysicsWorld {
  /**
   * Spatial data structure for locating potential collision pairs and ray casts
   */
  public collisionProcessor: DynamicTreeCollisionProcessor;
  constructor(public config: DeepRequired<PhysicsConfig>) {
    this.collisionProcessor = new DynamicTreeCollisionProcessor(this.config);
  }

  /**
   * Raycast into the scene's physics world
   * @param ray
   * @param options
   */
  public rayCast(ray: Ray, options?: RayCastOptions): RayCastHit[] {
    return this.collisionProcessor.rayCast(ray, options);
  }
}