import type { Vector } from './Math/vector';
import type { CollisionEndEvent, CollisionStartEvent } from './Events';
import { ExitTriggerEvent, EnterTriggerEvent } from './Events';
import { CollisionType } from './Collision/CollisionType';
import type { Entity } from './EntityComponentSystem';
import type { ActorArgs, ActorEvents } from './Actor';
import { Actor } from './Actor';
import { EventEmitter } from './EventEmitter';

export interface TriggerEvents extends ActorEvents {
  exit: ExitTriggerEvent;
  enter: EnterTriggerEvent;
}

export const TriggerEvents = {
  ExitTrigger: 'exit',
  EnterTrigger: 'enter'
};

/**
 * TriggerOptions
 */
export interface TriggerOptions {
  // position of the trigger
  pos?: Vector;
  // width of the trigger
  width?: number;
  // height of the trigger
  height?: number;
  // whether the trigger is visible or not
  visible?: boolean;
  // action to take when triggered
  action?: (entity: Entity) => void;
  // if specified the trigger will only fire on a specific entity and overrides any filter
  target?: Entity;
  // Returns true if the triggers should fire on the collided entity
  filter?: (entity: Entity) => boolean;
  // -1 if it should repeat forever
  repeat?: number;
}

/**
 * Triggers are a method of firing arbitrary code on collision. These are useful
 * as 'buttons', 'switches', or to trigger effects in a game. By default triggers
 * are invisible, and can only be seen when {@apilink Trigger.visible} is set to `true`.
 */
export class Trigger extends Actor {
  public events = new EventEmitter<TriggerEvents & ActorEvents>();
  public target?: Entity;
  /**
   * Action to fire when triggered by collision
   */
  public action: (entity: Entity) => void;
  /**
   * Filter to add additional granularity to action dispatch, if a filter is specified the action will only fire when
   * filter return true for the collided entity.
   */
  public filter: (entity: Entity) => boolean;
  /**
   * Number of times to repeat before killing the trigger,
   */
  public repeat: number;

  /**
   * @param options Trigger options
   */
  constructor(options: TriggerOptions & ActorArgs) {
    super({ ...options });

    this.filter = options.filter ?? (() => true);
    this.repeat = options.repeat ?? -1;
    this.action = options.action ?? (() => undefined);
    this.target = options.target;

    this.graphics.isVisible = options.visible ?? false;
    this.body.collisionType = CollisionType.Passive;

    this.events.on('collisionstart', ({ other: collider }: CollisionStartEvent) => {
      if (!this._matchesTarget(collider.owner)) {
        return;
      }

      this.events.emit('enter', new EnterTriggerEvent(this, collider.owner));
      this._dispatchAction(collider.owner);
      // remove trigger if its done, -1 repeat forever
      if (this.repeat === 0) {
        this.kill();
      }
    });

    this.events.on('collisionend', ({ other: collider }: CollisionEndEvent) => {
      if (this._matchesTarget(collider.owner)) {
        this.events.emit('exit', new ExitTriggerEvent(this, collider.owner));
      }
    });
  }

  private _matchesTarget(entity: Entity): boolean {
    return this.filter(entity) && (this.target === undefined || this.target === entity);
  }

  private _dispatchAction(target: Entity) {
    if (this.repeat !== 0) {
      this.action.call(this, target);
      this.repeat--;
    }
  }
}
