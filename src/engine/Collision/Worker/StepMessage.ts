import { BodyMessage } from "./BodyMessage";

export interface StepMessage {
  type: 'step',
  bodies: BodyMessage[];
  elapsed: number;
}

export interface StepFlattened {
  type: 'step-flattened',
  bodies: Float64Array;
  elapsed: number;
}