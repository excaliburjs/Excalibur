import { ColliderComponent } from "../ColliderComponent";
import { PolygonCollider } from "../Colliders/PolygonCollider";
import { messageToVector, VectorMessage } from "./VectorMessage";

export interface ColliderMessage {
  id: number;
  type: 'collider';
  shape: 'polygon' | 'circle' | 'line';
  bodyId: number;
  points: VectorMessage[];
}

export const syncMessageToCollider = (message: ColliderMessage, colliderComponent: ColliderComponent) => {
  const collider = colliderComponent.get();
  if (collider) {
    collider.id.value = message.id;
    if (collider instanceof PolygonCollider) {
      collider.points = message.points.map(messageToVector);
    }
  }
}
