import { Entity } from "../../EntityComponentSystem";
import { System, SystemType } from "../../EntityComponentSystem/System";
import { BodyComponent } from "../BodyComponent";
import { SharedBuffer } from "./SharedBuffer";

export class SyncToWorkerSystem extends System<BodyComponent> {
  readonly types = ["ex.body"] as const;
  systemType: SystemType = SystemType.Update;

  public worker: Worker;
  public buffer: SharedBuffer;
  constructor(worker: Worker, buffer: SharedBuffer) {
    super();
    this.worker = worker;
    this.buffer = buffer;
  }

  update(entities: Entity[], delta: number): void {
    // const bodyMessages: BodyMessage[] = [];
    if (this.buffer.buffer.byteLength > 0) {
      const flattenedBodies = new Float64Array(this.buffer.buffer);
      let index = 0;
      for (let entity of entities) {
        const body = entity.get(BodyComponent);
        // bodyMessages.push(serializeToBodyMessage(body));
        // todo what about extra sparse ids...
        // let bodyId = body.id.value * 13;
        flattenedBodies[index++] = body.id.value;
        flattenedBodies[index++] = body.pos.x;
        flattenedBodies[index++] = body.pos.y;
        flattenedBodies[index++] = body.rotation;
        flattenedBodies[index++] = body.scale.x;
        flattenedBodies[index++] = body.scale.y;
        flattenedBodies[index++] = body.vel.x;
        flattenedBodies[index++] = body.vel.y;
        flattenedBodies[index++] = body.acc.x;
        flattenedBodies[index++] = body.acc.y;
        flattenedBodies[index++] = body.angularVelocity;
        flattenedBodies[index++] = body.scaleFactor.x;
        flattenedBodies[index++] = body.scaleFactor.y;
      }

      this.buffer.send();
      this.worker.postMessage({
        type: 'step-flattened',
        bodies: flattenedBodies,
        elapsed: delta
      }, [flattenedBodies.buffer]);
    }
  }
}