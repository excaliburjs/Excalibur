import { Ray } from '../Math/ray';
import { DynamicTreeCollisionProcessor, RayCastHit, RayCastOptions } from './Index';


export class PhysicsWorld {
  public collisionProcessor: DynamicTreeCollisionProcessor;
  constructor() {
    this.collisionProcessor = new DynamicTreeCollisionProcessor();
  }

  public rayCast(ray: Ray, options?: RayCastOptions): RayCastHit[] {
    return this.collisionProcessor.rayCast(ray, options);
  }
}