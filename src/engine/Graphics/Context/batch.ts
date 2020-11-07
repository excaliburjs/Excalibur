import { Poolable, initializePoolData } from './pool';

export class BatchCommand<T> implements Poolable {
  _poolData = initializePoolData();
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

  public dispose() {
    this.commands.length = 0;
  }
}
