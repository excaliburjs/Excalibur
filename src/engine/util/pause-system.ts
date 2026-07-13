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

  update(): void {
    let pauseComponent: PauseComponent;
    for (let i = 0; i < this.query.entities.length; i++) {
      const pauseEntity = this.query.entities[i];
      pauseComponent = pauseEntity.get(PauseComponent);
      const paused = this.isPaused && pauseComponent.canPause;
      if (!this.wasPaused && paused) {
        // only add on the first pause
        pauseComponent.paused = paused;
        pauseEntity.addTag(PauseComponentTag);
      } else if (this.wasPaused && !this.isPaused) {
        // only remove on the first unpause
        pauseEntity.removeTag(PauseComponentTag);
      }
    }

    this.wasPaused ||= this.isPaused;
  }
}
