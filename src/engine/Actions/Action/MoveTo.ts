import { Actor } from '../../Actor';
import { vec, Vector } from '../../Algebra';
import { Action } from '../Action';

export class MoveTo implements Action {
  private _actor: Actor;
  public x: number;
  public y: number;
  private _start: Vector;
  private _end: Vector;
  private _dir: Vector;
  private _speed: number;
  private _distance: number;
  private _started = false;
  private _stopped = false;
  constructor(actor: Actor, destx: number, desty: number, speed: number) {
    this._actor = actor;
    this._end = new Vector(destx, desty);
    this._speed = speed;
  }

  public update(_delta: number): void {
    if (!this._started) {
      this._started = true;
      this._start = new Vector(this._actor.pos.x, this._actor.pos.y);
      this._distance = this._start.distance(this._end);
      this._dir = this._end.sub(this._start).normalize();
    }
    const m = this._dir.scale(this._speed);
    this._actor.vel = vec(m.x, m.y);

    if (this.isComplete(this._actor)) {
      this._actor.pos = vec(this._end.x, this._end.y);
      this._actor.vel = vec(0, 0);
    }
  }

  public isComplete(actor: Actor): boolean {
    return this._stopped || new Vector(actor.pos.x, actor.pos.y).distance(this._start) >= this._distance;
  }

  public stop(): void {
    this._actor.vel = vec(0, 0);
    this._stopped = true;
  }

  public reset(): void {
    this._started = false;
  }
}
