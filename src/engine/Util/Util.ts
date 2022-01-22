import { Vector } from '../Math/vector';
import { Side } from '../Collision/Side';
import { Clock } from './Clock';

// TODO remove in v0.26.0
// Re-export hack to deprecate import site gently
import {
  TwoPI as lTwoPI,
  clamp as lclamp,
  randomInRange as lrandomInRange,
  randomIntInRange as lrandomIntInRange,
  canonicalizeAngle as lcanonicalizeAngle,
  toDegrees as ltoDegrees,
  toRadians as ltoRadians,
  range as lrange
} from '../Math/util';

/**
 * @deprecated ex.Util.TwoPI import site will be removed in v0.26.0, use ex.TwoPI
 */
export const TwoPI = lTwoPI;

/**
 * @deprecated ex.Util.clamp import site will be removed in v0.26.0, use ex.clamp
 */
export const clamp = lclamp;

/**
 * @deprecated ex.Util.randomInRange import site will be removed in v0.26.0, use ex.randomInRange
 */
export const randomInRange = lrandomInRange;

/**
 * @deprecated ex.Util.randomIntInRange import site will be removed in v0.26.0, use ex.randomIntInRange
 */
export const randomIntInRange = lrandomIntInRange;

/**
 * @deprecated ex.Util.canonicalizeAngle import site will be removed in v0.26.0, use ex.canonicalizeAngle
 */
export const canonicalizeAngle = lcanonicalizeAngle;

/**
 * @deprecated ex.Util.toDegrees import site will be removed in v0.26.0, use ex.toDegrees
 */
export const toDegrees = ltoDegrees;

/**
 * @deprecated ex.Util.toRadians import site will be removed in v0.26.0, use ex.toRadians
 */
export const toRadians = ltoRadians;

/**
 * @deprecated ex.Util.range import site will be removed in v0.26.0, use ex.range
 */
export const range = lrange;

// TODO END REMOVE in v0.26.0

/**
 * Find the screen position of an HTML element
 */
export function getPosition(el: HTMLElement): Vector {
  let oLeft: number = 0,
    oTop: number = 0;

  const calcOffsetLeft = (parent: HTMLElement) => {
    oLeft += parent.offsetLeft;

    if (parent.offsetParent) {
      calcOffsetLeft(<HTMLElement>parent.offsetParent);
    }
  };
  const calcOffsetTop = (parent: HTMLElement) => {
    oTop += parent.offsetTop;
    if (parent.offsetParent) {
      calcOffsetTop(<HTMLElement>parent.offsetParent);
    }
  };

  calcOffsetLeft(el);
  calcOffsetTop(el);

  return new Vector(oLeft, oTop);
}

/**
 * Add an item to an array list if it doesn't already exist. Returns true if added, false if not and already exists in the array.
 * @deprecated Will be removed in v0.26.0
 */
export function addItemToArray<T>(item: T, array: T[]): boolean {
  if (array.indexOf(item) === -1) {
    array.push(item);
    return true;
  }
  return false;
}

/**
 * Remove an item from an list
 * @deprecated Will be removed in v0.26.0
 */
export function removeItemFromArray<T>(item: T, array: T[]): boolean {
  let index = -1;
  if ((index = array.indexOf(item)) > -1) {
    array.splice(index, 1);
    return true;
  }

  return false;
}

/**
 * See if an array contains something
 */
export function contains(array: Array<any>, obj: any): boolean {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === obj) {
      return true;
    }
  }
  return false;
}

/**
 * Get the opposite side
 * TODO: Move to Side type
 * @deprecated Will be removed in v0.26.0
 */
export function getOppositeSide(side: Side) {
  if (side === Side.Top) {
    return Side.Bottom;
  }
  if (side === Side.Bottom) {
    return Side.Top;
  }
  if (side === Side.Left) {
    return Side.Right;
  }
  if (side === Side.Right) {
    return Side.Left;
  }

  return Side.None;
}

/**
 * Returns the side in the direction of the vector supplied
 * @param direction Vector to check
 * @deprecated
 * TODO: Move to Side type
 */
export function getSideFromDirection(direction: Vector) {
  const directions = [Vector.Left, Vector.Right, Vector.Up, Vector.Down];
  const directionEnum = [Side.Left, Side.Right, Side.Top, Side.Bottom];

  let max = -Number.MAX_VALUE;
  let maxIndex = -1;
  for (let i = 0; i < directions.length; i++) {
    if (directions[i].dot(direction) > max) {
      max = directions[i].dot(direction);
      maxIndex = i;
    }
  }
  return directionEnum[maxIndex];
}

/**
 * Excalibur's dynamically resizing collection
 * @deprecated Will be removed v0.26.0
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
    const newSize = this._internalArray.length * 2;
    const newArray = new Array<T>(newSize);
    const count = this.count();
    for (let i = 0; i < count; i++) {
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
    return (this._internalArray[this._endPointer++] = element);
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
    return (this._internalArray[index] = value);
  }

  /**
   * Removes an element at a specific index
   * @param index  Index of element to remove
   */
  public remove(index: number): T {
    const count = this.count();
    if (count === 0) {
      //Logger.getInstance().error('Invalid parameter: ' + index);
      throw new Error('Invalid parameter ' + index);
    }
    // O(n) Shift
    const removed = this._internalArray[index];
    for (let i = index; i < count; i++) {
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
    const index = this._internalArray.indexOf(element);
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
    let i = 0;
    const count = this.count();
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
    const count = this.count();
    for (let i = 0; i < count; i++) {
      this._internalArray[i] = func.call(this, this._internalArray[i], i);
    }
  }
}

/**
 * Used for exhaustive checks at compile time
 */
export function fail(message: never): never {
  throw new Error(message);
}

/**
 * Create a promise that resolves after a certain number of milliseconds
 *
 * It is strongly recommended you pass the excalibur clock so delays are bound to the
 * excalibur clock which would be unaffected by stop/pause.
 * @param milliseconds
 * @param clock
 */
export function delay(milliseconds: number, clock?: Clock): Promise<void> {
  const schedule = clock?.schedule.bind(clock) ?? setTimeout;
  return new Promise<void>(resolve => {
    schedule(() => {
      resolve();
    }, milliseconds);
  });
}
