import { Entity, TransformComponent } from '../../EntityComponentSystem';
import { BezierCurve, clamp, remap } from '../../Math';
import { Action, nextActionId } from '../Action';

export interface CurveToOptions {
  /**
   * Curve in world coordinates to animate towards
   */
  curve: BezierCurve;
  /**
   * Total duration for the action to run
   */
  durationMs: number;
  /**
   * Dynamic mode will speed up/slow down depending on the curve
   *
   * Uniform mode will animate at a consistent velocity across the curve
   *
   * Default: 'dynamic'
   */
  mode?: 'dynamic' | 'uniform';
}

export class CurveTo implements Action {
  id: number = nextActionId();

  private _curve: BezierCurve;
  private _durationMs: number;
  private _entity: Entity<any>;
  private _tx: TransformComponent;
  private _currentMs: number;
  private _started = false;
  private _mode: 'dynamic' | 'uniform' = 'dynamic';
  constructor(entity: Entity, options: CurveToOptions) {
    this._entity = entity;
    this._tx = this._entity.get(TransformComponent);
    if (!this._tx) {
      throw new Error(`Entity ${entity.name} has no TransformComponent, can only curveTo on Entities with TransformComponents.`);
    }
    this._curve = options.curve.clone();
    this._durationMs = options.durationMs;
    this._mode = options.mode ?? this._mode;
    this._currentMs = this._durationMs;
  }

  update(elapsedMs: number): void {
    if (this.isComplete(this._entity)) {
      return;
    }
    if (!this._started) {
      this._curve.setControlPoint(0, this._tx.globalPos.clone());
      this._started = true;
    }
    const t = clamp(remap(0, this._durationMs, 0, 1, this._durationMs - this._currentMs), 0, 1);
    if (this._mode === 'dynamic') {
      this._tx.pos = this._curve.getPoint(t);
    } else {
      this._tx.pos = this._curve.getUniformPoint(t);
    }
    this._currentMs -= elapsedMs;
  }
  isComplete(entity: Entity): boolean {
    return this._currentMs <= 0;
  }
  reset(): void {
    this._currentMs = this._durationMs;
    this._started = false;
  }
  stop(): void {
    this._currentMs = 0;
  }
}
