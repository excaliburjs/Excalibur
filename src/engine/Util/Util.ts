import { Vector } from '../Math/vector';
import { Clock } from './Clock';
import { Future } from './Future';

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
  const future = new Future<void>();
  const schedule = clock?.schedule.bind(clock) ?? setTimeout;
  schedule(() => {
    future.resolve();
  }, milliseconds);
  return future.promise;
}
