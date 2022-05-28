import { Entity } from "../../EntityComponentSystem/Entity";
import { BodyComponent } from "../BodyComponent";
import { ColliderComponent } from "../ColliderComponent";
import { PolygonCollider } from "../Colliders/PolygonCollider";
import { CollisionSystem } from "../CollisionSystem";
import { MotionSystem } from "../MotionSystem";
import { BodyMessage, serializeToBodyMessage, syncMessageToBody } from "./BodyMessage";
import { syncMessageToCollider } from "./ColliderMessage";
import { WorkerMessages } from "./Messages";
import { messageToVector } from "./VectorMessage";

const entitiesMap = new Map<number, Entity>();
const colliderMap = new Map<number, ColliderComponent>();
const bodyMap = new Map<number, BodyComponent>();

onmessage = (e: MessageEvent<WorkerMessages>) => {
  switch(e.data.type) {
    case 'start': {
      // start(e.data.fps);
      break;
    }
    case 'step': {
      for (let bodyMessage of e.data.bodies) {
        const body = bodyMap.get(bodyMessage.id);
        if (body) {
          syncMessageToBody(bodyMessage, body);
        }
      }
      runPhysicsStep(e.data.elapsed);
      break;
    }
    case 'body': {
      const message = e.data;
      const body = new BodyComponent();
      const proxyEntity = new Entity();
      proxyEntity.addComponent(body);
      entitiesMap.set(message.id, proxyEntity);
      bodyMap.set(message.id, body);
      syncMessageToBody(message, body);
      break;
    }
    case 'collider': {
      const message = e.data;
      const collider = new ColliderComponent(
        new PolygonCollider({ points: message.points.map(messageToVector)})
      )
      colliderMap.set(message.id, collider);
      syncMessageToCollider(message, collider);
      break;
    }
    default: {
      console.log("Unknown message", e.data);
    }
  }
}

const motion = new MotionSystem();
const collision = new CollisionSystem();
const runPhysicsStep = (elapsedMs: number) => {
  const entities = Array.from(entitiesMap.values());

  // integrate
  motion.update(entities, elapsedMs);

  // physics
  collision.update(entities, elapsedMs);

  // Sync back
  const bodies: BodyMessage[] = [];
  for (let entity of entities) {
    const body = entity.get(BodyComponent);
    bodies.push(serializeToBodyMessage(body));
  }
  postMessage(bodies);
}

// const start = (fps: number) => {
//   setInterval(() => {
//     runPhysicsStep(1000/fps);
//   }, 1000/fps)
// }