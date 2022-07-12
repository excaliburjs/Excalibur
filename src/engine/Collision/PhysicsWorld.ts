import { Ray } from "../Math/ray";
import { DynamicTreeCollisionProcessor, RayCastHit, RayCastOptions } from "./Index";


export class PhysicsWorld {
  public _collisionProcessor: DynamicTreeCollisionProcessor;
  constructor() {
    this._collisionProcessor = new DynamicTreeCollisionProcessor();
  }

  public rayCast(ray: Ray, options?: RayCastOptions): RayCastHit[] {
    return this._collisionProcessor.rayCast(ray, options);
  }
}