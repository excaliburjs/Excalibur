import { Entity } from '../EntityComponentSystem/Entity';

/**
 * Used for implementing actions for the [[ActionContext|Action API]].
 */
export interface Action {
  update(delta: number): void;
  isComplete(entity: Entity): boolean;
  reset(): void;
  stop(): void;
}
