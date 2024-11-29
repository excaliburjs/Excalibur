import { Vector, vec } from '../Math/vector';
import { Clock } from './Clock';
import { Future } from './Future';

/**
 * Find the screen position of an HTML element
 */
export function getPosition(el: HTMLElement): Vector {
  // do we need the scroll too? technically the offset method before did that
  if (el && el.getBoundingClientRect) {
    const rect = el.getBoundingClientRect();
    return vec(rect.x + window.scrollX, rect.y + window.scrollY);
  }
  return Vector.Zero;
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

/**
 * Remove keys from object literals
 * @param object
 * @param keys
 */
export function omit<TObject extends Object, Keys extends keyof TObject>(object: TObject, keys: Keys[]) {
  const newObj: Omit<TObject, Keys> = {} as any;
  for (const key in object) {
    if (!keys.includes(key as any)) {
      (newObj as any)[key] = object[key];
    }
  }
  return newObj;
}

/**
 * Simple object check.
 * @param item
 */
export function isObject(item: any): item is object {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge two objects.
 * @param target
 * @param sources
 */
export function mergeDeep<T extends object>(target: T, ...sources: T[]) {
  if (!sources.length) {
    return target;
  }
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, { [key]: {} });
        }
        mergeDeep(target[key] as any, source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}
