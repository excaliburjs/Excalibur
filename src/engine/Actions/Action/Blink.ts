import { GraphicsComponent } from '../../Graphics/GraphicsComponent';
import { Entity } from '../../EntityComponentSystem/Entity';
import { Action } from '../Action';

export class Blink implements Action {
  private _graphics: GraphicsComponent;
  private _timeVisible: number = 0;
  private _timeNotVisible: number = 0;
  private _elapsedTime: number = 0;
  private _totalTime: number = 0;
  private _duration: number;
  private _stopped: boolean = false;
  private _started: boolean = false;
  constructor(entity: Entity, timeVisible: number, timeNotVisible: number, numBlinks: number = 1) {
    this._graphics = entity.get(GraphicsComponent);
    this._timeVisible = timeVisible;
    this._timeNotVisible = timeNotVisible;
    this._duration = (timeVisible + timeNotVisible) * numBlinks;
  }

  public update(delta: number): void {
    if (!this._started) {
      this._started = true;
      this._elapsedTime = 0;
      this._totalTime = 0;
    }
    if (!this._graphics) {
      return;
    }

    this._elapsedTime += delta;
    this._totalTime += delta;
    if (this._graphics.visible && this._elapsedTime >= this._timeVisible) {
      this._graphics.visible = false;
      this._elapsedTime = 0;
    }

    if (!this._graphics.visible && this._elapsedTime >= this._timeNotVisible) {
      this._graphics.visible = true;
      this._elapsedTime = 0;
    }

    if (this.isComplete()) {
      this._graphics.visible = true;
    }
  }

  public isComplete(): boolean {
    return this._stopped || this._totalTime >= this._duration;
  }

  public stop(): void {
    if (this._graphics) {
      this._graphics.visible = true;
    }
    this._stopped = true;
  }

  public reset() {
    this._started = false;
    this._stopped = false;
    this._elapsedTime = 0;
    this._totalTime = 0;
  }
}
