import { Actor } from '../../Actor';
import { Action } from '../Action';
import { RotationType } from '../RotationType';
import * as Util from '../../Util/Util';

export class RotateBy implements Action {
  private _actor: Actor;
  public x: number;
  public y: number;
  private _start: number;
  private _end: number;
  private _speed: number;
  private _offset: number;

  private _rotationType: RotationType;
  private _direction: number;
  private _distance: number;
  private _shortDistance: number;
  private _longDistance: number;
  private _shortestPathIsPositive: boolean;
  private _currentNonCannonAngle: number;
  private _started = false;
  private _stopped = false;
  constructor(actor: Actor, angleRadiansOffset: number, speed: number, rotationType?: RotationType) {
    this._actor = actor;
    this._speed = speed;
    this._offset = angleRadiansOffset;
    this._rotationType = rotationType || RotationType.ShortestPath;
  }

  public update(_delta: number): void {
    if (!this._started) {
      this._started = true;
      this._start = this._actor.rotation;
      this._currentNonCannonAngle = this._actor.rotation;
      this._end = this._start + this._offset;

      const distance1 = Math.abs(this._end - this._start);
      const distance2 = Util.TwoPI - distance1;
      if (distance1 > distance2) {
        this._shortDistance = distance2;
        this._longDistance = distance1;
      } else {
        this._shortDistance = distance1;
        this._longDistance = distance2;
      }

      this._shortestPathIsPositive = (this._start - this._end + Util.TwoPI) % Util.TwoPI >= Math.PI;

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

    this._actor.rx = this._direction * this._speed;
    this._currentNonCannonAngle += this._direction * this._speed * (_delta / 1000);

    if (this.isComplete()) {
      this._actor.rotation = this._end;
      this._actor.rx = 0;
      this._stopped = true;
    }
  }

  public isComplete(): boolean {
    const distanceTravelled = Math.abs(this._currentNonCannonAngle - this._start);
    return this._stopped || distanceTravelled >= Math.abs(this._distance);
  }

  public stop(): void {
    this._actor.rx = 0;
    this._stopped = true;
  }

  public reset(): void {
    this._started = false;
  }
}
