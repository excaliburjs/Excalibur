import { Trait } from '../Interfaces/Trait';
import { Actor } from '../Actor';
import { Engine } from '../Engine';

/**
 * Revises pointer events path accordingly to the actor
 * @deprecated Will be removed in 0.26.0
 */
export class CapturePointer implements Trait {
  public update(actor: Actor, engine: Engine) {
    if (!actor.enableCapturePointer) {
      return;
    }
    if (actor.isKilled()) {
      return;
    }

    engine.input.pointers.checkAndUpdateActorUnderPointer(actor);
  }
}
