import { Camera } from '../Camera';
import { Color } from '../Drawing/Color';
import { Entity } from '../EntityComponentSystem';
import { MotionComponent } from '../EntityComponentSystem/Components/MotionComponent';
import { TransformComponent } from '../EntityComponentSystem/Components/TransformComponent';
import { System, SystemType } from '../EntityComponentSystem/System';
import { Physics } from './Physics';
import { Scene } from '../Scene';
import { DrawUtil } from '../Util/Index';
import { BodyComponent } from './Body';
import { CollisionType } from './CollisionType';
import { EulerIntegrator } from './Integrator';

export class MotionSystem extends System<TransformComponent | MotionComponent> {
  public readonly types = ['ex.transform', 'ex.motion'] as const;
  public systemType = SystemType.Update;
  public priority = -1;

  private _entities: Entity[] = [];
  private _camera: Camera;
  initialize(scene: Scene) {
    this._camera = scene.camera;
  }

  update(_entities: Entity[], elapsedMs: number): void {
    let transform: TransformComponent;
    let motion: MotionComponent;
    this._entities = _entities;
    for (const entity of _entities) {
      transform = entity.get(TransformComponent);
      motion = entity.get(MotionComponent);

      const optionalBody = entity.get(BodyComponent);
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

  debugDraw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    this._camera.draw(ctx);
    for (const entity of this._entities) {
      const transform = entity.get(TransformComponent);
      const motion = entity.get(MotionComponent);
      if (Physics.debug.showMotionVectors) {
        DrawUtil.vector(ctx, Color.Yellow, transform.pos, motion.acc.add(Physics.acc));
        DrawUtil.vector(ctx, Color.Blue, transform.pos, motion.vel);
        DrawUtil.point(ctx, Color.Red, transform.pos);
      }
      if (Physics.debug.showSleepMotion) {
        const pos = transform.pos;
        const body = entity.get(BodyComponent);
        if (body) {
          ctx.fillStyle = 'yellow';
          ctx.font = '18px';
          ctx.fillText(body.sleepMotion.toString(), pos.x, pos.y);
        }
      }
    }
    ctx.restore();
  }
}
