import { Actor } from '../Actor';
import { ScreenElement } from '../ScreenElement';
import { Label } from '../Label';
import { Trigger } from '../Trigger';

/**
 * Type guard to detect if something is an actor
 * @deprecated
 * @param actor
 */
export function isVanillaActor(actor: Actor) {
  return !(actor instanceof ScreenElement) && !(actor instanceof Trigger) && !(actor instanceof Label);
}

/**
 * Type guard to detect a screen element
 * TODO: Move to screen element
 */
export function isScreenElement(actor: Actor) {
  return actor instanceof ScreenElement;
}
