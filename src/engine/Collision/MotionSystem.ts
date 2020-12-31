import { Camera } from "../Camera";
import { Color } from "../Drawing/Color";
import { Component, ComponentType, Entity } from "../EntityComponentSystem";
import { MotionComponent } from "../EntityComponentSystem/Components/MotionComponent";
import { TransformComponent } from "../EntityComponentSystem/Components/TransformComponent";
import { System, SystemType } from "../EntityComponentSystem/System";
import { Physics } from "../Physics";
import { Scene } from "../Scene";
import { DrawUtil } from "../Util/Index";
import { Body } from "./Body";
import { CollisionType } from "./CollisionType";
import { EulerIntegrator } from "./Integrator";


export class MotionSystem extends System<TransformComponent | MotionComponent> {
  public readonly types = ['transform', 'motion'] as const;
  public systemType = SystemType.Update;
  public priority = -1;

  private _entities: Entity<TransformComponent | MotionComponent>[] = [];
  private _camera: Camera;
  initialize(scene: Scene) {
    this._camera = scene.camera;
  }

  getOptional<T extends Component>(entity: Entity, component: ComponentType<T>): T | null {
    if (entity.components[component]){
      return (entity.components as any)[component] ?? null; 
    }
    return null;
  }

  update(entities: Entity<TransformComponent | MotionComponent>[], elapsedMs: number): void {
    let transform: TransformComponent;
    let motion; MotionComponent;
    this._entities = entities;
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

  debugDraw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    this._camera.draw(ctx);
    if (Physics.showMotionVectors) {
      for (let entity of this._entities) {
        DrawUtil.vector(ctx, Color.Yellow, entity.components.transform.pos, entity.components.motion.acc.add(Physics.acc));
        DrawUtil.vector(ctx, Color.Blue, entity.components.transform.pos, entity.components.motion.vel);
        DrawUtil.point(ctx, Color.Red, entity.components.transform.pos);
      }
    }

    ctx.restore();
  }

}