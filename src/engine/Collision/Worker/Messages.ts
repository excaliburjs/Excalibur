import { BodyMessage } from "./BodyMessage";
import { ColliderMessage } from "./ColliderMessage";
import { StartMessage } from "./StartMessage";
import { StepMessage } from "./StepMessage";

export interface Message {
  type: string;
}

export type WorkerMessages =
  StartMessage |
  StepMessage |
  ColliderMessage |
  BodyMessage;