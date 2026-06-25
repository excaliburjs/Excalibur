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

  constructor(scene: Scene) {
    super();
    this.query = scene.world.query([PauseComponent]);
    this.sceneEventEmitter = scene.events;

    this.sceneEventEmitter.on('pause', (e) => {
      this.isPaused = true;
    });
    this.sceneEventEmitter.on('resume', (e) => {
      this.isPaused = false;
    });
  }

  update(elapsed: number): void {
    for (const pauseEntity of this.query.entities) {
      const pauseComponent = pauseEntity.get(PauseComponent);
      const paused = this.isPaused && pauseComponent.canPause !== false;

      pauseComponent.paused = paused;

      if (paused) {
        pauseEntity.addTag(PauseComponentTag);
      } else {
        pauseEntity.removeTag(PauseComponentTag);
      }
    }
  }
}
