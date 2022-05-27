import { MotionComponent } from '../../EntityComponentSystem/Components/MotionComponent';
import { TransformComponent } from '../../EntityComponentSystem/Components/TransformComponent';
import { Entity } from '../../EntityComponentSystem/Entity';
import { Vector, vec } from '../../Math/vector';
import { Logger } from '../../Util/Log';
import { Action } from '../Action';

export class MoveBy implements Action {
  private _tx: TransformComponent;
  private _motion: MotionComponent;
  private _entity: Entity;
  public x: number;
  public y: number;
  private _distance: number;
  private _speed: number;

  private _start: Vector;
  private _offset: Vector;
  private _end: Vector;
  private _dir: Vector;
  private _started = false;
  private _stopped = false;

  constructor(entity: Entity, offsetX: number, offsetY: number, speed: number) {
    this._entity = entity;
    this._tx = entity.get(TransformComponent);
    this._motion = entity.get(MotionComponent);
    this._speed = speed;
    this._offset = new Vector(offsetX, offsetY);
    if (speed <= 0) {
      Logger.getInstance().error('Attempted to moveBy with speed less than or equal to zero : ' + speed);
      throw new Error('Speed must be greater than 0 pixels per second');
    }
  }

  public update(_delta: number) {
    if (!this._started) {
      this._started = true;
      this._start = new Vector(this._tx.pos.x, this._tx.pos.y);
      this._end = this._start.add(this._offset);
      this._distance = this._offset.size;
      this._dir = this._end.sub(this._start).normalize();
    }

    if (this.isComplete(this._entity)) {
      this._tx.pos = vec(this._end.x, this._end.y);
      this._motion.vel = vec(0, 0);
    } else {
      this._motion.vel = this._dir.scale(this._speed);
    }
  }

  public isComplete(entity: Entity): boolean {
    const tx = entity.get(TransformComponent);
    return this._stopped || tx.pos.distance(this._start) >= this._distance;
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
