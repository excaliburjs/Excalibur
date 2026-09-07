import type { EventEmitter, Scene, SceneEvents } from '..';
import type { Query } from '../entity-component-system';
import { System, SystemPriority, SystemType } from '../entity-component-system';
import { PauseComponent, PauseComponentTag } from '../entity-component-system/components/pause-component';

export class PauseSystem extends System {
  static priority = SystemPriority.Highest;

  systemType: SystemType = SystemType.Update;
  query: Query<typeof PauseComponent>;
  sceneEventEmitter: EventEmitter<SceneEvents>;
  isPaused = false;
  wasPaused = false;

  constructor(scene: Scene) {
    super();
    this.query = scene.world.query([PauseComponent]);
    this.sceneEventEmitter = scene.events;

    this.sceneEventEmitter.on('pause', () => {
      this.isPaused = true;
    });
    this.sceneEventEmitter.on('resume', () => {
      this.isPaused = false;
    });
  }

  /**
   * Number of entities currently carrying the paused tag, lets the common "nothing is paused" frame skip the scan
   */
  private _pausedCount = 0;

  update(): void {
    // Every actor has a PauseComponent, so this scan is O(entities) every frame. When the scene isn't paused, wasn't
    // paused last frame and no entity is still tagged paused there is nothing to do.
    if (!this.isPaused && !this.wasPaused && this._pausedCount === 0) {
      return;
    }
    let pauseComponent: PauseComponent;
    for (let i = 0; i < this.query.entities.length; i++) {
      const pauseEntity = this.query.entities[i];
      pauseComponent = pauseEntity.get(PauseComponent);
      const paused = this.isPaused && pauseComponent.canPause;
      if (!this.wasPaused && paused) {
        // only add on the first pause
        if (!pauseComponent.paused) {
          this._pausedCount++;
        }
        pauseComponent.paused = true;
        pauseEntity.addTag(PauseComponentTag);
      } else if ((this.wasPaused && !this.isPaused) || (pauseComponent.paused && !pauseComponent.canPause)) {
        // only remove on the first unpause
        if (pauseComponent.paused) {
          this._pausedCount--;
        }
        pauseComponent.paused = false;
        pauseEntity.removeTag(PauseComponentTag);
      }
    }
    if (this._pausedCount < 0) {
      this._pausedCount = 0;
    }

    this.wasPaused = this.isPaused;
  }
}
