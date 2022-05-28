import { BodyMessage } from "./BodyMessage";

export interface StepMessage {
  type: 'step',
  bodies: BodyMessage[];
  elapsed: number;
}