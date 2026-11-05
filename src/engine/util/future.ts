/**
 * Future is a wrapper around a native browser Promise to allow resolving/rejecting at any time
 */
export class Future<T> {
  // Code from StephenCleary https://gist.github.com/StephenCleary/ba50b2da419c03b9cba1d20cb4654d5e
  private _resolver!: (value: T) => void;
  private _rejecter!: (error: Error) => void;
  private _isComplete: boolean = false;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this._resolver = resolve;
      this._rejecter = reject;
    });
  }

  public readonly promise: Promise<T>;

  public get isComplete(): boolean {
    return this._isComplete;
  }

  public resolve(value: T): void {
    if (this._isComplete) {
      return;
    }
    this._isComplete = true;
    this._resolver(value);
  }

  public reject(error: Error): void {
    if (this._isComplete) {
      return;
    }
    this._isComplete = true;
    this._rejecter(error);
  }
}
