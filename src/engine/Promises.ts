/// <reference path="Log.ts" />
// Promises/A+ Spec http://promises-aplus.github.io/promises-spec/

module ex {
   /**
    * Valid states for a promise to be in
    * @class PromiseState
    */
   export enum PromiseState {
      /**
      @property Resolved {PromiseState}
      */
      Resolved,
      /**
      @property Rejected {PromiseState}
      */
      Rejected,
      /**
      @property Pending {PromiseState}
      */
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

   /**
    * Promises/A+ spec implementation of promises
    * @class Promise
    * @constructor
    */
   export class Promise<T> implements IPromise<T> {
      private _state: PromiseState = PromiseState.Pending;
      private value: T;
      private successCallbacks: { (value?: T): any }[] = [];
      private rejectCallback: (value?: any) => any = () => { };
      private errorCallback: (value?: any) => any;// = () => { };
      private logger : Logger = Logger.getInstance();

      /**
       * Wrap a value in a resolved promise
       * @method wrap<T>
       * @param [value=undefined] {T} An optional value to wrap in a resolved promise
       * @returns Promise&lt;T&gt;
       */
      public static wrap<T>(value?: T): Promise<T> {
         var promise = (new Promise<T>()).resolve(value);

         return promise;
      }

      /**
       * Returns a new promise that resolves when all the promises passed to it resolve, or rejects
       * when at least 1 promise rejects.
       * @param promises {Promise[]}
       * @returns Promise
       */
      public static join<T>(...promises: Promise<T>[]){
         var joinedPromise = new Promise<T>();
         if(!promises){
            return joinedPromise.resolve();
         }

         var total = promises.length;
         var successes = 0;
         var rejects = 0;
         var errors = [];
         promises.forEach((p)=>{
            p.then(
               ()=>{
                  successes += 1;
                  if(successes === total){
                     joinedPromise.resolve();
                  }else if(successes + rejects + errors.length === total){
                     joinedPromise.reject(errors);
                  }
               },
               ()=>{
                  rejects += 1;
                  if(successes + rejects + errors.length === total){
                     joinedPromise.reject(errors);
                  }
               }
            ).error((e) => {
               errors.push(e);
               if((errors.length + successes + rejects) === total){
                  joinedPromise.reject(errors);
               }
            });
         });


         return joinedPromise;
      }

      constructor() { }


      /**
       * Chain success and reject callbacks after the promise is resovled
       * @method then
       * @param successCallback {T=>any} Call on resolution of promise
       * @param rejectCallback {any=>any} Call on rejection of promise
       * @returns Promise&lt;T&gt;
       */
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

      /**
       * Add an error callback to the promise 
       * @method error
       * @param errorCallback {any=>any} Call if there was an error in a callback
       * @returns Promise&lt;T&gt;
       */
      public error(errorCallback?: (value?: any) => any) {
         if (errorCallback) {
            this.errorCallback = errorCallback;
         }
         return this;
      }

      /**
       * Resolve the promise and pass an option value to the success callbacks
       * @method resolve
       * @param [value=undefined] {T} Value to pass to the success callbacks
       */
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

      /**
       * Reject the promise and pass an option value to the reject callbacks
       * @method reject
       * @param [value=undefined] {T} Value to pass to the reject callbacks
       */
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

      /**
       * Inpect the current state of a promise
       * @method state
       * @returns PromiseState
       */
      public state(): PromiseState {
         return this._state;
      }

      private handleError(e: any) {
         if (this.errorCallback) {
            this.errorCallback.call(this, e);
         }else{
            // rethrow error
            throw e;
         }
      }
   }
}