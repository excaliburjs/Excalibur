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
let bodiesFlattened: Float64Array;
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
    case 'step-flattened': {
      bodiesFlattened = e.data.bodies;
      const elapsedMs = e.data.elapsed;
      // integrate position
      for (let i = 0; i < bodiesFlattened.length; i += 13) {
        // let posx = bodiesFlattened[i+posXOffset];
        // let posy = bodiesFlattened[i+posYOffset];
        // let rotation = bodiesFlattened[i+rotationOffset];
        // let scalex = bodiesFlattened[i+scaleXOffset];
        // let scaley = bodiesFlattened[i+scaleYOffset];
        let velx = bodiesFlattened[i+velXOffset];
        let vely = bodiesFlattened[i+velYOffset];
        let accx = bodiesFlattened[i+accXOffset];
        let accy = bodiesFlattened[i+accYOffset];
        let angularVelocity = bodiesFlattened[i+angularVelocityOffset];
        let scaleFactorx = bodiesFlattened[i+scaleFactorXOffset];
        let scaleFactory = bodiesFlattened[i+scaleFactorYOffset];

        const seconds = elapsedMs / 1000;

        // motion.vel.addEqual(totalAcc.scale(seconds));
        bodiesFlattened[i+velXOffset] += accx * seconds;
        bodiesFlattened[i+velYOffset] += accy * seconds;

        // transform.pos.addEqual(motion.vel.scale(seconds)).addEqual(totalAcc.scale(0.5 * seconds * seconds));
        bodiesFlattened[i+posXOffset] += velx * seconds + accx * .5 * seconds * seconds;
        bodiesFlattened[i+posYOffset] += vely * seconds + accy * .5 * seconds * seconds;

        // motion.angularVelocity += motion.torque * (1.0 / motion.inertia) * seconds;
        // TODO torque

        // transform.rotation += motion.angularVelocity * seconds;
        bodiesFlattened[i+rotationOffset] += angularVelocity * seconds;

        // transform.scale.addEqual(motion.scaleFactor.scale(seconds));
        bodiesFlattened[i+scaleXOffset] += scaleFactorx * seconds;
        bodiesFlattened[i+scaleYOffset] += scaleFactory * seconds;
      }
      postMessage(bodiesFlattened);
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