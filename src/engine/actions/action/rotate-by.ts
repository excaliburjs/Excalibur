import type { Action } from '../action';
import { nextActionId } from '../action';
import { TransformComponent } from '../../entity-component-system/components/transform-component';
import { MotionComponent } from '../../entity-component-system/components/motion-component';
import type { Entity } from '../../entity-component-system/entity';
import { canonicalizeAngle, clamp, TwoPI } from '../../math/util';
import { remap, RotationType } from '../../math';

export interface RotateByOptions {
  /**
   * Angle in radians to offset from the current and rotate
   */
  angleRadiansOffset: number;
  /**
   * Duration to take in milliseconds
   */
  duration: number;
  /**
   * Optionally provide type of rotation. When omitted the entity rotates by exactly the
   * signed offset provided, preserving full turns (an offset of 2 PI performs a full revolution).
   * When provided, the offset determines the target orientation and the rotation type picks
   * the travel path to it. Non-zero full-turn multiples of 2 PI travel one full revolution in
   * the requested direction for Clockwise, CounterClockwise, and LongestPath, while
   * ShortestPath will not move.
   */
  rotationType?: RotationType;
}

/**
 *
 */
export function isRotateByOptions(x: any): x is RotateByOptions {
  return typeof x.angleRadiansOffset === 'number' && typeof x.duration === 'number';
}

export class RotateByWithOptions implements Action {
  id = nextActionId();
  private _durationMs: number;
  private _tx: TransformComponent;
  private _started: boolean = false;
  private _currentMs: number;
  private _stopped: boolean = false;
  private _motion: MotionComponent;
  private _offset: number = 0;
  private _startAngle: number = 0;
  private _rotationType?: RotationType;
  private _travel: number = 0;
  private _currentAngle: number = 0;
  constructor(
    public entity: Entity,
    options: RotateByOptions
  ) {
    this._offset = options.angleRadiansOffset;
    this._tx = entity.get(TransformComponent);
    this._motion = entity.get(MotionComponent);
    if (!this._tx) {
      throw new Error(`Entity ${entity.name} has no TransformComponent, can only RotateBy on Entities with TransformComponents.`);
    }
    this._durationMs = options.duration;
    this._rotationType = options.rotationType;
    this._currentMs = this._durationMs;
  }
  update(elapsed: number): void {
    if (!this._started) {
      this._startAngle = this._tx.rotation;
      this._currentAngle = this._startAngle;
      // The two canonical paths to the target orientation: positive in [0, 2PI), negative in [-2PI, 0).
      // A non-zero full-turn multiple targets the starting orientation; treat it as one full turn so
      // directional rotation types still revolve instead of degenerating to 0 or -2PI arbitrarily
      const canonicalOffset = canonicalizeAngle(this._offset);
      const isFullTurn = canonicalOffset === 0 && this._offset !== 0;
      const positivePath = isFullTurn ? TwoPI : canonicalOffset;
      const negativePath = isFullTurn ? -TwoPI : canonicalOffset - TwoPI;
      switch (this._rotationType) {
        case undefined:
          // No explicit rotation type: rotate by exactly the signed offset, preserving full turns
          this._travel = this._offset;
          break;
        case RotationType.ShortestPath:
          this._travel = isFullTurn ? 0 : Math.abs(positivePath) <= Math.abs(negativePath) ? positivePath : negativePath;
          break;
        case RotationType.LongestPath:
          this._travel = isFullTurn ? Math.sign(this._offset) * TwoPI : Math.abs(positivePath) > Math.abs(negativePath) ? positivePath : negativePath;
          break;
        case RotationType.Clockwise:
          this._travel = positivePath;
          break;
        case RotationType.CounterClockwise:
          this._travel = negativePath;
          break;
      }
      if (this._offset === 0) {
        this._travel = 0;
      }
      this._started = true;
    }
    this._currentMs -= elapsed;
    const t = clamp(remap(0, this._durationMs, 0, 1, this._durationMs - this._currentMs), 0, 1);
    const newAngle = this._startAngle + this._travel * t;
    const seconds = elapsed / 1000;
    // Track the un-canonicalized angle so wrapping the transform's rotation doesn't spike velocity
    const rx = seconds === 0 ? 0 : (newAngle - this._currentAngle) / seconds;
    this._currentAngle = newAngle;
    this._motion.angularVelocity = rx;

    if (this.isComplete()) {
      this._tx.rotation = canonicalizeAngle(this._startAngle + this._travel);
      this._motion.angularVelocity = 0;
    }
  }
  public isComplete(): boolean {
    return this._stopped || this._currentMs < 0;
  }

  public stop(): void {
    this._motion.angularVelocity = 0;
    this._stopped = true;
    this._started = false;
    this._currentMs = 0;
  }

  public reset(): void {
    this._currentMs = this._durationMs;
    this._started = false;
    this._stopped = false;
  }
}

export class RotateBy implements Action {
  id = nextActionId();
  private _tx: TransformComponent;
  private _motion: MotionComponent;
  public x!: number;
  public y!: number;
  private _start!: number;
  private _end!: number;
  private _speed: number;
  private _offset: number;

  private _rotationType: RotationType;
  private _direction!: number;
  private _distance!: number;
  private _shortDistance!: number;
  private _longDistance!: number;
  private _shortestPathIsPositive!: boolean;
  private _currentNonCannonAngle!: number;
  private _started = false;
  private _stopped = false;
  constructor(entity: Entity, angleRadiansOffset: number, speed: number, rotationType?: RotationType) {
    this._tx = entity.get(TransformComponent);
    this._motion = entity.get(MotionComponent);
    this._speed = speed;
    this._offset = angleRadiansOffset;
    this._rotationType = rotationType || RotationType.ShortestPath;
  }

  public update(elapsed: number): void {
    if (!this._started) {
      this._started = true;
      this._start = this._tx.rotation;
      this._currentNonCannonAngle = this._tx.rotation;
      this._end = this._start + this._offset;

      const distance1 = Math.abs(this._end - this._start);
      const distance2 = TwoPI - distance1;
      if (distance1 > distance2) {
        this._shortDistance = distance2;
        this._longDistance = distance1;
      } else {
        this._shortDistance = distance1;
        this._longDistance = distance2;
      }

      this._shortestPathIsPositive = (this._start - this._end + TwoPI) % TwoPI >= Math.PI;

      switch (this._rotationType) {
        case RotationType.ShortestPath:
          this._distance = this._shortDistance;
          if (this._shortestPathIsPositive) {
            this._direction = 1;
          } else {
            this._direction = -1;
          }
          break;
        case RotationType.LongestPath:
          this._distance = this._longDistance;
          if (this._shortestPathIsPositive) {
            this._direction = -1;
          } else {
            this._direction = 1;
          }
          break;
        case RotationType.Clockwise:
          this._direction = 1;
          if (this._shortDistance >= 0) {
            this._distance = this._shortDistance;
          } else {
            this._distance = this._longDistance;
          }
          break;
        case RotationType.CounterClockwise:
          this._direction = -1;
          if (this._shortDistance <= 0) {
            this._distance = this._shortDistance;
          } else {
            this._distance = this._longDistance;
          }
          break;
      }
    }

    this._motion.angularVelocity = this._direction * this._speed;
    this._currentNonCannonAngle += this._direction * this._speed * (elapsed / 1000);

    if (this.isComplete()) {
      this._tx.rotation = this._end;
      this._motion.angularVelocity = 0;
      this._stopped = true;
    }
  }

  public isComplete(): boolean {
    const distanceTraveled = Math.abs(this._currentNonCannonAngle - this._start);
    return this._stopped || distanceTraveled >= Math.abs(this._distance);
  }

  public stop(): void {
    this._motion.angularVelocity = 0;
    this._stopped = true;
    this._started = false;
  }

  public reset(): void {
    this._started = false;
    this._stopped = false;
    this._start = undefined as any;
    this._currentNonCannonAngle = undefined as any;
    this._distance = undefined as any;
  }
}
