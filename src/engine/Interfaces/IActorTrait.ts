import { Actor } from '../Actor';
import { Engine } from '../Engine';

/**
 * An interface describing actor update pipeline traits
 */
export interface IActorTrait {
   update(actor: Actor, engine: Engine, delta: number): void;
}