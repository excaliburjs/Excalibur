import { Entity } from "../../EntityComponentSystem";
import { System, SystemType } from "../../EntityComponentSystem/System";
import { BodyComponent } from "../BodyComponent";
import { ColliderComponent } from "../ColliderComponent";
import { BodyMessage, serializeToBodyMessage } from "./BodyMessage";
import { StepMessage } from "./StepMessage";

export class UpdateBodyWorkerSystem extends System<BodyComponent | ColliderComponent> {
  readonly types = ["ex.body", "ex.collider"] as const;
  systemType: SystemType = SystemType.Update;

  public worker: Worker;
  constructor(worker: Worker) {
    super();
    this.worker = worker;
  }

  update(entities: Entity[], delta: number): void {
    const bodyMessages: BodyMessage[] = [];
    for (let entity of entities) {
      const body = entity.get(BodyComponent);
      bodyMessages.push(serializeToBodyMessage(body));
    }

    this.worker.postMessage({
      type: 'step',
      bodies: bodyMessages,
      elapsed: delta
    } as StepMessage);
  }
}