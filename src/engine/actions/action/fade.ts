import type { Entity } from '../../entity-component-system/entity';
import { GraphicsComponent } from '../../graphics/graphics-component';
import { Logger } from '../../util/log';
import type { Action } from '../action';
import { nextActionId } from '../action';

export class Fade implements Action {
  id = nextActionId();
  private _graphics: GraphicsComponent;

  private _endOpacity: number;
  private _remainingTime: number;
  private _originalTime: number;
  private _multiplier: number = 1;
  private _started = false;
  private _stopped = false;

  constructor(entity: Entity, endOpacity: number, duration: number) {
    this._graphics = entity.get(GraphicsComponent);
    this._endOpacity = endOpacity;
    this._remainingTime = this._originalTime = duration;
  }

  public update(elapsed: number): void {
    if (!this._graphics) {
      return;
    }

    if (!this._started) {
      this._started = true;
      this._remainingTime = this._originalTime;

      // determine direction when we start
      if (this._endOpacity < this._graphics.opacity) {
        this._multiplier = -1;
      } else {
        this._multiplier = 1;
      }
    }

    if (this._remainingTime > 0) {
      this._graphics.opacity += (this._multiplier * (Math.abs(this._graphics.opacity - this._endOpacity) * elapsed)) / this._remainingTime;
    }

    this._remainingTime -= elapsed;

    if (this.isComplete()) {
      this._graphics.opacity = this._endOpacity;
    }

    Logger.getInstance().debug('[Action fade] Actor opacity:', this._graphics.opacity);
  }

  public isComplete(): boolean {
    return this._stopped || this._remainingTime <= 0;
  }

  public stop(): void {
    this._stopped = true;
  }

  public reset(): void {
    this._started = false;
    this._stopped = false;
    this._remainingTime = this._originalTime;
  }
}
