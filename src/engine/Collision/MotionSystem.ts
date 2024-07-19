import { Entity, Query, SystemPriority, World } from '../EntityComponentSystem';
import { MotionComponent } from '../EntityComponentSystem/Components/MotionComponent';
import { TransformComponent } from '../EntityComponentSystem/Components/TransformComponent';
import { System, SystemType } from '../EntityComponentSystem/System';
import { BodyComponent } from './BodyComponent';
import { CollisionType } from './CollisionType';
import { EulerIntegrator } from './Integrator';
import { PhysicsWorld } from './PhysicsWorld';

export class MotionSystem extends System {
  public systemType = SystemType.Update;
  public priority = SystemPriority.Higher;
  private _physicsConfigDirty = false;
  query: Query<typeof TransformComponent | typeof MotionComponent>;
  constructor(
    public world: World,
    public physics: PhysicsWorld
  ) {
    super();
    physics.$configUpdate.subscribe(() => (this._physicsConfigDirty = true));
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
      if (this._physicsConfigDirty && optionalBody) {
        optionalBody.updatePhysicsConfig(this.physics.config.bodies);
      }

      if (optionalBody?.sleeping) {
        continue;
      }

      const totalAcc = motion.acc.clone();
      if (optionalBody?.collisionType === CollisionType.Active && optionalBody?.useGravity) {
        totalAcc.addEqual(this.physics.config.gravity);
      }

      // capture old transform of this entity and all of its children so that
      // any transform properties that derived from their parents are properly captured
      if (!entities[i].parent) {
        this.captureOldTransformWithChildren(entities[i]);
      }

      // Update transform and motion based on Euler linear algebra
      EulerIntegrator.integrate(transform, motion, totalAcc, elapsedMs);
    }
    this._physicsConfigDirty = false;
  }

  captureOldTransformWithChildren(entity: Entity) {
    entity.get(BodyComponent)?.captureOldTransform();

    for (let i = 0; i < entity.children.length; i++) {
      this.captureOldTransformWithChildren(entity.children[i]);
    }
  }
}
