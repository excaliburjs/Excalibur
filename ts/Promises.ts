
// Promises/A+ Spec http://promises-aplus.github.io/promises-spec/

module ex {
   export enum PromiseState {
      Resolved,
      Rejected,
      Pending,
   }

   export interface IPromise {
      then(successCallback?: (value?: any) => any, rejectCallback?: (value?: any) => any): IPromise;
      error(rejectCallback?: (value?: any) => any): IPromise;

      wrap(value?: any): IPromise;

      resolve(value?: any): IPromise;
      reject(value?: any): IPromise;

      state(): PromiseState;
   }

   export class Promise<T> implements IPromise {
      private _state: PromiseState = PromiseState.Pending;
      private value: T;
      private successCallbacks: { (value?: T): any }[] = [];
      private rejectCallback: (value?: any) => any = () => { };
      private errorCallback: (value?: any) => any = () => { };

      public static wrap<T>(value?: T): IPromise {
         var promise = (new Promise<T>()).resolve(value);

         return promise;
      }

      constructor() { }

      public then(successCallback?: (value?: T) => any, rejectCallback?: (value?: any) => any) {
         if (successCallback) {
            this.successCallbacks.push(successCallback);

            // If the promise is already resovled call immediately
            if (this.state() === PromiseState.Resolved) {
               try {
                  successCallback.call(this, this.value);
               } catch (e) {
                  this.handleError(e);
               }
            }
         }
         if (rejectCallback) {
            this.rejectCallback = rejectCallback;

            // If the promise is already rejected call immediately
            if (this.state() === PromiseState.Rejected) {
               try {
                  rejectCallback.call(this, this.value);
               } catch (e) {
                  this.handleError(e);
               }
            }
         }

         return this;
      }

      public error(errorCallback?: (value?: any) => any) {
         if (errorCallback) {
            this.errorCallback = errorCallback;
         }
         return this;
      }

      public resolve(value?: T) {
         if (this._state === PromiseState.Pending) {
            this.value = value;
            try {
               this._state = PromiseState.Resolved;
               this.successCallbacks.forEach((cb) => {
                  cb.call(this, this.value);
               });

            } catch (e) {
               this.handleError(e);
            }
         } else {
            throw new Error('Cannot resolve a promise that is not in a pending state!');
         }
         return this;
      }

      public reject(value?: any) {
         if (this._state === PromiseState.Pending) {
            this.value = value;
            try {
               this._state = PromiseState.Rejected;
               this.rejectCallback.call(this, this.value);
            } catch (e) {
               this.handleError(e);
            }
         } else {
            throw new Error('Cannot reject a promise that is not in a pending state!');
         }
         return this;
      }

      public state(): PromiseState {
         return this._state;
      }

      private handleError(e: any) {
         if (this.errorCallback) {
            this.errorCallback.call(this, e);
         }
      }
   }
}