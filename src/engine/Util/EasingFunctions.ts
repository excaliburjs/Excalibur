import { Vector } from '../Math/vector';

/**
 * A definition of an EasingFunction. See {@apilink EasingFunctions}.
 * @deprecated
 */
// tslint:disable-next-line
export interface EasingFunction<TValueToEase = number> {
  (currentTime: number, startValue: TValueToEase, endValue: TValueToEase, duration: number): TValueToEase;
}

export function isLegacyEasing(x?: Function): x is EasingFunction {
  return !!x && x.length === 4;
}

/**
 * Standard easing functions for motion in Excalibur, defined on a domain of [0, duration] and a range from [+startValue,+endValue]
 * Given a time, the function will return a value from positive startValue to positive endValue.
 *
 * ```js
 * function Linear (t) {
 *    return t * t;
 * }
 *
 * // accelerating from zero velocity
 * function EaseInQuad (t) {
 *    return t * t;
 * }
 *
 * // decelerating to zero velocity
 * function EaseOutQuad (t) {
 *    return t * (2 - t);
 * }
 *
 * // acceleration until halfway, then deceleration
 * function EaseInOutQuad (t) {
 *    return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
 * }
 *
 * // accelerating from zero velocity
 * function EaseInCubic (t) {
 *    return t * t * t;
 * }
 *
 * // decelerating to zero velocity
 * function EaseOutCubic (t) {
 *    return (--t) * t * t + 1;
 * }
 *
 * // acceleration until halfway, then deceleration
 * function EaseInOutCubic (t) {
 *    return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
 * }
 * ```
 *
 * @deprecated
 */
export class EasingFunctions {
  /**
   * @deprecated
   */
  public static CreateReversibleEasingFunction(easing: EasingFunction): EasingFunction {
    return (time: number, start: number, end: number, duration: number) => {
      if (end < start) {
        return start - (easing(time, end, start, duration) - end);
      } else {
        return easing(time, start, end, duration);
      }
    };
  }

  /**
   * @deprecated
   */
  public static CreateVectorEasingFunction(easing: EasingFunction<number>): EasingFunction<Vector> {
    return (time: number, start: Vector, end: Vector, duration: number) => {
      return new Vector(easing(time, start.x, end.x, duration), easing(time, start.y, end.y, duration));
    };
  }

  /**
   * @deprecated use ex.linear
   */
  public static Linear: EasingFunction = EasingFunctions.CreateReversibleEasingFunction(
    (currentTime: number, startValue: number, endValue: number, duration: number) => {
      endValue = endValue - startValue;
      return (endValue * currentTime) / duration + startValue;
    }
  );

  /**
   * @deprecated use ex.easeInQuad
   */
  public static EaseInQuad = EasingFunctions.CreateReversibleEasingFunction(
    (currentTime: number, startValue: number, endValue: number, duration: number) => {
      endValue = endValue - startValue;
      currentTime /= duration;

      return endValue * currentTime * currentTime + startValue;
    }
  );

  /**
   * @deprecated ex.easeOutQuad
   */
  public static EaseOutQuad: EasingFunction = EasingFunctions.CreateReversibleEasingFunction(
    (currentTime: number, startValue: number, endValue: number, duration: number) => {
      endValue = endValue - startValue;
      currentTime /= duration;
      return -endValue * currentTime * (currentTime - 2) + startValue;
    }
  );

  /**
   * @deprecated ex.easeInOutQuad
   */
  public static EaseInOutQuad: EasingFunction = EasingFunctions.CreateReversibleEasingFunction(
    (currentTime: number, startValue: number, endValue: number, duration: number) => {
      endValue = endValue - startValue;
      currentTime /= duration / 2;

      if (currentTime < 1) {
        return (endValue / 2) * currentTime * currentTime + startValue;
      }
      currentTime--;

      return (-endValue / 2) * (currentTime * (currentTime - 2) - 1) + startValue;
    }
  );

  /**
   * @deprecated ex.easeInCubic
   */
  public static EaseInCubic: EasingFunction = EasingFunctions.CreateReversibleEasingFunction(
    (currentTime: number, startValue: number, endValue: number, duration: number) => {
      endValue = endValue - startValue;
      currentTime /= duration;
      return endValue * currentTime * currentTime * currentTime + startValue;
    }
  );

  /**
   * @deprecated ex.easeOutCubic
   */
  public static EaseOutCubic: EasingFunction = EasingFunctions.CreateReversibleEasingFunction(
    (currentTime: number, startValue: number, endValue: number, duration: number) => {
      endValue = endValue - startValue;
      currentTime /= duration;
      currentTime--;
      return endValue * (currentTime * currentTime * currentTime + 1) + startValue;
    }
  );

  /**
   * @deprecated use ex.easeInOutCubic
   */
  public static EaseInOutCubic: EasingFunction = EasingFunctions.CreateReversibleEasingFunction(
    (currentTime: number, startValue: number, endValue: number, duration: number) => {
      endValue = endValue - startValue;
      currentTime /= duration / 2;
      if (currentTime < 1) {
        return (endValue / 2) * currentTime * currentTime * currentTime + startValue;
      }
      currentTime -= 2;
      return (endValue / 2) * (currentTime * currentTime * currentTime + 2) + startValue;
    }
  );
}
