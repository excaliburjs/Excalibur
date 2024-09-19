import { Entity } from '../../EntityComponentSystem/Entity';
import { GraphicsComponent } from '../../Graphics/GraphicsComponent';
import { Logger } from '../../Util/Log';
import { Action, nextActionId } from '../Action';

export class Fade implements Action {
  id = nextActionId();
  private _graphics: GraphicsComponent;
  public x: number;
  public y: number;

  private _endOpacity: number;
  private _speed: number;
  private _originalSpeed: number;
  private _multiplier: number = 1;
  private _started = false;
  private _stopped = false;

  constructor(entity: Entity, endOpacity: number, speed: number) {
    this._graphics = entity.get(GraphicsComponent);
    this._endOpacity = endOpacity;
    this._speed = this._originalSpeed = speed;
  }

  public update(elapsedMs: number): void {
    if (!this._graphics) {
      return;
    }

    if (!this._started) {
      this._started = true;
      this._speed = this._originalSpeed;

      // determine direction when we start
      if (this._endOpacity < this._graphics.opacity) {
        this._multiplier = -1;
      } else {
        this._multiplier = 1;
      }
    }

    if (this._speed > 0) {
      this._graphics.opacity += (this._multiplier * (Math.abs(this._graphics.opacity - this._endOpacity) * elapsedMs)) / this._speed;
    }

    this._speed -= elapsedMs;

    if (this.isComplete()) {
      this._graphics.opacity = this._endOpacity;
    }

    Logger.getInstance().debug('[Action fade] Actor opacity:', this._graphics.opacity);
  }

  public isComplete(): boolean {
    return this._stopped || Math.abs(this._graphics.opacity - this._endOpacity) < 0.05;
  }

  public stop(): void {
    this._stopped = true;
  }

  public reset(): void {
    this._started = false;
    this._stopped = false;
  }
}
