import { BodyMessage } from "./BodyMessage";
import { ColliderMessage } from "./ColliderMessage";
import { StartMessage } from "./StartMessage";
import { StepFlattened, StepMessage } from "./StepMessage";

export interface Message {
  type: string;
}

export type WorkerMessages =
  StartMessage |
  StepMessage |
  StepFlattened |
  ColliderMessage |
  BodyMessage;