
// Promises/A+ Spec http://promises-aplus.github.io/promises-spec/

module ex {
   export enum PromiseState {
      Resolved,
      Rejected,
      Pending,
   }

   export interface IPromise<T> {
      then(successCallback?: (value?: T) => any, rejectCallback?: (value?: T) => any): IPromise<T>;
      error(rejectCallback?: (value?: any) => any): IPromise<T>;

      //Cannot define static methods on interfaces
      //wrap<T>(value?: T): IPromise<T>;

      resolve(value?: T): IPromise<T>;
      reject(value?: any): IPromise<T>;

      state(): PromiseState;
   }

   export class Promise<T> implements IPromise<T> {
      private _state: PromiseState = PromiseState.Pending;
      private value: T;
      private successCallbacks: { (value?: T): any }[] = [];
      private rejectCallback: (value?: any) => any = () => { };
      private errorCallback: (value?: any) => any;// = () => { };
      private logger : Logger = Logger.getInstance();

      public static wrap<T>(value?: T): Promise<T> {
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

      public resolve(value?: T) : Promise<T>{
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
         }else{
            this.logger.error("The error:", e, "was thrown in your promise callback");
         }
      }
   }
}