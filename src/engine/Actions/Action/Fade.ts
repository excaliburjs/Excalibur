import { Entity } from '../../EntityComponentSystem/Entity';
import { GraphicsComponent } from '../../Graphics/GraphicsComponent';
import { Logger } from '../../Util/Log';
import { Action } from '../Action';

export class Fade implements Action {
  private _graphics: GraphicsComponent;
  public x: number;
  public y: number;

  private _endOpacity: number;
  private _speed: number;
  private _ogspeed: number;
  private _multiplier: number = 1;
  private _started = false;
  private _stopped = false;

  constructor(entity: Entity, endOpacity: number, speed: number) {
    this._graphics = entity.get(GraphicsComponent);
    this._endOpacity = endOpacity;
    this._speed = this._ogspeed = speed;
  }

  public update(delta: number): void {
    if (!this._graphics) {
      return;
    }

    if (!this._started) {
      this._started = true;
      this._speed = this._ogspeed;

      // determine direction when we start
      if (this._endOpacity < this._graphics.opacity) {
        this._multiplier = -1;
      } else {
        this._multiplier = 1;
      }
    }

    if (this._speed > 0) {
      this._graphics.opacity += (this._multiplier *
        (Math.abs(this._graphics.opacity - this._endOpacity) * delta)) / this._speed;
    }

    this._speed -= delta;

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
