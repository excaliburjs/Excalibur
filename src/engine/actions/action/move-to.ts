import { MotionComponent } from '../../entity-component-system/components/motion-component';
import { TransformComponent } from '../../entity-component-system/components/transform-component';
import type { Entity } from '../../entity-component-system/entity';
import type { Easing } from '../../math';
import { clamp, lerp, linear, remap } from '../../math';
import { Vector, vec } from '../../math/vector';
import type { Action } from '../action';
import { nextActionId } from '../action';

export interface MoveToOptions {
  pos: Vector;
  duration: number;
  easing?: Easing;
}

/**
 *
 */
export function isMoveToOptions(x: any): x is MoveToOptions {
  return x.pos instanceof Vector && typeof x.duration === 'number';
}

export class MoveToWithOptions implements Action {
  id = nextActionId();
  private _end: Vector;
  private _durationMs: number;
  private _tx: TransformComponent;
  private _started: boolean = false;
  private _start!: Vector;
  private _currentMs: number;
  private _stopped: boolean = false;
  private _motion: MotionComponent;
  private _easing: Easing = linear;

  constructor(
    public entity: Entity,
    options: MoveToOptions
  ) {
    this._end = options.pos;
    this._easing = options.easing ?? this._easing;
    this._tx = entity.get(TransformComponent);
    this._motion = entity.get(MotionComponent);
    if (!this._tx) {
      throw new Error(`Entity ${entity.name} has no TransformComponent, can only moveTo on Entities with TransformComponents.`);
    }
    this._durationMs = options.duration;
    this._currentMs = this._durationMs;
  }
  update(elapsed: number): void {
    if (!this._started) {
      this._start = this._tx.pos.clone();
      this._started = true;
    }
    this._currentMs -= elapsed;
    const t = clamp(remap(0, this._durationMs, 0, 1, this._durationMs - this._currentMs), 0, 1);
    const currentPos = this._tx.pos;

    const newPosX = lerp(this._start.x, this._end.x, this._easing(t));
    const newPosY = lerp(this._start.y, this._end.y, this._easing(t));

    const seconds = elapsed / 1000;
    const velX = seconds === 0 ? 0 : (newPosX - currentPos.x) / seconds;
    const velY = seconds === 0 ? 0 : (newPosY - currentPos.y) / seconds;
    this._motion.vel.x = velX;
    this._motion.vel.y = velY;

    if (this.isComplete(this.entity)) {
      this._tx.pos = vec(this._end.x, this._end.y);
      this._motion.vel = vec(0, 0);
    }
  }
  public isComplete(entity: Entity): boolean {
    return this._stopped || this._currentMs < 0;
  }

  public stop(): void {
    this._motion.vel = vec(0, 0);
    this._stopped = true;
    this._currentMs = 0;
  }

  public reset(): void {
    this._currentMs = this._durationMs;
    this._started = false;
    this._stopped = false;
  }
}

export class MoveTo implements Action {
  id = nextActionId();
  private _tx: TransformComponent;
  private _motion: MotionComponent;
  public x!: number;
  public y!: number;
  private _start!: Vector;
  private _end: Vector;
  private _dir!: Vector;
  private _speed: number;
  private _distance!: number;
  private _started = false;
  private _stopped = false;
  constructor(
    public entity: Entity,
    destX: number,
    destY: number,
    speed: number
  ) {
    this._tx = entity.get(TransformComponent);
    this._motion = entity.get(MotionComponent);
    this._end = new Vector(destX, destY);
    this._speed = speed;
  }

  public update(elapsed: number): void {
    if (!this._started) {
      this._started = true;
      this._start = new Vector(this._tx.pos.x, this._tx.pos.y);
      this._distance = this._start.distance(this._end);
      this._dir = this._end.sub(this._start).normalize();
    }
    const m = this._dir.scale(this._speed);
    this._motion.vel = vec(m.x, m.y);

    if (this.isComplete(this.entity)) {
      this._tx.pos = vec(this._end.x, this._end.y);
      this._motion.vel = vec(0, 0);
    }
  }

  public isComplete(entity: Entity): boolean {
    const tx = entity.get(TransformComponent);
    return this._stopped || new Vector(tx.pos.x, tx.pos.y).distance(this._start) >= this._distance;
  }

  public stop(): void {
    this._motion.vel = vec(0, 0);
    this._stopped = true;
  }

  public reset(): void {
    this._started = false;
    this._stopped = false;
  }
}
