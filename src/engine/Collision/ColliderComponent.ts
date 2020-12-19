import { TransformComponent } from "../EntityComponentSystem";
import { Component } from "../EntityComponentSystem/Component";
import { MotionComponent } from "../EntityComponentSystem/Components/MotionComponent";

export class ColliderComponent extends Component<'collider'> {
  public readonly type = 'collider';
  dependencies = [TransformComponent, MotionComponent];

  // TODO collider(s) for interesting shapes?
  // TODO body?

}