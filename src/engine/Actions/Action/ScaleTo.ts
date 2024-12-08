import { vec, Vector } from '../../Math/vector';
import { MotionComponent } from '../../EntityComponentSystem/Components/MotionComponent';
import { TransformComponent } from '../../EntityComponentSystem/Components/TransformComponent';
import { Action, nextActionId } from '../Action';
import { Entity } from '../../EntityComponentSystem/Entity';
import { clamp, lerpVector, remap } from '../../Math';

export interface ScaleToOptions {
  /**
   * Absolute scale to change to
   */
  scale: Vector;
  /**
   * Duration to take in milliseconds
   */
  duration: number;
}

/**
 *
 */
export function isScaleToOptions(x: any): x is ScaleToOptions {
  return typeof x.scale === 'object' && typeof x.duration === 'number';
}

export class ScaleToWithOptions implements Action {
  id = nextActionId();
  private _durationMs: number;
  private _tx: TransformComponent;
  private _started: boolean = false;
  private _currentMs: number;
  private _stopped: boolean = false;
  private _motion: MotionComponent;
  private _endScale: Vector = vec(1, 1);
  private _startScale: Vector = vec(1, 1);
  constructor(
    public entity: Entity,
    options: ScaleToOptions
  ) {
    this._endScale = options.scale;
    this._tx = entity.get(TransformComponent);
    this._motion = entity.get(MotionComponent);
    if (!this._tx) {
      throw new Error(`Entity ${entity.name} has no TransformComponent, can only ScaleTo on Entities with TransformComponents.`);
    }
    this._durationMs = options.duration;
    this._currentMs = this._durationMs;
  }
  update(elapsed: number): void {
    if (!this._started) {
      this._startScale = this._tx.scale;
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

export class ScaleTo implements Action {
  id = nextActionId();
  private _tx: TransformComponent;
  private _motion: MotionComponent;
  public x!: number;
  public y!: number;
  private _startX!: number;
  private _startY!: number;
  private _endX: number;
  private _endY: number;
  private _speedX: number;
  private _speedY: number;
  private _distanceX!: number;
  private _distanceY!: number;
  private _started = false;
  private _stopped = false;
  constructor(entity: Entity, scaleX: number, scaleY: number, speedX: number, speedY: number) {
    this._tx = entity.get(TransformComponent);
    this._motion = entity.get(MotionComponent);
    this._endX = scaleX;
    this._endY = scaleY;
    this._speedX = speedX;
    this._speedY = speedY;
  }

  public update(elapsed: number): void {
    if (!this._started) {
      this._started = true;
      this._startX = this._tx.scale.x;
      this._startY = this._tx.scale.y;
      this._distanceX = Math.abs(this._endX - this._startX);
      this._distanceY = Math.abs(this._endY - this._startY);
    }

    if (!(Math.abs(this._tx.scale.x - this._startX) >= this._distanceX)) {
      const directionX = this._endY < this._startY ? -1 : 1;
      this._motion.scaleFactor.x = this._speedX * directionX;
    } else {
      this._motion.scaleFactor.x = 0;
    }

    if (!(Math.abs(this._tx.scale.y - this._startY) >= this._distanceY)) {
      const directionY = this._endY < this._startY ? -1 : 1;
      this._motion.scaleFactor.y = this._speedY * directionY;
    } else {
      this._motion.scaleFactor.y = 0;
    }

    if (this.isComplete()) {
      this._tx.scale = vec(this._endX, this._endY);
      this._motion.scaleFactor.x = 0;
      this._motion.scaleFactor.y = 0;
    }
  }

  public isComplete(): boolean {
    return (
      this._stopped ||
      (Math.abs(this._tx.scale.x - this._startX) >= this._distanceX - 0.01 &&
        Math.abs(this._tx.scale.y - this._startY) >= this._distanceY - 0.01)
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
