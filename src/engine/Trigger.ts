import { Color } from './Drawing/Color';
import { Engine } from './Engine';
import { ActionQueue } from './Actions/Action';
import { EventDispatcher } from './EventDispatcher';
import { Actor, isActor } from './Actor';
import { Vector } from './Algebra';
import { ExitTriggerEvent, EnterTriggerEvent, CollisionEndEvent, CollisionStartEvent } from './Events';
import * as Util from './Util/Util';
import { CollisionType } from './Collision/CollisionType';

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
  target: Actor;
  // Returns true if the triggers should fire on the collided actor
  filter: (actor: Actor) => boolean;
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
  private _target: Actor;
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
  public filter: (actor: Actor) => boolean = () => true;
  /**
   * Number of times to repeat before killing the trigger,
   */
  public repeat: number = -1;

  /**
   *
   * @param opts Trigger options
   */
  constructor(opts: Partial<TriggerOptions>) {
    super(opts.pos.x, opts.pos.y, opts.width, opts.height);
    opts = Util.extend({}, triggerDefaults, opts);

    this.filter = opts.filter || this.filter;
    this.repeat = opts.repeat || this.repeat;
    this.action = opts.action || this.action;
    if (opts.target) {
      this.target = opts.target;
    }

    this.visible = opts.visible;
    this.body.collider.type = CollisionType.Passive;
    this.eventDispatcher = new EventDispatcher(this);
    this.actionQueue = new ActionQueue(this);

    this.on('collisionstart', (evt: CollisionStartEvent<Actor>) => {
      if (isActor(evt.other) && this.filter(evt.other)) {
        this.emit('enter', new EnterTriggerEvent(this, evt.other));
        this._dispatchAction();
        // remove trigger if its done, -1 repeat forever
        if (this.repeat === 0) {
          this.kill();
        }
      }
    });

    this.on('collisionend', (evt: CollisionEndEvent<Actor>) => {
      if (isActor(evt.other) && this.filter(evt.other)) {
        this.emit('exit', new ExitTriggerEvent(this, evt.other));
      }
    });
  }

  public set target(target: Actor) {
    this._target = target;
    this.filter = (actor: Actor) => actor === target;
  }

  public get target() {
    return this._target;
  }

  public _initialize(engine: Engine) {
    super._initialize(engine);
  }

  private _dispatchAction() {
    this.action.call(this);
    this.repeat--;
  }

  /* istanbul ignore next */
  public debugDraw(ctx: CanvasRenderingContext2D) {
    super.debugDraw(ctx);
    // Meant to draw debug information about actors
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);

    const bb = this.body.collider.bounds;
    const wp = this.getWorldPos();
    bb.left = bb.left - wp.x;
    bb.right = bb.right - wp.x;
    bb.top = bb.top - wp.y;
    bb.bottom = bb.bottom - wp.y;

    // Currently collision primitives cannot rotate
    // ctx.rotate(this.rotation);
    ctx.fillStyle = Color.Violet.toString();
    ctx.strokeStyle = Color.Violet.toString();
    ctx.fillText('Trigger', 10, 10);
    bb.debugDraw(ctx);

    ctx.restore();
  }
}
