import { Entity } from '../EntityComponentSystem';
import { MotionComponent } from '../EntityComponentSystem/Components/MotionComponent';
import { TransformComponent } from '../EntityComponentSystem/Components/TransformComponent';
import { System, SystemType } from '../EntityComponentSystem/System';
import { Physics } from './Physics';
import { BodyComponent } from './BodyComponent';
import { CollisionType } from './CollisionType';
import { EulerIntegrator } from './Integrator';

export class MotionSystem extends System<TransformComponent | MotionComponent> {
  public readonly types = ['ex.transform', 'ex.motion'] as const;
  public systemType = SystemType.Update;
  public priority = -1;

  update(entities: Entity[], elapsedMs: number): void {
    let transform: TransformComponent;
    let motion: MotionComponent;
    for (let i = 0; i < entities.length; i++) {
      transform = entities[i].get(TransformComponent);
      motion = entities[i].get(MotionComponent);

      const optionalBody = entities[i].get(BodyComponent);
      if (optionalBody?.sleeping) {
        continue;
      }

      const totalAcc = motion.acc.clone();
      if (optionalBody?.collisionType === CollisionType.Active && optionalBody?.useGravity) {
        totalAcc.addEqual(Physics.gravity);
      }
      optionalBody?.captureOldTransform();

      // Update transform and motion based on Euler linear algebra
      EulerIntegrator.integrate(transform, motion, totalAcc, elapsedMs);
    }
  }
}
