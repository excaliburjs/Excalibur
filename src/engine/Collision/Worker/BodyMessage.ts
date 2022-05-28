import { BodyComponent } from "../BodyComponent";
import { messageToVector, serializeToVectorMessage, VectorMessage } from "./VectorMessage";

export interface BodyMessage {
  id: number;
  type: "body";

  pos: VectorMessage;
  vel: VectorMessage;
  acc: VectorMessage;

  rotation: number;
  angularVelocity: number;
}


export const serializeToBodyMessage = (body: BodyComponent): BodyMessage => {
  return {
    id: body.id.value,
    type: "body",
    pos: serializeToVectorMessage(body.pos),
    vel: serializeToVectorMessage(body.vel),
    acc: serializeToVectorMessage(body.acc),

    rotation: body.rotation,
    angularVelocity: body.angularVelocity
  }
}

export const syncMessageToBody = (message: BodyMessage, body: BodyComponent) => {
  body.id.value = message.id;
  body.pos = messageToVector(message.pos);
  body.vel = messageToVector(message.vel);
  body.acc = messageToVector(message.acc);

  body.rotation = body.rotation;
  body.angularVelocity = body.angularVelocity;
}