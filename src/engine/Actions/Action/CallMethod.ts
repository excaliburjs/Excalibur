import { Action } from '../Action';

export class CallMethod implements Action {
  private _method: () => any = null;
  private _hasBeenCalled: boolean = false;
  constructor(method: () => any) {
    this._method = method;
  }

  public update(_delta: number) {
    this._method();
    this._hasBeenCalled = true;
  }
  public isComplete() {
    return this._hasBeenCalled;
  }
  public reset() {
    this._hasBeenCalled = false;
  }
  public stop() {
    this._hasBeenCalled = true;
  }
}
