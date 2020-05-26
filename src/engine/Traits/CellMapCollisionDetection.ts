import { Actor } from '../Actor';
import { Vector } from '../Algebra';
import { Engine } from '../Engine';
import { PreCollisionEvent, PostCollisionEvent } from '../Events';
import { CollisionType } from '../Collision/CollisionType';
import { BoundingBox } from '../Collision/Index';
import { Side } from '../Collision/Side';
import { ChunkSystemTileMap } from '../ChunkSystemTileMap';
import { Trait } from '../Interfaces/Trait';
import { TileMap } from '../TileMap';

type SceneCellMapsGetter = (engine: Engine) => null | ChunkSystemTileMap[] | TileMap[];

/**
 * The [[CellMapCollisionDetection]] trait is used for handling actor collisions with [[TileMap|TileMaps]] and
 * [[ChunkSystemTileMap|ChunkSystemTileMaps]].
 */
export class CellMapCollisionDetection implements Trait {
  constructor(private readonly mapsGetter: SceneCellMapsGetter) {}

  /**
   * Updates the providing actor based on its current collisions with the [[TileMap|TileMaps]] or [[ChunkSystemTileMap|ChunkSystemTileMaps]]
   * in the engine's current scene (depending on the current configuration of this trait instance).
   *
   * @param actor The actor that is being updated by the engine right now.
   * @param engine The engine instance that contains the actor in its current scene.
   */
  public update(actor: Actor, engine: Engine): void {
    const eventDispatcher = actor.eventDispatcher;
    const cellMaps = this.mapsGetter(engine);
    if (actor.body.collider.type !== CollisionType.PreventCollision && cellMaps) {
      for (let j = 0; j < cellMaps.length; j++) {
        const cellMap = cellMaps[j];
        let intersectCellMap: Vector;
        let side = Side.None;
        let max = 2;
        while ((intersectCellMap = this.collides(actor, cellMap))) {
          if (max-- < 0) {
            break;
          }
          side = BoundingBox.getSideFromIntersection(intersectCellMap);
          eventDispatcher.emit('precollision', new PreCollisionEvent(actor, null, side, intersectCellMap));
          if (actor.body.collider.type === CollisionType.Active) {
            actor.pos.y += intersectCellMap.y;
            actor.pos.x += intersectCellMap.x;
            eventDispatcher.emit('postcollision', new PostCollisionEvent(actor, null, side, intersectCellMap));
          }
        }
      }
    }
  }

  /**
   * Checks whether the provided actor collided with the provided [[TileMap]] or [[ChunkSystemTileMap]]. The method checks whether the
   * actor's bounding box intersects any of the cell map's [[Cell.solid|solid]] [[Cell|Cells]]. The method calculates the smalles overlap if
   * multiple collisions are found. The method returns `null` if no collision is found.
   *
   * @param actor The actor to check for collisions with a cell map.
   * @param cellMap The cell map the actor may or may not collide with.
   * @return A vector that represents the smallest position change the actor has to make to resolve the found collision.
   */
  public collides(actor: Actor, cellMap: ChunkSystemTileMap | TileMap): Vector | null {
    const horizontalStep = Math.max(Math.min(actor.width / 2, cellMap.cellWidth / 2), 1);
    const verticalStep = Math.max(Math.min(actor.height / 2, cellMap.cellHeight / 2), 1);
    const rightBound = actor.pos.x + actor.width;
    const bottomBound = actor.pos.y + actor.height;
    const actorBounds = actor.body.collider.bounds;
    const overlaps: Vector[] = [];
    // trace points for overlap
    for (let x = actorBounds.left; x <= rightBound; x += horizontalStep) {
      for (let y = actorBounds.top; y <= bottomBound; y += verticalStep) {
        const cell = cellMap.getCellByPoint(x, y);
        if (cell && cell.solid) {
          const overlap = actorBounds.intersect(cell.bounds);
          const dir = actor.center.sub(cell.center);
          if (overlap && overlap.dot(dir) > 0) {
            overlaps.push(overlap);
          }
        }
      }
    }
    if (!overlaps.length) {
      return null;
    }
    // Return the smallest change other than zero
    return overlaps.reduce((accum, next) => {
      let x = accum.x;
      let y = accum.y;
      if (Math.abs(accum.x) < Math.abs(next.x)) {
        x = next.x;
      }
      if (Math.abs(accum.y) < Math.abs(next.y)) {
        y = next.y;
      }
      return new Vector(x, y);
    });
  }
}
