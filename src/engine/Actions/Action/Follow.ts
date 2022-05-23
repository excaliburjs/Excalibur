import { MotionComponent } from '../../EntityComponentSystem/Components/MotionComponent';
import { TransformComponent } from '../../EntityComponentSystem/Components/TransformComponent';
import { Entity } from '../../EntityComponentSystem/Entity';
import { vec, Vector } from '../../Math/vector';
import { Action } from '../Action';

export class Follow implements Action {
  private _tx: TransformComponent;
  private _motion: MotionComponent;
  private _followTx: TransformComponent;
  private _followMotion: MotionComponent;

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

  constructor(entity: Entity, entityToFollow: Entity, followDistance?: number) {
    this._tx = entity.get(TransformComponent);
    this._motion = entity.get(MotionComponent);
    this._followTx = entityToFollow.get(TransformComponent);
    this._followMotion = entityToFollow.get(MotionComponent);
    this._current = new Vector(this._tx.pos.x, this._tx.pos.y);
    this._end = new Vector(this._followTx.pos.x, this._followTx.pos.y);
    this._maximumDistance = followDistance !== undefined ? followDistance : this._current.distance(this._end);
    this._speed = 0;
  }

  public update(_delta: number): void {
    if (!this._started) {
      this._started = true;
      this._distanceBetween = this._current.distance(this._end);
      this._dir = this._end.sub(this._current).normalize();
    }

    const actorToFollowSpeed = Math.sqrt(Math.pow(this._followMotion.vel.x, 2) + Math.pow(this._followMotion.vel.y, 2));
    if (actorToFollowSpeed !== 0) {
      this._speed = actorToFollowSpeed;
    }
    this._current = vec(this._tx.pos.x, this._tx.pos.y);

    this._end = vec(this._followTx.pos.x, this._followTx.pos.y);
    this._distanceBetween = this._current.distance(this._end);
    this._dir = this._end.sub(this._current).normalize();

    if (this._distanceBetween >= this._maximumDistance) {
      const m = this._dir.scale(this._speed);
      this._motion.vel = vec(m.x, m.y);
    } else {
      this._motion.vel = vec(0, 0);
    }

    if (this.isComplete()) {
      this._tx.pos = vec(this._end.x, this._end.y);
      this._motion.vel = vec(0, 0);
    }
  }

  public stop(): void {
    this._motion.vel = vec(0, 0);
    this._stopped = true;
  }

  public isComplete(): boolean {
    // the actor following should never stop unless specified to do so
    return this._stopped;
  }

  public reset(): void {
    this._started = false;
    this._stopped = false;
  }
}
