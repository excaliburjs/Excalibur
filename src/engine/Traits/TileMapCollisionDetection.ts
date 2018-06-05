import { IActorTrait } from '../Interfaces/IActorTrait';
import { Actor, CollisionType } from '../Actor';
import { Engine } from '../Engine';
import { Vector } from '../Algebra';
import { Side } from '../Collision/Side';
import { PreCollisionEvent, PostCollisionEvent } from '../Events';

export class TileMapCollisionDetection implements IActorTrait {
  public update(actor: Actor, engine: Engine) {
    var eventDispatcher = actor.eventDispatcher;
    if (actor.collisionType !== CollisionType.PreventCollision && engine.currentScene && engine.currentScene.tileMaps) {
      for (var j = 0; j < engine.currentScene.tileMaps.length; j++) {
        var map = engine.currentScene.tileMaps[j];
        var intersectMap: Vector;
        var side = Side.None;
        var max = 2;
        while ((intersectMap = map.collides(actor))) {
          if (max-- < 0) {
            break;
          }
          side = actor.getSideFromIntersect(intersectMap);
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
