import { Trait } from '../Interfaces/Trait';
import { Actor } from '../Actor';
import { Engine } from '../Engine';
import { Vector } from '../Algebra';
import { Side } from '../Collision/Side';
import { PreCollisionEvent, PostCollisionEvent } from '../Events';
import { CollisionType } from '../Collision/CollisionType';
import { BoundingBox } from '../Collision/Index';

export class ChunkSystemTileMapCollisionDetection implements Trait {
  public update(actor: Actor, engine: Engine) {
    const eventDispatcher = actor.eventDispatcher;
    if (actor.body.collider.type !== CollisionType.PreventCollision && engine.currentScene && engine.currentScene.chunkSystems) {
      for (let j = 0; j < engine.currentScene.chunkSystems.length; j++) {
        const chunkSystem = engine.currentScene.chunkSystems[j];
        let intersectChunkSystem: Vector;
        let side = Side.None;
        let max = 2;
        while ((intersectChunkSystem = chunkSystem.collides(actor))) {
          if (max-- < 0) {
            break;
          }
          side = BoundingBox.getSideFromIntersection(intersectChunkSystem);
          eventDispatcher.emit('precollision', new PreCollisionEvent(actor, null, side, intersectChunkSystem));
          if (actor.body.collider.type === CollisionType.Active) {
            actor.pos.y += intersectChunkSystem.y;
            actor.pos.x += intersectChunkSystem.x;
            eventDispatcher.emit('postcollision', new PostCollisionEvent(actor, null, side, intersectChunkSystem));
          }
        }
      }
    }
  }
}
