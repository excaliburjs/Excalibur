import { Actor } from '../Actor';
import { Engine } from '../Engine';

/**
 * An interface describing actor update pipeline traits
 * @deprecated
 */
export interface Trait {
  update(actor: Actor, engine: Engine, delta: number): void;
}
