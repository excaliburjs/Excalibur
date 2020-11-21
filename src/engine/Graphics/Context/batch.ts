import { Pool, Poolable } from '../../Util/Pool';

export class BatchCommand<T> implements Poolable {
  _pool: Pool<this> = undefined;
  public commands: T[] = [];
  constructor(public max: number) {}

  isFull() {
    if (this.commands.length >= this.max) {
      return true;
    }
    return false;
  }

  canAdd() {
    return !this.isFull();
  }

  add(cmd: T) {
    this.commands.push(cmd);
  }

  dispose() {
    this.commands.length = 0;
    return this;
  }
}
