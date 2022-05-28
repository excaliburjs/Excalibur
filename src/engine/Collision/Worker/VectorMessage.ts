import { vec, Vector } from "../../Math/vector";

export interface VectorMessage {
  x: number;
  y: number;
}

export const serializeToVectorMessage = (vector: Vector): VectorMessage => {
  return {x: vector.x, y: vector.y};
}

export const messageToVector = (message: VectorMessage): Vector => {
  return vec(message.x, message.y);
}

