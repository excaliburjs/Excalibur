import { Component } from '../component';

export interface PauseComponentInterface {
  canPause: boolean;
}

export class PauseComponent extends Component {
  paused: boolean = false;
  canPause: boolean = true;

  constructor(config: Partial<PauseComponentInterface> = {}) {
    super();
    this.canPause = config.canPause ?? false;
  }
}
