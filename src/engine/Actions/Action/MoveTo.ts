import { MotionComponent } from '../../EntityComponentSystem/Components/MotionComponent';
import { TransformComponent } from '../../EntityComponentSystem/Components/TransformComponent';
import { Entity } from '../../EntityComponentSystem/Entity';
import { Vector, vec } from '../../Math/vector';
import { Action } from '../Action';

export class MoveTo implements Action {
  private _tx: TransformComponent;
  private _motion: MotionComponent;
  public x: number;
  public y: number;
  private _start: Vector;
  private _end: Vector;
  private _dir: Vector;
  private _speed: number;
  private _distance: number;
  private _started = false;
  private _stopped = false;
  constructor(public entity: Entity, destx: number, desty: number, speed: number) {
    this._tx = entity.get(TransformComponent);
    this._motion = entity.get(MotionComponent);
    this._end = new Vector(destx, desty);
    this._speed = speed;
  }

  public update(_delta: number): void {
    if (!this._started) {
      this._started = true;
      this._start = new Vector(this._tx.pos.x, this._tx.pos.y);
      this._distance = this._start.distance(this._end);
      this._dir = this._end.sub(this._start).normalize();
    }
    const m = this._dir.scale(this._speed);
    this._motion.vel = vec(m.x, m.y);

    if (this.isComplete(this.entity)) {
      this._tx.pos = vec(this._end.x, this._end.y);
      this._motion.vel = vec(0, 0);
    }
  }

  public isComplete(entity: Entity): boolean {
    const tx = entity.get(TransformComponent);
    return this._stopped || new Vector(tx.pos.x, tx.pos.y).distance(this._start) >= this._distance;
  }

  public stop(): void {
    this._motion.vel = vec(0, 0);
    this._stopped = true;
  }

  public reset(): void {
    this._started = false;
    this._stopped = false;
  }
}
