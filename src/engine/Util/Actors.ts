import { Actor } from '../Actor';
import { ScreenElement } from '../ScreenElement';
import { Label } from '../Label';
import { Trigger } from '../Trigger';

export function isVanillaActor(actor: Actor) {
  return !(actor instanceof ScreenElement) && !(actor instanceof Trigger) && !(actor instanceof Label);
}

export function isScreenElement(actor: Actor) {
  return actor instanceof ScreenElement;
}
