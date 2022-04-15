import { Engine } from './Engine';
import { EventDispatcher } from './EventDispatcher';
import { Vector } from './Math/vector';
import { ExitTriggerEvent, EnterTriggerEvent, CollisionEndEvent, CollisionStartEvent } from './Events';
import { CollisionType } from './Collision/CollisionType';
import { Entity } from './EntityComponentSystem';
import { Actor } from './Actor';

/**
 * ITriggerOptions
 */
export interface TriggerOptions {
  // position of the trigger
  pos: Vector;
  // width of the trigger
  width: number;
  // height of the trigger
  height: number;
  // whether the trigger is visible or not
  visible: boolean;
  // action to take when triggered
  action: () => void;
  // if specified the trigger will only fire on a specific actor and overrides any filter
  target: Entity;
  // Returns true if the triggers should fire on the collided actor
  filter: (actor: Entity) => boolean;
  // -1 if it should repeat forever
  repeat: number;
}

const triggerDefaults: Partial<TriggerOptions> = {
  pos: Vector.Zero,
  width: 10,
  height: 10,
  visible: false,
  action: () => {
    return;
  },
  filter: () => true,
  repeat: -1
};

/**
 * Triggers are a method of firing arbitrary code on collision. These are useful
 * as 'buttons', 'switches', or to trigger effects in a game. By default triggers
 * are invisible, and can only be seen when [[Trigger.visible]] is set to `true`.
 */
export class Trigger extends Actor {
  private _target: Entity;
  /**
   * Action to fire when triggered by collision
   */
  public action: () => void = () => {
    return;
  };
  /**
   * Filter to add additional granularity to action dispatch, if a filter is specified the action will only fire when
   * filter return true for the collided actor.
   */
  public filter: (actor: Entity) => boolean = () => true;
  /**
   * Number of times to repeat before killing the trigger,
   */
  public repeat: number = -1;

  /**
   *
   * @param opts Trigger options
   */
  constructor(opts: Partial<TriggerOptions>) {
    super({ x: opts.pos.x, y: opts.pos.y, width: opts.width, height: opts.height });
    opts = {
      ...triggerDefaults,
      ...opts
    };

    this.filter = opts.filter || this.filter;
    this.repeat = opts.repeat || this.repeat;
    this.action = opts.action || this.action;
    if (opts.target) {
      this.target = opts.target;
    }

    this.graphics.visible = opts.visible;
    this.body.collisionType = CollisionType.Passive;
    this.eventDispatcher = new EventDispatcher();

    this.events.on('collisionstart', (evt: CollisionStartEvent<Actor>) => {
      if (this.filter(evt.other)) {
        this.emit('enter', new EnterTriggerEvent(this, evt.other));
        this._dispatchAction();
        // remove trigger if its done, -1 repeat forever
        if (this.repeat === 0) {
          this.kill();
        }
      }
    });

    this.events.on('collisionend', (evt: CollisionEndEvent<Actor>) => {
      if (this.filter(evt.other)) {
        this.emit('exit', new ExitTriggerEvent(this, evt.other));
      }
    });
  }

  public set target(target: Entity) {
    this._target = target;
    this.filter = (actor: Entity) => actor === target;
  }

  public get target() {
    return this._target;
  }

  public _initialize(engine: Engine) {
    super._initialize(engine);
  }

  private _dispatchAction() {
    if (this.repeat !== 0) {
      this.action.call(this);
      this.repeat--;
    }
  }
}
