import { Actor } from '../../Actor';
import { Vector, vec } from '../../Math/vector';
import { Action } from '../Action';

export class Meet implements Action {
  private _actor: Actor;
  private _actorToMeet: Actor;
  public x: number;
  public y: number;
  private _current: Vector;
  private _end: Vector;
  private _dir: Vector;
  private _speed: number;
  private _distanceBetween: number;
  private _started = false;
  private _stopped = false;
  private _speedWasSpecified = false;

  constructor(actor: Actor, actorToMeet: Actor, speed?: number) {
    this._actor = actor;
    this._actorToMeet = actorToMeet;
    this._current = new Vector(this._actor.pos.x, this._actor.pos.y);
    this._end = new Vector(actorToMeet.pos.x, actorToMeet.pos.y);
    this._speed = speed || 0;

    if (speed !== undefined) {
      this._speedWasSpecified = true;
    }
  }

  public update(_delta: number): void {
    if (!this._started) {
      this._started = true;
      this._distanceBetween = this._current.distance(this._end);
      this._dir = this._end.sub(this._current).normalize();
    }

    const actorToMeetSpeed = Math.sqrt(Math.pow(this._actorToMeet.vel.x, 2) + Math.pow(this._actorToMeet.vel.y, 2));
    if (actorToMeetSpeed !== 0 && !this._speedWasSpecified) {
      this._speed = actorToMeetSpeed;
    }
    this._current = vec(this._actor.pos.x, this._actor.pos.y);

    this._end = vec(this._actorToMeet.pos.x, this._actorToMeet.pos.y);
    this._distanceBetween = this._current.distance(this._end);
    this._dir = this._end.sub(this._current).normalize();

    const m = this._dir.scale(this._speed);
    this._actor.vel = vec(m.x, m.y);

    if (this.isComplete()) {
      this._actor.pos = vec(this._end.x, this._end.y);
      this._actor.vel = vec(0, 0);
    }
  }

  public isComplete(): boolean {
    return this._stopped || this._distanceBetween <= 1;
  }

  public stop(): void {
    this._actor.vel = vec(0, 0);
    this._stopped = true;
  }

  public reset(): void {
    this._started = false;
  }
}
