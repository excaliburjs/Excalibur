import type { SceneEvents } from '../../scene';
import { Component } from '../component';
import type { EventEmitter } from '../../event-emitter';

export interface PauseComponentInterface {
  canPause: boolean;
}

export class PauseComponent extends Component {
  paused: boolean = false;
  canPause: boolean = true;
  sceneEventEmitter: EventEmitter<SceneEvents> | null = null;

  constructor(config: Partial<PauseComponentInterface> = {}) {
    super();
  }
}
