import { Query, SystemPriority, World } from '../EntityComponentSystem';
import { MotionComponent } from '../EntityComponentSystem/Components/MotionComponent';
import { TransformComponent } from '../EntityComponentSystem/Components/TransformComponent';
import { System, SystemType } from '../EntityComponentSystem/System';
import { Physics } from './Physics';
import { BodyComponent } from './BodyComponent';
import { CollisionType } from './CollisionType';
import { EulerIntegrator } from './Integrator';

export class MotionSystem extends System {
  public systemType = SystemType.Update;
  public priority = SystemPriority.Higher;
  query: Query<typeof TransformComponent | typeof MotionComponent>;
  constructor(public world: World) {
    super();
    this.query = this.world.query([TransformComponent, MotionComponent]);
  }

  update(elapsedMs: number): void {
    let transform: TransformComponent;
    let motion: MotionComponent;
    const entities = this.query.entities;
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
