import { Entity, TransformComponent } from '../../EntityComponentSystem';
import { BezierCurve, clamp, remap, vec, Vector } from '../../Math';
import { Action, nextActionId } from '../Action';

export interface CurveByOptions {
  /**
   * Bezier Curve relative to the current actor position to move
   */
  controlPoints: [control1: Vector, control2: Vector, end: Vector];
  /**
   * Total duration for the action to run
   */
  duration: number;
  /**
   * Dynamic mode will speed up/slow down depending on the curve
   *
   * Uniform mode will animate at a consistent velocity across the curve
   *
   * Default: 'dynamic'
   */
  mode?: 'dynamic' | 'uniform';

  /**
   * Quality when sampling uniform points on the curve. Samples = 4 * quality;
   *
   * For bigger 'uniform' curves you may want to increase quality to make the motion appear smooth
   *
   * Default 4
   */
  quality?: number;
}

export class CurveBy implements Action {
  id: number = nextActionId();

  private _curve: BezierCurve;
  private _durationMs: number;
  private _entity: Entity<any>;
  private _tx: TransformComponent;
  private _currentMs: number;
  private _started = false;
  private _stopped = false;
  private _mode: 'dynamic' | 'uniform' = 'dynamic';
  constructor(entity: Entity, options: CurveByOptions) {
    this._entity = entity;
    this._tx = this._entity.get(TransformComponent);
    if (!this._tx) {
      throw new Error(`Entity ${entity.name} has no TransformComponent, can only curveTo on Entities with TransformComponents.`);
    }
    this._curve = this._curve = new BezierCurve({
      controlPoints: [vec(0, 0), ...options.controlPoints],
      quality: options.quality
    });
    this._durationMs = options.duration;
    this._mode = options.mode ?? this._mode;
    this._currentMs = this._durationMs;
  }

  update(elapsed: number): void {
    if (!this._started) {
      this._curve.setControlPoint(0, this._tx.globalPos);
      this._curve.setControlPoint(1, this._curve.controlPoints[1].add(this._tx.globalPos));
      this._curve.setControlPoint(2, this._curve.controlPoints[2].add(this._tx.globalPos));
      this._curve.setControlPoint(3, this._curve.controlPoints[3].add(this._tx.globalPos));
      this._started = true;
    }
    this._currentMs -= elapsed;
    const t = clamp(remap(0, this._durationMs, 0, 1, this._durationMs - this._currentMs), 0, 1);
    if (this._mode === 'dynamic') {
      this._tx.pos = this._curve.getPoint(t);
    } else {
      this._tx.pos = this._curve.getUniformPoint(t);
    }
    if (this.isComplete(this._entity)) {
      if (this._mode === 'dynamic') {
        this._tx.pos = this._curve.getPoint(1);
      } else {
        this._tx.pos = this._curve.getUniformPoint(1);
      }
    }
  }
  isComplete(entity: Entity): boolean {
    return this._stopped || this._currentMs < 0;
  }
  reset(): void {
    this._currentMs = this._durationMs;
    this._started = false;
    this._stopped = false;
  }
  stop(): void {
    this._stopped = true;
  }
}
