import { Actor } from '../Actor';

/**
 * Used for implementing actions for the [[ActionContext|Action API]].
 */
export interface Action {
  update(delta: number): void;
  isComplete(actor: Actor): boolean;
  reset(): void;
  stop(): void;
}
