import { AddedEntity, Entity, isAddedSystemEntity, RemovedEntity, System, SystemType } from "../../EntityComponentSystem";
import { Scene } from "../../Scene";
import { BodyComponent } from "../BodyComponent";
import { ColliderComponent } from "../ColliderComponent";
import { BodyMessage, serializeToBodyMessage, syncMessageToBody } from "./BodyMessage";
// import { StartMessage } from "./StartMessage";
// import { StepMessage } from "./StepMessage";


/**
 * Adapter system to martial collision information to the collision web worker
 */
export class CollisionWorkerSystem extends System<BodyComponent | ColliderComponent> {
  readonly types = ["ex.body", "ex.collider"] as const;
  systemType: SystemType = SystemType.Update;

  public worker: Worker;
  constructor(worker: Worker) {
    super();
    this.worker = worker;
  }
  // private _frameId = 0;
  // private _updateId = 0;

  private _bodyMap = new Map<number, BodyComponent>();
  private _bodies: BodyMessage[] = [];
  initialize(_scene: Scene): void {
    this.worker.onmessage = (messageEvent: MessageEvent<BodyMessage[]>) => {
      // todo sync entities
      this._bodies = messageEvent.data;
      for (let bodyMessage of this._bodies) {
        const body = this._bodyMap.get(bodyMessage.id);
        if (body) {
          syncMessageToBody(bodyMessage, body);
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
    // console.log(this._updateId, this._frameId);
    // if (this._updateId > this._frameId) {
    //   for (let bodyMessage of this._bodies) {
    //     const body = this._bodyMap.get(bodyMessage.id);
    //     if (body) {
    //       syncMessageToBody(bodyMessage, body);
    //     }
    //   }
    // }
  }
}