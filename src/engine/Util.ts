/// <reference path="Algebra.ts"/>
/// <reference path="Events.ts"/>

module ex.Util {
   
   export var TwoPI: number = Math.PI * 2;

   export function base64Encode(inputStr: string) {
      var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      var outputStr = "";
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
         }
         else {
            enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
            if (isNaN(byte3)) {
               enc4 = 64;
            }
            else {
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
      ctx.strokeStyle = color
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
         while(tmpAngle > this.TwoPI){
            tmpAngle -= this.TwoPI;
         }
      }

      if(angle < 0){
         while(tmpAngle < 0){
            tmpAngle += this.TwoPI;
         }
      }
      return tmpAngle;
   }

   export function toDegrees(radians: number): number {
      return 180/Math.PI * radians;
   }

   export function toRadians(degrees: number): number {
      return degrees/180 * Math.PI;
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

   export function addItemToArray<T>(item: T, array: T[]) {
      if (array.indexOf(item) === -1) {
         array.push(item);
      }
   }

   export function removeItemToArray<T>(item: T, array: T[]) {
      var index = -1;
      if ((index = array.indexOf(item)) > -1) {
         array.splice(index, 1);
      }
   }

   export function getOppositeSide(side: ex.Side){
      if(side === ex.Side.Top) return ex.Side.Bottom;
      if(side === ex.Side.Bottom) return ex.Side.Top;
      if(side === ex.Side.Left) return ex.Side.Right;
      if(side === ex.Side.Right) return ex.Side.Left

      return ex.Side.None
   }

   /**
    * Excaliburs dynamically resizing collection
    * @class Collection
    * @constructor
    * @param [initialSize=200] {number} Initial size of the internal backing array
    */
   export class Collection<T> {
      /**
       * Default collection size
       * @property DefaultSize {number}
       * @static
       * @final
       */
      public static DefaultSize = 200;
      private internalArray: T[] = null;
      private endPointer: number = 0;


      constructor(initialSize?: number) {
         var size = initialSize || Collection.DefaultSize;
         this.internalArray = new Array<T>(size);
      } 

      private resize() {
         var newSize = this.internalArray.length * 2;
         var newArray = new Array<T>(newSize);
         var count = this.count();
         for (var i = 0; i < count; i++) {
            newArray[i] = this.internalArray[i];
         }

         delete this.internalArray;
         this.internalArray = newArray;
      }

      /**
       * Push elements to the end of the collection
       * @method push
       * @param element {T}
       * @returns T
       */
      public push(element: T): T {
         if (this.endPointer === this.internalArray.length) {
            this.resize();
         }
         return this.internalArray[this.endPointer++] = element;
      }

      /**
       * Removes elements from the end of the collection
       * @method pop
       * @returns T
       */
      public pop(): T {
         this.endPointer = this.endPointer - 1 < 0 ? 0 : this.endPointer - 1;
         return this.internalArray[this.endPointer];
      }

      /**
       * Returns the count of the collection
       * @method count
       * @returns number
       */
      public count(): number {
         return this.endPointer;
      }

      /**
       * Empties the collection
       * @method clear
       */
      public clear() {
         this.endPointer = 0;
      }

      /**
       * Returns the size of the internal backing array
       * @method internalSize
       * @returns number
       */
      public internalSize(): number {
         return this.internalArray.length;   
      }

      /**
       * Returns an element at a specific index
       * @method elementAt
       * @param index {number} Index of element to retreive
       * @returns T
       */
      public elementAt(index: number): T {
         if (index >= this.count()) {
            return;
         }
         return this.internalArray[index];
      }

      /**
       * Inserts an element at a specific index
       * @method insert
       * @param index {number} Index to insert the element
       * @returns T
       */
      public insert(index: number, value: T): T {
         if (index >= this.count()) {
            this.resize();
         }
         return this.internalArray[index] = value;
      }

      /**
       * Removes an element at a specific index
       * @method remove
       * @param index {number} Index of element to remove
       * @returns T
       */
      public remove(index: number): T {
         var count = this.count();
         if (count === 0) return;
         // O(n) Shift 
         var removed = this.internalArray[index];
         for (var i = index; i < count; i++) {
            this.internalArray[i] = this.internalArray[i + 1];
         }
         this.endPointer--;
         return removed;
      }

      /**
       * Removes an element by reference
       * @method removeElement
       * @param element {T} Index of element to retreive
       */
      public removeElement(element: T) {
         var index = this.internalArray.indexOf(element);
         this.remove(index);
      }

      /**
       * Returns a array representing the collection
       * @method toArray
       * @returns T[]
       */
      public toArray(): T[] {
         return this.internalArray.slice(0, this.endPointer);
      }

      /**
       * Iterate over every element in the collection
       * @method forEach
       * @param func {(T,number)=>any} Callback to call for each element passing a reference to the element and its index, returned values are ignored
       */
      public forEach(func: (element: T, index: number) => any) {
         var count = this.count();
         for (var i = 0; i < count; i++) {
            func.call(this, this.internalArray[i], i);
         }
      }

      /**
       * Mutate every element in the collection
       * @method map
       * @param func {(T,number)=>any} Callback to call for each element passing a reference to the element and its index, any values returned mutate the collection
       */
      public map(func: (element: T, index: number) => any) {
         var count = this.count();
         for (var i = 0; i < count; i++) {
            this.internalArray[i] = func.call(this, this.internalArray[i], i);
         }
      }
   }
}