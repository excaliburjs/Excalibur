import { AddedEntity, Entity, isAddedSystemEntity, RemovedEntity, System, SystemType } from "../../EntityComponentSystem";
import { Scene } from "../../Scene";
import { BodyComponent } from "../BodyComponent";
import { serializeToBodyMessage } from "./BodyMessage";
// import { StartMessage } from "./StartMessage";
// import { StepMessage } from "./StepMessage";

const posXOffset = 1;
const posYOffset = 2;
const rotationOffset = 3;
const scaleXOffset = 4;
const scaleYOffset = 5;
const velXOffset = 6;
const velYOffset = 7;
const accXOffset = 8;
const accYOffset = 9;
const angularVelocityOffset = 10;
const scaleFactorXOffset = 11;
const scaleFactorYOffset = 12;

/**
 * Adapter system to martial collision information to the collision web worker
 */
export class CollisionWorkerSystem extends System<BodyComponent> {
  readonly types = ["ex.body"] as const;
  systemType: SystemType = SystemType.Update;

  public worker: Worker;
  constructor(worker: Worker) {
    super();
    this.worker = worker;
  }

  private _bodyMap = new Map<number, BodyComponent>();
  // private _bodies: BodyMessage[] = [];

  
  initialize(_scene: Scene): void {
    // this.worker.onmessage = (messageEvent: MessageEvent<BodyMessage[]>) => {
    //   // todo sync entities
    //   this._bodies = messageEvent.data;
    //   for (let bodyMessage of this._bodies) {
    //     const body = this._bodyMap.get(bodyMessage.id);
    //     if (body) {
    //       syncMessageToBody(bodyMessage, body);
    //     }
    //   }
    // }
    this.worker.onmessage = (messageEvent: MessageEvent<Float64Array>) => {
      const flattenedBodies = messageEvent.data;
      for (let i = 0; i < flattenedBodies.length; i += 13) {
        const id = flattenedBodies[i];
        let posx = flattenedBodies[i+posXOffset];
        let posy = flattenedBodies[i+posYOffset];
        let rotation = flattenedBodies[i+rotationOffset];
        let scalex = flattenedBodies[i+scaleXOffset];
        let scaley = flattenedBodies[i+scaleYOffset];
        let velx = flattenedBodies[i+velXOffset];
        let vely = flattenedBodies[i+velYOffset];
        let accx = flattenedBodies[i+accXOffset];
        let accy = flattenedBodies[i+accYOffset];
        let angularVelocity = flattenedBodies[i+angularVelocityOffset];
        let scaleFactorx = flattenedBodies[i+scaleFactorXOffset];
        let scaleFactory = flattenedBodies[i+scaleFactorYOffset];
        const body = this._bodyMap.get(id);
        if (body) {
          body.pos.setTo(posx, posy);
          body.rotation = rotation;
          body.scale.setTo(scalex, scaley);
          body.vel.setTo(velx, vely);
          body.acc.setTo(accx, accy);
          body.angularVelocity = angularVelocity;
          body.scaleFactor.setTo(scaleFactorx, scaleFactory);
        }
      }
    }
  }

  public notify(message: AddedEntity | RemovedEntity): void {
    if (isAddedSystemEntity(message)) {
      const bodyComponent = message.data.get(BodyComponent);
      // const colliderComponent = message.data.get(ColliderComponent);
      this._bodyMap.set(bodyComponent.id.value, bodyComponent);
      this.worker.postMessage(serializeToBodyMessage(bodyComponent));
    } else {
      // const colliderComponent = message.data.get(ColliderComponent);
      // const collider = colliderComponent.get();
      // if (colliderComponent && collider) {
      //     this.worker.postMessage({command: 'untrack', payload: collider});
      // }
    }
  }

  update(_entities: Entity[], _delta: number): void {
    // for (let bodyMessage of this._bodies) {
    //   const body = this._bodyMap.get(bodyMessage.id);
    //   if (body) {
    //     syncMessageToBody(bodyMessage, body);
    //   }
    // }
  }
}