import { Trait } from '../Interfaces/Trait';
import { Actor } from '../Actor';
import { Engine } from '../Engine';
import { Vector } from '../Algebra';
import { Side } from '../Collision/Side';
import { PreCollisionEvent, PostCollisionEvent } from '../Events';
import { CollisionType } from '../Collision/CollisionType';
import { BoundingBox } from '../Collision/Index';

export class TileMapCollisionDetection implements Trait {
  public update(actor: Actor, engine: Engine) {
    const eventDispatcher = actor.eventDispatcher;
    if (actor.collisionType !== CollisionType.PreventCollision && engine.currentScene && engine.currentScene.tileMaps) {
      for (let j = 0; j < engine.currentScene.tileMaps.length; j++) {
        const map = engine.currentScene.tileMaps[j];
        let intersectMap: Vector;
        let side = Side.None;
        let max = 2;
        while ((intersectMap = map.collides(actor))) {
          if (max-- < 0) {
            break;
          }
          side = BoundingBox.getSideFromIntersection(intersectMap);
          eventDispatcher.emit('precollision', new PreCollisionEvent(actor, null, side, intersectMap));
          if (actor.collisionType === CollisionType.Active) {
            actor.pos.y += intersectMap.y;
            actor.pos.x += intersectMap.x;
            eventDispatcher.emit('postcollision', new PostCollisionEvent(actor, null, side, intersectMap));
          }
        }
      }
    }
  }
}
