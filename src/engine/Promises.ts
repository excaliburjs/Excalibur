// Promises/A+ Spec http://promises-aplus.github.io/promises-spec/

/**
 * Valid states for a promise to be in
 */
export enum PromiseState {
  Resolved,
  Rejected,
  Pending
}

export interface PromiseLike<T> {
  then(successCallback?: (value?: T) => any, rejectCallback?: (value?: T) => any): PromiseLike<T>;
  error(rejectCallback?: (value?: any) => any): PromiseLike<T>;

  //Cannot define static methods on interfaces
  //wrap<T>(value?: T): IPromise<T>;

  resolve(value?: T): PromiseLike<T>;
  reject(value?: any): PromiseLike<T>;

  state(): PromiseState;
}

/**
 * Promises are used to do asynchronous work and they are useful for
 * creating a chain of actions. In Excalibur they are used for loading,
 * sounds, animation, actions, and more.
 */
export class Promise<T> implements PromiseLike<T> {
  private _state: PromiseState = PromiseState.Pending;
  private _value: T;
  private _successCallbacks: { (value?: T): any }[] = [];
  private _rejectCallback: (value?: any) => any = () => {
    return;
  };
  private _errorCallback: (value?: any) => any;

  /**
   * Create and resolve a Promise with an optional value
   * @param value  An optional value to wrap in a resolved promise
   */
  public static resolve<T>(value?: T): Promise<T> {
    const promise = new Promise<T>().resolve(value);

    return promise;
  }

  /**
   * Create and reject a Promise with an optional value
   * @param value  An optional value to wrap in a rejected promise
   */
  public static reject<T>(value?: T): Promise<T> {
    const promise = new Promise<T>().reject(value);

    return promise;
  }

  /**
   * Returns a new promise that resolves when all the promises passed to it resolve, or rejects
   * when at least 1 promise rejects.
   */
  public static join<T>(promises: Promise<T>[]): Promise<T>;

  /**
   * Returns a new promise that resolves when all the promises passed to it resolve, or rejects
   * when at least 1 promise rejects.
   */
  public static join<T>(...promises: Promise<T>[]): Promise<T>;

  public static join<T>() {
    let promises: Promise<T>[] = [];

    if (arguments.length > 0 && !Array.isArray(arguments[0])) {
      for (let _i = 0; _i < arguments.length; _i++) {
        promises[_i - 0] = arguments[_i];
      }
    } else if (arguments.length === 1 && Array.isArray(arguments[0])) {
      promises = arguments[0];
    }

    const joinedPromise = new Promise<T>();
    if (!promises || !promises.length) {
      return joinedPromise.resolve();
    }

    const total = promises.length;
    let successes = 0;
    let rejects = 0;
    const errors: any = [];

    promises.forEach((p) => {
      p.then(
        () => {
          successes += 1;
          if (successes === total) {
            joinedPromise.resolve();
          } else if (successes + rejects + errors.length === total) {
            joinedPromise.reject(errors);
          }
        },
        () => {
          rejects += 1;
          if (successes + rejects + errors.length === total) {
            joinedPromise.reject(errors);
          }
        }
      ).error((e) => {
        errors.push(e);
        if (errors.length + successes + rejects === total) {
          joinedPromise.reject(errors);
        }
      });
    });

    return joinedPromise;
  }

  /**
   * Chain success and reject callbacks after the promise is resolved
   * @param successCallback  Call on resolution of promise
   * @param rejectCallback   Call on rejection of promise
   */
  public then(successCallback?: (value?: T) => any, rejectCallback?: (value?: any) => any) {
    if (successCallback) {
      this._successCallbacks.push(successCallback);

      // If the promise is already resolved call immediately
      if (this.state() === PromiseState.Resolved) {
        try {
          successCallback.call(this, this._value);
        } catch (e) {
          this._handleError(e);
        }
      }
    }
    if (rejectCallback) {
      this._rejectCallback = rejectCallback;

      // If the promise is already rejected call immediately
      if (this.state() === PromiseState.Rejected) {
        try {
          rejectCallback.call(this, this._value);
        } catch (e) {
          this._handleError(e);
        }
      }
    }

    return this;
  }

  /**
   * Add an error callback to the promise
   * @param errorCallback  Call if there was an error in a callback
   */
  public error(errorCallback?: (value?: any) => any) {
    if (errorCallback) {
      this._errorCallback = errorCallback;
    }
    return this;
  }

  /**
   * Resolve the promise and pass an option value to the success callbacks
   * @param value  Value to pass to the success callbacks
   */
  public resolve(value?: T): Promise<T> {
    if (this._state === PromiseState.Pending) {
      this._value = value;
      try {
        this._state = PromiseState.Resolved;
        this._successCallbacks.forEach((cb) => {
          cb.call(this, this._value);
        });
      } catch (e) {
        this._handleError(e);
      }
    } else {
      throw new Error('Cannot resolve a promise that is not in a pending state!');
    }
    return this;
  }

  /**
   * Reject the promise and pass an option value to the reject callbacks
   * @param value  Value to pass to the reject callbacks
   */
  public reject(value?: any) {
    if (this._state === PromiseState.Pending) {
      this._value = value;
      try {
        this._state = PromiseState.Rejected;
        this._rejectCallback.call(this, this._value);
      } catch (e) {
        this._handleError(e);
      }
    } else {
      throw new Error('Cannot reject a promise that is not in a pending state!');
    }
    return this;
  }

  /**
   * Inspect the current state of a promise
   */
  public state(): PromiseState {
    return this._state;
  }

  private _handleError(e: any) {
    if (this._errorCallback) {
      this._errorCallback.call(this, e);
    } else {
      // rethrow error
      throw e;
    }
  }
}
