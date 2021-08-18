import { CullingBox } from './../Util/CullingBox';
import { Trait } from '../Interfaces/Trait';
import { Actor } from '../Actor';
import { Engine } from '../Engine';
import { ExitViewPortEvent, EnterViewPortEvent } from '../Events';
import { TagComponent } from '../EntityComponentSystem';

export class OffscreenCulling implements Trait {
  public cullingBox: CullingBox = new CullingBox();

  public update(actor: Actor, engine: Engine) {
    const events = actor.eventDispatcher;

    let isSpriteOffScreen = true;
    if (actor.currentDrawing != null) {
      isSpriteOffScreen = this.cullingBox.isSpriteOffScreen(actor, engine);
    }

    let actorBoundsOffscreen = false;
    if (engine && engine.currentScene && engine.currentScene.camera && engine.currentScene.camera.viewport && !actor.parent) {
      actorBoundsOffscreen = !engine.currentScene.camera.viewport.intersect(actor.collider.bounds);
    }

    if (!actor.isOffScreen) {
      if (actorBoundsOffscreen && isSpriteOffScreen) {
        events.emit('exitviewport', new ExitViewPortEvent(actor));
        actor.addComponent(new TagComponent('offscreen'));
      }
    } else {
      if (!actorBoundsOffscreen || !isSpriteOffScreen) {
        events.emit('enterviewport', new EnterViewPortEvent(actor));
        actor.removeComponent('offscreen');
      }
    }
  }
}
