import { Entity } from "../EntityComponentSystem";
import { MotionComponent } from "../EntityComponentSystem/Components/MotionComponent";
import { TransformComponent } from "../EntityComponentSystem/Components/TransformComponent";
import { AddedEntity, isAddedSystemEntity, isRemoveSystemEntity, RemovedEntity, System, SystemType } from "../EntityComponentSystem/System";
import { Physics } from "../Physics";
import { removeItemFromArray } from "../Util/Util";
import { Body } from "./Body";
import { ColliderComponent } from "./ColliderComponent";
import { DynamicTreeCollisionProcessor } from "./DynamicTreeCollisionProcessor";


export class CollisionSystem extends System<TransformComponent | MotionComponent | ColliderComponent > {
  public readonly types = ['transform', 'motion', 'collider'] as const;
  systemType = SystemType.Update;

  private _processor = new DynamicTreeCollisionProcessor();
  private _bodies: Body[] = [];

  notify(message: AddedEntity | RemovedEntity) {
    if (isAddedSystemEntity(message)) {
      // TODO track something better
      // Why do we need to track at all, could I just run broadphase on these?
      this._processor.track((message.data as any).body);
      this._bodies.push((message.data as any).body);
    }

    if (isRemoveSystemEntity(message)) {
      this._processor.untrack((message.data as any).body);
      removeItemFromArray((message.data as any).body, this._bodies);
    }
  }

  update(_entities: Entity<TransformComponent | MotionComponent | ColliderComponent>[], elapsedMs: number): void {
    if (!Physics.enabled) {
      return;
    }

    // should maybe change this to run on colliders?
    let pairs = this._processor.broadphase(this._bodies, elapsedMs);

    let iter: number = Physics.collisionPasses;
    const collisionDelta = elapsedMs / iter;
    while (iter > 0) {
      pairs = this._processor.narrowphase(pairs);

      pairs = this._processor.resolve(pairs, collisionDelta, Physics.collisionResolutionStrategy);
      
      // TODO should this be in the while loop
      this._processor.runCollisionStartEnd(pairs);
      iter--;
    }
  }

}