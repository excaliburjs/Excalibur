import { Actor } from '../Actor';
import { UIActor } from '../UIActor';
import { Label } from '../Label';
import { Trigger } from '../Trigger';

export function isVanillaActor(actor: Actor) {
   return !(actor instanceof UIActor) &&
          !(actor instanceof Trigger) &&
          !(actor instanceof Label);
}

export function isUIActor(actor: Actor) {
   return actor instanceof UIActor;
}