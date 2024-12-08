import { Action, nextActionId } from '../Action';
import { RotationType } from '../../Math';
import { TransformComponent } from '../../EntityComponentSystem/Components/TransformComponent';
import { MotionComponent } from '../../EntityComponentSystem/Components/MotionComponent';
import { Entity } from '../../EntityComponentSystem/Entity';
import { clamp, TwoPI } from '../../Math/util';
import { lerpAngle, remap } from '../../Math';

export interface RotateToOptions {
  /**
   * Absolute angle to rotate to in radians
   */
  angle: number;
  /**
   * Duration to take in milliseconds
   */
  duration: number;
  /**
   * Optionally provide type of rotation, default is RotationType.ShortestPath
   */
  rotationType?: RotationType;
}

/**
 *
 */
export function isRotateToOptions(x: any): x is RotateToOptions {
  return typeof x.angle === 'number' && typeof x.duration === 'number';
}

export class RotateToWithOptions implements Action {
  id = nextActionId();
  private _durationMs: number;
  private _tx: TransformComponent;
  private _started: boolean = false;
  private _currentMs: number;
  private _stopped: boolean = false;
  private _motion: MotionComponent;
  private _endAngle: number = 0;
  private _startAngle: number = 0;
  private _rotationType: RotationType;
  constructor(
    public entity: Entity,
    options: RotateToOptions
  ) {
    this._endAngle = options.angle;
    this._tx = entity.get(TransformComponent);
    this._motion = entity.get(MotionComponent);
    if (!this._tx) {
      throw new Error(`Entity ${entity.name} has no TransformComponent, can only RotateTo on Entities with TransformComponents.`);
    }
    this._durationMs = options.duration;
    this._rotationType = options.rotationType ?? RotationType.ShortestPath;
    this._currentMs = this._durationMs;
  }
  update(elapsed: number): void {
    if (!this._started) {
      this._startAngle = this._tx.rotation;
      this._started = true;
    }
    this._currentMs -= elapsed;
    const t = clamp(remap(0, this._durationMs, 0, 1, this._durationMs - this._currentMs), 0, 1);
    const newAngle = lerpAngle(this._startAngle, this._endAngle, this._rotationType, t);
    const currentAngle = this._tx.rotation;

    const rx = (newAngle - currentAngle) / (elapsed / 1000);
    this._motion.angularVelocity = rx;

    if (this.isComplete(this.entity)) {
      this._tx.rotation = this._endAngle;
      this._motion.angularVelocity = 0;
    }
  }
  public isComplete(entity: Entity): boolean {
    return this._stopped || this._currentMs < 0;
  }

  public stop(): void {
    this._motion.angularVelocity = 0;
    this._stopped = true;
    this._currentMs = 0;
  }

  public reset(): void {
    this._currentMs = this._durationMs;
    this._started = false;
    this._stopped = false;
  }
}

export class RotateTo implements Action {
  id = nextActionId();
  private _tx: TransformComponent;
  private _motion: MotionComponent;
  public x!: number;
  public y!: number;
  private _start!: number;
  private _end: number;
  private _speed: number;
  private _rotationType: RotationType;
  private _direction!: number;
  private _distance!: number;
  private _shortDistance!: number;
  private _longDistance!: number;
  private _shortestPathIsPositive!: boolean;
  private _currentNonCannonAngle!: number;
  private _started = false;
  private _stopped = false;
  constructor(entity: Entity, angle: number, speed: number, rotationType?: RotationType) {
    this._tx = entity.get(TransformComponent);
    this._motion = entity.get(MotionComponent);
    this._end = angle;
    this._speed = speed;
    this._rotationType = rotationType || RotationType.ShortestPath;
  }

  public update(elapsed: number): void {
    if (!this._started) {
      this._started = true;
      this._start = this._tx.rotation;
      this._currentNonCannonAngle = this._tx.rotation;
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
          if (this._shortestPathIsPositive) {
            this._distance = this._shortDistance;
          } else {
            this._distance = this._longDistance;
          }
          break;
        case RotationType.CounterClockwise:
          this._direction = -1;
          if (!this._shortestPathIsPositive) {
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
  }

  public reset(): void {
    this._started = false;
    this._stopped = false;
  }
}
