import { RotationType } from './rotation-type';
import { TwoPI } from './util';
import { Vector } from './vector';

/**
 * Linear interpolation between `a` and `b`, at `time = 0` the value will be `a` at `time = 1` the value will be `b`
 * @param a
 * @param b
 * @param time
 */
export function lerp(a: number, b: number, time: number): number {
  return (1 - time) * a + b * time;
}

/**
 * Linear interpolation between angles in radians
 * @param startAngle
 * @param endAngle
 * @param rotationType
 * @param time
 */
export function lerpAngle(startAngle: number, endAngle: number, rotationType: RotationType, time: number): number {
  const shortestPathIsPositive = (startAngle - endAngle + TwoPI) % TwoPI >= Math.PI;
  const distance1 = Math.abs(endAngle - startAngle);
  const distance2 = TwoPI - distance1;
  let shortDistance = 0;
  let longDistance = 0;
  if (distance1 > distance2) {
    shortDistance = distance2;
    longDistance = distance1;
  } else {
    shortDistance = distance1;
    longDistance = distance2;
  }
  let distance = 0;
  let direction = 1;

  switch (rotationType) {
    case RotationType.ShortestPath:
      distance = shortDistance;
      direction = shortestPathIsPositive ? 1 : -1;
      break;
    case RotationType.LongestPath:
      distance = longDistance;
      direction = shortestPathIsPositive ? -1 : 1;
      break;
    case RotationType.Clockwise:
      direction = 1;
      distance = shortestPathIsPositive ? shortDistance : longDistance;
      break;
    case RotationType.CounterClockwise:
      direction = -1;
      distance = shortestPathIsPositive ? longDistance : shortDistance;
      break;
  }

  return startAngle + direction * (distance * time);
}

/**
 * Linear interpolation between `a` and `b`, at `time = 0` the value will be `a` at `time = 1` the value will be `b`
 * @param a
 * @param b
 * @param time
 */
export function lerpVector(a: Vector, b: Vector, time: number): Vector {
  return a.scale(1 - time).add(b.scale(time));
}

/**
 * Inverse of a linear interpolation, given a `value` in between `a` and `b` return how close to `a` or `b` the `value` is.
 *
 * Example: `a=1`, `b=5`, `value=4` will return `.75`
 * @param a
 * @param b
 * @param value
 */
export function inverseLerp(a: number, b: number, value: number): number {
  return (value - a) / (b - a);
}

/**
 * Inverse of a linear interpolation, given a `value` in between `a` and `b` return how close to `a` or `b` the `value` is.
 *
 * **Warning** assumes that the `value` vector is co-linear with vector `a` and `b`
 *
 * Example: `a=1`, `b=5`, `value=4` will return `.75`
 * @param a
 * @param b
 * @param value
 */
export function inverseLerpVector(a: Vector, b: Vector, value: Vector): number {
  const numerator = value.sub(a);
  const denominator = b.sub(a);
  const x = numerator.x / denominator.x;
  const y = numerator.y / denominator.y;
  return Math.min(x, y);
}

/**
 * Remaps a value from a source domain to a destination
 * @param minSource
 * @param maxSource
 * @param minDestination
 * @param maxDestination
 * @param value
 */
export function remap(minSource: number, maxSource: number, minDestination: number, maxDestination: number, value: number): number {
  const time = inverseLerp(minSource, maxSource, value);
  return lerp(minDestination, maxDestination, time);
}

/**
 * Remaps a value from a source domain to a destination
 *
 * **Warning** assumes that the `value` vector is co-linear with vector `minSource` and `maxSource`
 * @param minSource
 * @param maxSource
 * @param minDestination
 * @param maxDestination
 * @param value
 */
export function remapVector(minSource: Vector, maxSource: Vector, minDestination: Vector, maxDestination: Vector, value: Vector): Vector {
  const time = inverseLerpVector(minSource, maxSource, value);
  return lerpVector(minDestination, maxDestination, time);
}
