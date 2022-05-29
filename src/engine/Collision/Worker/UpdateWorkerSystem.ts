import { Entity } from "../../EntityComponentSystem";
import { System, SystemType } from "../../EntityComponentSystem/System";
import { BodyComponent } from "../BodyComponent";
// import { ColliderComponent } from "../ColliderComponent";
// import { BodyMessage, serializeToBodyMessage } from "./BodyMessage";
// import { StepMessage } from "./StepMessage";

export class UpdateBodyWorkerSystem extends System<BodyComponent> {
  readonly types = ["ex.body"] as const;
  systemType: SystemType = SystemType.Update;

  public worker: Worker;
  private _flattenedBodies: Float64Array = new Float64Array(13 * 5000);
  constructor(worker: Worker) {
    super();
    this.worker = worker;
  }

  update(entities: Entity[], delta: number): void {
    // const bodyMessages: BodyMessage[] = [];
    for (let entity of entities) {
      const body = entity.get(BodyComponent);
      // bodyMessages.push(serializeToBodyMessage(body));
      // todo what about extra sparse ids...
      let bodyId = body.id.value * 13;
      this._flattenedBodies[bodyId++] = body.id.value;
      this._flattenedBodies[bodyId++] = body.pos.x;
      this._flattenedBodies[bodyId++] = body.pos.y;
      this._flattenedBodies[bodyId++] = body.rotation;
      this._flattenedBodies[bodyId++] = body.scale.x;
      this._flattenedBodies[bodyId++] = body.scale.y;
      this._flattenedBodies[bodyId++] = body.vel.x;
      this._flattenedBodies[bodyId++] = body.vel.y;
      this._flattenedBodies[bodyId++] = body.acc.x;
      this._flattenedBodies[bodyId++] = body.acc.y;
      this._flattenedBodies[bodyId++] = body.angularVelocity;
      this._flattenedBodies[bodyId++] = body.scaleFactor.x;
      this._flattenedBodies[bodyId++] = body.scaleFactor.y;
    }

    this.worker.postMessage({
      type: 'step-flattened',
      bodies: this._flattenedBodies,
      elapsed: delta
    });

    // this.worker.postMessage({
    //   type: 'step',
    //   bodies: bodyMessages,
    //   elapsed: delta
    // } as StepMessage);
  }
}