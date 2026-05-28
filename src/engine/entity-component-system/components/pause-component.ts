import { Component } from '../component';

export interface PauseComponentInterface {
  canPause: boolean;
}

export const PauseComponentTag = 'ex.paused' as const;
export class PauseComponent extends Component {
  // @ts-ignore
  private static _NAME = 'PauseComponent';
  paused: boolean = false;
  canPause: boolean = true;

  constructor(config: Partial<PauseComponentInterface> = {}) {
    super();
    this.canPause = config.canPause ?? false;
  }
}
