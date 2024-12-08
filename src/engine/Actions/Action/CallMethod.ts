import { Action, nextActionId } from '../Action';

export class CallMethod implements Action {
  id = nextActionId();
  private _method: () => any;
  private _hasBeenCalled: boolean = false;
  constructor(method: () => any) {
    this._method = method;
  }

  public update(elapsed: number) {
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
