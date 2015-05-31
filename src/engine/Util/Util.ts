/// <reference path="../Algebra.ts"/>
/// <reference path="../Events.ts"/>

/**
 * Utilities
 *
 * Excalibur utilities for math, string manipulation, etc.
 */
module ex.Util {
   
   export var TwoPI: number = Math.PI * 2;

   export function base64Encode(inputStr: string) {
      var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      var outputStr = '';
      var i = 0;

      while (i < inputStr.length) {
         //all three "& 0xff" added below are there to fix a known bug 
         //with bytes returned by xhr.responseText
         var byte1 = inputStr.charCodeAt(i++) & 0xff;
         var byte2 = inputStr.charCodeAt(i++) & 0xff;
         var byte3 = inputStr.charCodeAt(i++) & 0xff;

         var enc1 = byte1 >> 2;
         var enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);

         var enc3, enc4;
         if (isNaN(byte2)) {
            enc3 = enc4 = 64;
         } else {
            enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
            if (isNaN(byte3)) {
               enc4 = 64;
            } else {
               enc4 = byte3 & 63;
            }
         }

         outputStr += b64.charAt(enc1) + b64.charAt(enc2) + b64.charAt(enc3) + b64.charAt(enc4);
      }

      return outputStr;
   }

   export function clamp(val, min, max) {
      return val <= min ? min : (val >= max ? max : val);
   }

   export function drawLine(ctx: CanvasRenderingContext2D, color: string, startx, starty, endx, endy) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.moveTo(startx, starty);
      ctx.lineTo(endx, endy);
      ctx.closePath();
      ctx.stroke();  
   }

   export function randomInRange(min: number, max: number) : number {
      return min + Math.random() * (max - min);
   }

   export function randomIntInRange(min: number, max: number): number {
      return Math.round(randomInRange(min, max));
   }

   export function canonicalizeAngle(angle: number): number {
      var tmpAngle = angle;
      if(angle > this.TwoPI) {
         while(tmpAngle > this.TwoPI) {
            tmpAngle -= this.TwoPI;
         }
      }

      if(angle < 0) {
         while(tmpAngle < 0) {
            tmpAngle += this.TwoPI;
         }
      }
      return tmpAngle;
   }

   export function toDegrees(radians: number): number {
      return 180 / Math.PI * radians;
   }

   export function toRadians(degrees: number): number {
      return degrees / 180 * Math.PI;
   }

   export function getPosition(el: HTMLElement): Point {
      var oLeft: number = 0,
          oTop: number = 0;

      var calcOffsetLeft = (parent: HTMLElement) => {
         oLeft += parent.offsetLeft; 

         if (parent.offsetParent) {
            calcOffsetLeft(<HTMLElement>parent.offsetParent);
         }                 
      };
      var calcOffsetTop = (parent: HTMLElement) => {
         oTop += parent.offsetTop;  
         if (parent.offsetParent) {
            calcOffsetTop(<HTMLElement>parent.offsetParent);
         }                
      };

      calcOffsetLeft(el);
      calcOffsetTop(el);

      return new Point(oLeft, oTop);
   }

   export function addItemToArray<T>(item: T, array: T[]): boolean {
      if (array.indexOf(item) === -1) {
         array.push(item);
         return true;
      }
      return false;
   }

   export function removeItemToArray<T>(item: T, array: T[]): boolean {
      var index = -1;
      if ((index = array.indexOf(item)) > -1) {
         array.splice(index, 1);
         return true;
      }

      return false;
   }

   export function getOppositeSide(side: ex.Side) {
      if(side === ex.Side.Top) { return ex.Side.Bottom; }
      if(side === ex.Side.Bottom) { return ex.Side.Top; }
      if(side === ex.Side.Left) { return ex.Side.Right; }
      if(side === ex.Side.Right) { return ex.Side.Left; }

      return ex.Side.None;
   }

   /**
    * Excaliburs dynamically resizing collection
    */
   export class Collection<T> {
      /**
       * Default collection size
       */
      public static DefaultSize = 200;
      private _internalArray: T[] = null;
      private _endPointer: number = 0;

      /**
       * @param initialSize  Initial size of the internal backing array
       */
      constructor(initialSize: number = Collection.DefaultSize) {
         this._internalArray = new Array<T>(initialSize);
      } 

      private _resize() {
         var newSize = this._internalArray.length * 2;
         var newArray = new Array<T>(newSize);
         var count = this.count();
         for (var i = 0; i < count; i++) {
            newArray[i] = this._internalArray[i];
         }

         delete this._internalArray;
         this._internalArray = newArray;
      }

      /**
       * Push elements to the end of the collection
       */
      public push(element: T): T {
         if (this._endPointer === this._internalArray.length) {
            this._resize();
         }
         return this._internalArray[this._endPointer++] = element;
      }

      /**
       * Removes elements from the end of the collection
       */
      public pop(): T {
         this._endPointer = this._endPointer - 1 < 0 ? 0 : this._endPointer - 1;
         return this._internalArray[this._endPointer];
      }

      /**
       * Returns the count of the collection
       */
      public count(): number {
         return this._endPointer;
      }

      /**
       * Empties the collection
       */
      public clear() {
         this._endPointer = 0;
      }

      /**
       * Returns the size of the internal backing array
       */
      public internalSize(): number {
         return this._internalArray.length;   
      }

      /**
       * Returns an element at a specific index
       * @param index  Index of element to retreive
       */
      public elementAt(index: number): T {
         if (index >= this.count()) {
            return;
         }
         return this._internalArray[index];
      }

      /**
       * Inserts an element at a specific index
       * @param index  Index to insert the element
       */
      public insert(index: number, value: T): T {
         if (index >= this.count()) {
            this._resize();
         }
         return this._internalArray[index] = value;
      }

      /**
       * Removes an element at a specific index
       * @param index  Index of element to remove
       */
      public remove(index: number): T {
         var count = this.count();
         if (count === 0) { return; }
         // O(n) Shift 
         var removed = this._internalArray[index];
         for (var i = index; i < count; i++) {
            this._internalArray[i] = this._internalArray[i + 1];
         }
         this._endPointer--;
         return removed;
      }

      /**
       * Removes an element by reference
       * @param element  Element to retreive
       */
      public removeElement(element: T) {
         var index = this._internalArray.indexOf(element);
         this.remove(index);
      }

      /**
       * Returns a array representing the collection
       */
      public toArray(): T[] {
         return this._internalArray.slice(0, this._endPointer);
      }

      /**
       * Iterate over every element in the collection
       * @param func  Callback to call for each element passing a reference to the element and its index, returned values are ignored
       */
      public forEach(func: (element: T, index: number) => any) {
         var i = 0, count = this.count();
         for (i; i < count; i++) {
            func.call(this, this._internalArray[i], i);
         }
      }

      /**
       * Mutate every element in the collection
       * @param func  Callback to call for each element passing a reference to the element and its index, any values returned mutate 
       * the collection
       */
      public map(func: (element: T, index: number) => any) {
         var count = this.count();
         for (var i = 0; i < count; i++) {
            this._internalArray[i] = func.call(this, this._internalArray[i], i);
         }
      }
   }
}