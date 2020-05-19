import { CellMapCollisionDetection } from './CellMapCollisionDetection';
import { Trait } from '../Interfaces/Trait';
import { obsolete } from '../Util/Decorators';

/**
 * @obsolete TileMapCollisionDetection will be removed in favor of 'Traits.CellMapCollisionDetection' in version 0.26.0
 */
@obsolete({ message: 'will be removed in favour of `Traits.CellMapCollisionDetection` in version 0.26.0' })
export class TileMapCollisionDetection extends CellMapCollisionDetection implements Trait {
  constructor() {
    super((engine) => engine.currentScene && engine.currentScene.tileMaps);
  }
}
