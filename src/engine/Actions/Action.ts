import { Entity } from '../EntityComponentSystem/Entity';

/**
 * Used for implementing actions for the {@apilink ActionContext | `Action API`}.
 */
export interface Action {
  id: number;
  update(elapsed: number): void;
  isComplete(entity: Entity): boolean;
  reset(): void;
  stop(): void;
}

let _ACTION_ID = 0;
/**
 *
 */
export function nextActionId(): number {
  return _ACTION_ID++;
}
