import { Actor } from '../../Actor';
import { vec, Vector } from '../../Math/vector';
import { Action } from '../Action';

export class Follow implements Action {
  private _actor: Actor;
  private _actorToFollow: Actor;
  public x: number;
  public y: number;
  private _current: Vector;
  private _end: Vector;
  private _dir: Vector;
  private _speed: number;
  private _maximumDistance: number;
  private _distanceBetween: number;
  private _started = false;
  private _stopped = false;

  constructor(actor: Actor, actorToFollow: Actor, followDistance?: number) {
    this._actor = actor;
    this._actorToFollow = actorToFollow;
    this._current = new Vector(this._actor.pos.x, this._actor.pos.y);
    this._end = new Vector(actorToFollow.pos.x, actorToFollow.pos.y);
    this._maximumDistance = followDistance !== undefined ? followDistance : this._current.distance(this._end);
    this._speed = 0;
  }

  public update(_delta: number): void {
    if (!this._started) {
      this._started = true;
      this._distanceBetween = this._current.distance(this._end);
      this._dir = this._end.sub(this._current).normalize();
    }

    const actorToFollowSpeed = Math.sqrt(Math.pow(this._actorToFollow.vel.x, 2) + Math.pow(this._actorToFollow.vel.y, 2));
    if (actorToFollowSpeed !== 0) {
      this._speed = actorToFollowSpeed;
    }
    this._current = vec(this._actor.pos.x, this._actor.pos.y);

    this._end = vec(this._actorToFollow.pos.x, this._actorToFollow.pos.y);
    this._distanceBetween = this._current.distance(this._end);
    this._dir = this._end.sub(this._current).normalize();

    if (this._distanceBetween >= this._maximumDistance) {
      const m = this._dir.scale(this._speed);
      this._actor.vel = vec(m.x, m.y);
    } else {
      this._actor.vel = vec(0, 0);
    }

    if (this.isComplete()) {
      this._actor.pos = vec(this._end.x, this._end.y);
      this._actor.vel = vec(0, 0);
    }
  }

  public stop(): void {
    this._actor.vel = vec(0, 0);
    this._stopped = true;
  }

  public isComplete(): boolean {
    // the actor following should never stop unless specified to do so
    return this._stopped;
  }

  public reset(): void {
    this._started = false;
  }
}
