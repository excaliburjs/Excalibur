/**
Copyright (c) 2013 Erik Onarheim
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.
3. All advertising materials mentioning features or use of this software
   must display the following acknowledgement:
   This product includes software developed by the ExcaliburJS Team.
4. Neither the name of the creator nor the
   names of its contributors may be used to endorse or promote products
   derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE EXCALIBURJS TEAM ''AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE EXCALIBURJS TEAM BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSIENSS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

// Promises/A+ Spec http://promises-aplus.github.io/promises-spec/

enum PromiseState {
   Resolved,
   Rejected,
   Pending,
}

interface IPromise {
   then(successCallback? : (value? : any) => any, rejectCallback? : (value? : any) => any) : IPromise;
   error(rejectCallback? : (value? : any) => any) : IPromise;

   wrap(value? : any) : IPromise;

   resolve(value? : any) : IPromise;
   reject(value? : any) : IPromise;

   state() : PromiseState;
}

class Promise implements IPromise {
   private _state : PromiseState = PromiseState.Pending;
   private value : any;
   private successCallbacks : {(value? : any) : any}[] = [];
   private rejectCallback : (value? : any) => any = ()=>{};
   private errorCallback : (value? : any) => any = ()=>{};

   public static wrap(value? : any) : IPromise {
      if(value instanceof Promise){
         return value;
      }

      var promise = (new Promise()).resolve(value);

      return promise;
   }

   constructor(){}

   public then(successCallback? : (value? : any) => any, rejectCallback? : (value? : any) => any){
      if(successCallback){
         this.successCallbacks.push(successCallback);

         // If the promise is already resovled call immediately
         if(this.state() === PromiseState.Resolved){
            try {
               successCallback.call(this, this.value);
            } catch (e) {
               this.handleError(e);
            }
         }
      }
      if(rejectCallback){
         this.rejectCallback = rejectCallback;

         // If the promise is already rejected call immediately
         if(this.state() === PromiseState.Rejected){
            try {
               rejectCallback.call(this, this.value);   
            } catch (e) {
               this.handleError(e);
            }            
         }
      }

      return this;
   }

   public error(errorCallback? : (value? : any) => any){
      if(errorCallback){
         this.errorCallback = errorCallback;
      }
      return this;
   }

   public resolve(value? : any) {
      if(this._state === PromiseState.Pending){
         this.value = value;         
         try {
            this._state = PromiseState.Resolved;
            this.successCallbacks.forEach((cb)=>{
               cb.call(this, this.value);
            });            
            
         } catch (e){
            this.handleError(e);
         }
      }else{
         throw new Error('Cannot resolve a promise that is not in a pending state!');
      }
      return this;
   }

   public reject(value? : any) {
      if(this._state === PromiseState.Pending){
         this.value = value;
         try {
            this._state = PromiseState.Rejected;         
            this.rejectCallback.call(this, this.value);
         } catch (e) {
            this.handleError(e);
         }
      }else{
         throw new Error('Cannot reject a promise that is not in a pending state!');
      }
      return this;
   }

   public state() : PromiseState {
      return this._state;
   }

   private handleError(e : any){
      if(this.errorCallback){
         this.errorCallback.call(this, e);
      }
   }
}