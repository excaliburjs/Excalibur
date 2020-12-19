import { Actor } from "../Actor";
import { Entity } from "../EntityComponentSystem";
import { MotionComponent } from "../EntityComponentSystem/Components/MotionComponent";
import { TransformComponent } from "../EntityComponentSystem/Components/TransformComponent";
import { System, SystemType } from "../EntityComponentSystem/System";
import { Physics } from "../Physics";
import { CollisionType } from "./CollisionType";


export class MotionSystem extends System<TransformComponent | MotionComponent> {
  public readonly types = ['transform', 'motion'] as const;
  public systemType = SystemType.Update;
  public priority = -1;
  update(entities: Entity<TransformComponent | MotionComponent>[], elapsedMs: number): void {
    const seconds = elapsedMs / 1000;
    let transform: TransformComponent;
    let motion; MotionComponent;
    for (const entity of entities) {
      transform = entity.components.transform;
      motion = entity.components.motion;  

       // Update placements based on linear algebra
       
       // Currently using Euler integration
      const totalAcc = motion.acc.clone();
      if (entity instanceof Actor && entity.body.collider.type == CollisionType.Active) {
        totalAcc.addEqual(Physics.acc);
      }

      // TODO global acceleration? off scene

      motion.vel.addEqual(totalAcc.scale(seconds));
      transform.pos.addEqual(motion.vel.scale(seconds)).addEqual(totalAcc.scale(0.5 * seconds * seconds));

      motion.angularVelocity += motion.torque * (1.0 / motion.inertia) * seconds;
      transform.rotation += motion.angularVelocity * seconds;

      transform.scale.addEqual(motion.scaleFactor.scale(seconds));
    } 
  }

}