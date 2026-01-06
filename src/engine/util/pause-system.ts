import type { EventEmitter, Scene, SceneEvents } from '..';
import type { Query } from '../entity-component-system';
import { System, SystemType } from '../entity-component-system';
import { PauseComponent } from '../entity-component-system/components/pause-component';

export class PauseSystem extends System {
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
      if (pauseComponent.canPause === false) {
        pauseComponent.paused = false;
      } else {
        pauseComponent.paused = this.isPaused;
      }
    }
  }
}
