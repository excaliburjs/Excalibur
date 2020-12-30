import { Component, ComponentType, Entity } from "../EntityComponentSystem";
import { MotionComponent } from "../EntityComponentSystem/Components/MotionComponent";
import { TransformComponent } from "../EntityComponentSystem/Components/TransformComponent";
import { System, SystemType } from "../EntityComponentSystem/System";
import { Physics } from "../Physics";
import { Body } from "./Body";
import { CollisionType } from "./CollisionType";
import { EulerIntegrator } from "./Integrator";


export class MotionSystem extends System<TransformComponent | MotionComponent> {
  public readonly types = ['transform', 'motion'] as const;
  public systemType = SystemType.Update;
  public priority = -1;

  getOptional<T extends Component>(entity: Entity, component: ComponentType<T>): T | null {
    if (entity.components[component]){
      return (entity.components as any)[component] ?? null; 
    }
    return null;
  }

  update(entities: Entity<TransformComponent | MotionComponent>[], elapsedMs: number): void {
    let transform: TransformComponent;
    let motion; MotionComponent;
    for (const entity of entities) {
      transform = entity.components.transform;
      motion = entity.components.motion;

      const optionalBody = this.getOptional<Body>(entity, 'body');
      if (optionalBody?.sleeping) {
        continue;
      }

      const totalAcc = motion.acc.clone();
      if (optionalBody?.collisionType === CollisionType.Active && 
          optionalBody?.useGravity) {
        totalAcc.addEqual(Physics.gravity);
      }
      optionalBody?.captureOldTransform();

      // Update transform and motion based on Euler linear algebra
      EulerIntegrator.integrate(transform, motion, totalAcc, elapsedMs);
    } 
  }

}