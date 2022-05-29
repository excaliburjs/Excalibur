import { BodyComponent } from "../BodyComponent";
import { messageToVector, serializeToVectorMessage, VectorMessage } from "./VectorMessage";

export interface BodyMessage {
  id: number;
  type: "body";

  // pos: VectorMessage;
  vel: VectorMessage;
  acc: VectorMessage;
  data: Float32Array;

  // rotation: number;
  angularVelocity: number;
}


export const serializeToBodyMessage = (body: BodyComponent): BodyMessage => {
  return {
    id: body.id.value,
    type: "body",
    // pos: serializeToVectorMessage(body.pos),
    vel: serializeToVectorMessage(body.vel),
    acc: serializeToVectorMessage(body.acc),
    data: body.matrix.data,
    // rotation: body.rotation,
    angularVelocity: body.angularVelocity
  }
}

// export const syncMatrixDataToBody = (data: Float32Array, body: BodyComponent)

export const syncMessageToBody = (message: BodyMessage, body: BodyComponent) => {
  body.id.value = message.id;
  body.matrix.data = message.data;
  // body.pos = messageToVector(message.pos);
  body.vel = messageToVector(message.vel);
  body.acc = messageToVector(message.acc);
  // body.rotation = message.rotation;
  body.angularVelocity = message.angularVelocity;
}