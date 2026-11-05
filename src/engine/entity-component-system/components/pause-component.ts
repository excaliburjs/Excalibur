import { Component } from '../component';

export interface PauseComponentOptions {
  /**
   * Whether the entity is paused when its scene is paused, default `true`
   */
  canPause: boolean;
}

/**
 * Tag added to entities while they are paused, systems exclude paused entities by querying `{ not: [PauseComponentTag] }`
 */
export const PauseComponentTag = 'ex.paused' as const;

/**
 * Marks an entity as pausable and tracks whether it is currently paused.
 *
 * When a scene is paused the `PauseSystem` adds the {@apilink PauseComponentTag} to every entity with `canPause: true`,
 * and the systems that skip that tag (motion, collision, actions, ...) stop updating it.
 *
 * Most code should use {@apilink Actor.canPause} and {@apilink Actor.isPaused} instead of using this component directly.
 */
export class PauseComponent extends Component {
  // @ts-ignore
  private static _NAME = 'PauseComponent';

  /**
   * @internal Written by the `PauseSystem`
   */
  public _isPaused: boolean = false;

  /**
   * True while the owning scene is paused and this entity can be paused. Managed by the engine, read-only.
   */
  public get isPaused(): boolean {
    return this._isPaused;
  }

  /**
   * Set to `false` to keep updating this entity while the scene is paused (for example menus or a HUD), default `true`
   */
  public canPause: boolean = true;

  constructor(options: Partial<PauseComponentOptions> = {}) {
    super();
    this.canPause = options.canPause ?? this.canPause;
  }
}
