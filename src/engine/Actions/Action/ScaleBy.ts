import { vec, Vector } from '../../Math/vector';
import { Entity } from '../../EntityComponentSystem/Entity';
import { MotionComponent } from '../../EntityComponentSystem/Components/MotionComponent';
import { TransformComponent } from '../../EntityComponentSystem/Components/TransformComponent';
import { Action, nextActionId } from '../Action';
import { clamp, lerpVector, remap } from '../../Math';

export interface ScaleByOptions {
  /**
   * Absolute scale to change to
   */
  scaleOffset: Vector;
  /**
   * Duration to take in milliseconds
   */
  duration: number;
}

/**
 *
 */
export function isScaleByOptions(x: any): x is ScaleByOptions {
  return typeof x.scaleOffset === 'object' && typeof x.duration === 'number';
}

export class ScaleByWithOptions implements Action {
  id = nextActionId();
  private _durationMs: number;
  private _tx: TransformComponent;
  private _started: boolean = false;
  private _currentMs: number;
  private _stopped: boolean = false;
  private _motion: MotionComponent;
  private _endScale: Vector = vec(1, 1);
  private _scaleOffset: Vector = vec(0, 0);
  private _startScale: Vector = vec(1, 1);
  constructor(
    public entity: Entity,
    options: ScaleByOptions
  ) {
    this._scaleOffset = options.scaleOffset;
    this._tx = entity.get(TransformComponent);
    this._motion = entity.get(MotionComponent);
    if (!this._tx) {
      throw new Error(`Entity ${entity.name} has no TransformComponent, can only ScaleBy on Entities with TransformComponents.`);
    }
    this._durationMs = options.duration;
    this._currentMs = this._durationMs;
  }
  update(elapsed: number): void {
    if (!this._started) {
      this._startScale = this._tx.scale;
      this._endScale = this._startScale.add(this._scaleOffset);
      this._started = true;
    }
    this._currentMs -= elapsed;
    const t = clamp(remap(0, this._durationMs, 0, 1, this._durationMs - this._currentMs), 0, 1);
    const newScale = lerpVector(this._startScale, this._endScale, t);
    const currentScale = this._tx.scale;
    const sx = newScale.sub(currentScale).scale(1 / (elapsed / 1000));
    this._motion.scaleFactor = sx;

    if (this.isComplete()) {
      this._tx.scale = this._endScale;
      this._motion.angularVelocity = 0;
    }
  }
  public isComplete(): boolean {
    return this._stopped || this._currentMs < 0;
  }

  public stop(): void {
    this._motion.scaleFactor = Vector.Zero;
    this._stopped = true;
    this._currentMs = 0;
  }

  public reset(): void {
    this._currentMs = this._durationMs;
    this._started = false;
    this._stopped = false;
  }
}

export class ScaleBy implements Action {
  id = nextActionId();
  private _tx: TransformComponent;
  private _motion: MotionComponent;
  public x!: number;
  public y!: number;
  private _startScale!: Vector;
  private _endScale!: Vector;
  private _offset: Vector;
  private _distanceX!: number;
  private _distanceY!: number;
  private _directionX!: number;
  private _directionY!: number;
  private _started = false;
  private _stopped = false;
  private _speedX: number;
  private _speedY: number;
  constructor(entity: Entity, scaleOffsetX: number, scaleOffsetY: number, speed: number) {
    this._tx = entity.get(TransformComponent);
    this._motion = entity.get(MotionComponent);
    this._offset = new Vector(scaleOffsetX, scaleOffsetY);
    this._speedX = this._speedY = speed;
  }

  public update(elapsed: number): void {
    if (!this._started) {
      this._started = true;
      this._startScale = this._tx.scale.clone();
      this._endScale = this._startScale.add(this._offset);
      this._distanceX = Math.abs(this._endScale.x - this._startScale.x);
      this._distanceY = Math.abs(this._endScale.y - this._startScale.y);
      this._directionX = this._endScale.x < this._startScale.x ? -1 : 1;
      this._directionY = this._endScale.y < this._startScale.y ? -1 : 1;
    }

    this._motion.scaleFactor.x = this._speedX * this._directionX;
    this._motion.scaleFactor.y = this._speedY * this._directionY;

    if (this.isComplete()) {
      this._tx.scale = this._endScale;
      this._motion.scaleFactor.x = 0;
      this._motion.scaleFactor.y = 0;
    }
  }

  public isComplete(): boolean {
    return (
      this._stopped ||
      (Math.abs(this._tx.scale.x - this._startScale.x) >= this._distanceX - 0.01 &&
        Math.abs(this._tx.scale.y - this._startScale.y) >= this._distanceY - 0.01)
    );
  }

  public stop(): void {
    this._motion.scaleFactor.x = 0;
    this._motion.scaleFactor.y = 0;
    this._stopped = true;
  }

  public reset(): void {
    this._started = false;
    this._stopped = false;
  }
}
