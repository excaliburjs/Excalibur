import { BodyComponent, ColliderComponent, Vector } from "..";
import { Camera } from "../Camera";
import { Engine } from "../Engine";
import { Entity, TransformComponent } from "../EntityComponentSystem";
import { MotionComponent } from "../EntityComponentSystem/Components/MotionComponent";
import { System, SystemType } from "../EntityComponentSystem/System";
import { ExcaliburGraphicsContext } from "../Graphics/Context/ExcaliburGraphicsContext";
import { Scene } from "../Scene";


export class DebugSystem extends System<TransformComponent> {
  public readonly types = ['ex.transform'] as const;
  public readonly systemType = SystemType.Draw;
  private _graphicsContext: ExcaliburGraphicsContext;
  private _camera: Camera;
  private _engine: Engine;

  public initialize(scene: Scene): void {
    this._graphicsContext = scene.engine.graphicsContext;
    this._camera = scene.camera;
    this._engine = scene.engine;
  }
  update(entities: Entity[], _delta: number): void {
    if (!this._engine.isDebug) {
      return;
    }
    let id: number;
    let killed: boolean;
    let name: string;
    let entitySettings = this._engine.debug.entity;
    let tx: TransformComponent;
    let txSettings = this._engine.debug.transform;
    let motion: MotionComponent;
    let motionSettings = this._engine.debug.motion;
    let collider: ColliderComponent;
    let colliderSettings = this._engine.debug.collider;
    let body: BodyComponent;
    let bodySettings = this._engine.debug.body;
    let offscreen: boolean;
    for (let entity of entities) {
      id = entity.id;
      killed = entity.isKilled();
      name = entity.name
      offscreen = entity.hasTag('offscreen');
      
      tx = entity.get(TransformComponent);
      if (tx) {
        if (txSettings.showAll || txSettings.showPosition) {
          this._graphicsContext.drawCircle(tx.pos, 5, txSettings.positionColor);
          this._graphicsContext.debug.drawText(tx.pos.toString(), tx.pos);
        }
        if (txSettings.showAll || txSettings.showRotation) {
          this._graphicsContext.drawLine(tx.pos, Vector.fromAngle(tx.rotation).scale(10).add(tx.pos), txSettings.rotationColor, 2);
        }
        if (txSettings.showAll || txSettings.showScale) {
          this._graphicsContext.drawLine(tx.pos, tx.scale.add(tx.pos), txSettings.scaleColor, 2);
        }
      }
      
      motion = entity.get(MotionComponent);
      if (motion) {

      }

      collider = entity.get(ColliderComponent);
      if (collider) {

      }

      body = entity.get(BodyComponent);
      if (body) {

      }

    }
  }

}