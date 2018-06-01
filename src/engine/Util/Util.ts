import { Vector } from '../Algebra';
import { Random } from '../Math/Random';
import { Side } from '../Collision/Side';
import * as Sound from 'Sound';

/**
 * Export ./Util/Sound
 */
export {
   Sound
};
/**
 * Two PI constant
 */
export const TwoPI: number = Math.PI * 2;

/**
 * Merges one or more objects into a single target object
 *
 * @param deep Whether or not to do a deep clone
 * @param target The target object to attach properties on
 * @param objects The objects whose properties to merge
 * @returns Merged object with properties from other objects
 */
export function extend(deep: boolean, target: any, ...objects: any[]): any;

/**
 * Merges one or more objects into a single target object
 *
 * @param target The target object to attach properties on
 * @param object2 The second object whose properties to merge
 * @returns Merged object with properties from other objects
 */
export function extend<T1, T2>(target: T1, object2: T2): T1 & T2;

/**
 * Merges one or more objects into a single target object
 *
 * @param target The target object to attach properties on
 * @param object2 The second object whose properties to merge
 * @param object3 The third object whose properties to merge
 * @returns Merged object with properties from other objects
 */
export function extend<T1, T2, T3>(target: T1, object2: T2, object3: T3): T1 & T2 & T3;

/**
 * Merges one or more objects into a single target object
 *
 * @param target The target object to attach properties on
 * @param objects The objects whose properties to merge
 * @returns Merged object with properties from other objects
 */
export function extend(target: any, ...objects: any[]): any;

/**
 * Merges one or more objects into a single target object
 *
 * @returns Merged object with properties from other objects
 * @credit https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
 */
export function extend() {
   var extended: { [key: string]: any } = {};
   var deep = false;
   var i = 0;
   var length = arguments.length;

   // Check if a deep merge
   if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
      deep = arguments[0];
      i++;
   }

   // Merge the object into the extended object
   var assignExists = typeof (<any>Object).assign === 'function';
   var merge = null;
   if (!assignExists) {
      merge = function (obj: any) {
         for (var prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
               // If deep merge and property is an object, merge properties
               if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                  extended[prop] = extend(true, extended[prop], obj[prop]);
               } else {
                  extended[prop] = obj[prop];
               }
            }
         }
      };
   } else {
      merge = (<any>Object).assign;
   }

   // Loop through each object and conduct a merge
   for (; i < length; i++) {
      var obj = arguments[i];
      if (!assignExists) {
         merge(obj);
      } else {
         merge(extended, obj);
      }
   }

   return extended;
}

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

/**
 * Clamps a value between a min and max inclusive
 */
export function clamp(val: number, min: number, max: number) {
   return Math.min(Math.max(min, val), max);
}

export function randomInRange(min: number, max: number, random: Random = new Random()): number {
   return random ? random.floating(min, max) : min + Math.random() * (max - min);
}

export function randomIntInRange(min: number, max: number, random: Random = new Random()): number {
   return random ? random.integer(min, max) : Math.round(randomInRange(min, max));
}

export function canonicalizeAngle(angle: number): number {
   var tmpAngle = angle;
   if (angle > TwoPI) {
      while (tmpAngle > TwoPI) {
         tmpAngle -= TwoPI;
      }
   }

   if (angle < 0) {
      while (tmpAngle < 0) {
         tmpAngle += TwoPI;
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

export function getPosition(el: HTMLElement): Vector {
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

   return new Vector(oLeft, oTop);
}

export function addItemToArray<T>(item: T, array: T[]): boolean {
   if (array.indexOf(item) === -1) {
      array.push(item);
      return true;
   }
   return false;
}

export function removeItemFromArray<T>(item: T, array: T[]): boolean {
   var index = -1;
   if ((index = array.indexOf(item)) > -1) {
      array.splice(index, 1);
      return true;
   }

   return false;
}

export function contains(array: Array<any>, obj: any): boolean {
   for (var i = 0; i < array.length; i++) {
      if (array[i] === obj) {
         return true;
      }
   }
   return false;
}

export function getOppositeSide(side: Side) {
   if (side === Side.Top) { return Side.Bottom; }
   if (side === Side.Bottom) { return Side.Top; }
   if (side === Side.Left) { return Side.Right; }
   if (side === Side.Right) { return Side.Left; }

   return Side.None;
}

export function getSideFromVector(direction: Vector) {
   var directions = [Vector.Left, Vector.Right, Vector.Up, Vector.Down];
   var directionEnum = [Side.Left, Side.Right, Side.Top, Side.Bottom];

   var max = -Number.MAX_VALUE;
   var maxIndex = -1;
   for (var i = 0; i < directions.length; i++) {
      if (directions[i].dot(direction) > max) {
         max = directions[i].dot(direction);
         maxIndex = i;
      }
   }
   return directionEnum[maxIndex];
}

/**
 * Excalibur's dynamically resizing collection
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
    * @param index  Index of element to retrieve
    */
   public elementAt(index: number): T {
      if (index >= this.count()) {
         //Logger.getInstance().error('Invalid parameter: ' + index);
         throw new Error('Invalid index ' + index);
      }
      return this._internalArray[index];
   }

   /**
    * Inserts an element at a specific index
    * @param index  Index to insert the element
    * @param value  Element to insert
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
      if (count === 0) {
        //Logger.getInstance().error('Invalid parameter: ' + index);
         throw new Error('Invalid parameter ' + index);
       }
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
    * @param element  Element to retrieve
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
