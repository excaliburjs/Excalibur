import { MotionComponent } from '../../EntityComponentSystem/Components/MotionComponent';
import { TransformComponent } from '../../EntityComponentSystem/Components/TransformComponent';
import { Entity } from '../../EntityComponentSystem/Entity';
import { Vector, vec } from '../../Math/vector';
import { Action } from '../Action';

export class Meet implements Action {
  private _tx: TransformComponent;
  private _motion: MotionComponent;
  private _meetTx: TransformComponent;
  private _meetMotion: MotionComponent;
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

  constructor(actor: Entity, actorToMeet: Entity, speed?: number) {
    this._tx = actor.get(TransformComponent);
    this._motion = actor.get(MotionComponent);
    this._meetTx = actorToMeet.get(TransformComponent);
    this._meetMotion = actorToMeet.get(MotionComponent);
    this._current = new Vector(this._tx.pos.x, this._tx.pos.y);
    this._end = new Vector(this._meetTx.pos.x, this._meetTx.pos.y);
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

    const actorToMeetSpeed = Math.sqrt(Math.pow(this._meetMotion.vel.x, 2) + Math.pow(this._meetMotion.vel.y, 2));
    if (actorToMeetSpeed !== 0 && !this._speedWasSpecified) {
      this._speed = actorToMeetSpeed;
    }
    this._current = vec(this._tx.pos.x, this._tx.pos.y);

    this._end = vec(this._meetTx.pos.x, this._meetTx.pos.y);
    this._distanceBetween = this._current.distance(this._end);
    this._dir = this._end.sub(this._current).normalize();

    const m = this._dir.scale(this._speed);
    this._motion.vel = vec(m.x, m.y);

    if (this.isComplete()) {
      this._tx.pos = vec(this._end.x, this._end.y);
      this._motion.vel = vec(0, 0);
    }
  }

  public isComplete(): boolean {
    return this._stopped || this._distanceBetween <= 1;
  }

  public stop(): void {
    this._motion.vel = vec(0, 0);
    this._stopped = true;
  }

  public reset(): void {
    this._started = false;
    this._stopped = false;
    this._distanceBetween = undefined;
  }
}
