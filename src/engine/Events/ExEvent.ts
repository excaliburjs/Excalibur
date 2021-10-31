
export abstract class ExEvent<TName extends string> {
  abstract readonly type: TName;

  private _active = true;
  public get active() {
    return this._active;
  }
  public cancel() {
    this._active = false;
  }
}