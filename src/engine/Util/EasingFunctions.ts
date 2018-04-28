import { Vector } from '../Algebra';

/**
 * A definition of an EasingFunction. See [[EasingFunctions]].    
 */
export interface EasingFunction { // tslint:disable-line
   (currentTime: number, startValue: number, endValue: number, duration: number): number;
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
 */
export class EasingFunctions {
   public static CreateReversableEasingFunction(easing: EasingFunction) {
      return (time: number, start: number, end: number, duration: number) => {
         if (end < start) {
            return start - (easing(time, end, start, duration) - end);
         } else {
            return easing(time, start, end, duration);
         }
      };
   }
   
   public static CreateVectorEasingFunction(easing: EasingFunction) {
      return (time: number, start: Vector, end: Vector, duration: number) => {
         return new Vector(
            easing(time, start.x, end.x, duration),
            easing(time, start.y, end.y, duration)
         );
      };
   }

   public static Linear: EasingFunction = EasingFunctions.CreateReversableEasingFunction(
      (currentTime: number, startValue: number, endValue: number, duration: number)  => {
      endValue = (endValue - startValue);
      return endValue * currentTime / duration + startValue;
   });

   public static EaseInQuad = EasingFunctions.CreateReversableEasingFunction(
      (currentTime: number, startValue: number, endValue: number, duration: number) => {
      endValue = (endValue - startValue);
      currentTime /= duration;

      return endValue * currentTime * currentTime + startValue;
   });
   
   public static EaseOutQuad: EasingFunction = EasingFunctions.CreateReversableEasingFunction(
      (currentTime: number, startValue: number, endValue: number, duration: number) => {
      endValue = (endValue - startValue);
      currentTime /= duration;
      return -endValue * currentTime * (currentTime - 2) + startValue;
   });

   public static EaseInOutQuad: EasingFunction = EasingFunctions.CreateReversableEasingFunction(
      (currentTime: number, startValue: number, endValue: number, duration: number) => {
      endValue = (endValue - startValue);
      currentTime /= duration / 2;

      if (currentTime < 1) { return endValue / 2 * currentTime * currentTime + startValue; }
      currentTime--;

      return -endValue / 2 * (currentTime * (currentTime - 2) - 1) + startValue;
   });

   public static EaseInCubic: EasingFunction = EasingFunctions.CreateReversableEasingFunction(
      (currentTime: number, startValue: number, endValue: number, duration: number) => {
      endValue = (endValue - startValue);
      currentTime /= duration;
      return endValue * currentTime * currentTime * currentTime + startValue;
   });

   public static EaseOutCubic: EasingFunction = EasingFunctions.CreateReversableEasingFunction(
      (currentTime: number, startValue: number, endValue: number, duration: number) => {
      endValue = (endValue - startValue);
      currentTime /= duration;
      currentTime--;
      return endValue * (currentTime * currentTime * currentTime + 1) + startValue;
   });

   public static EaseInOutCubic: EasingFunction = EasingFunctions.CreateReversableEasingFunction(
      (currentTime: number, startValue: number, endValue: number, duration: number) => {
      endValue = (endValue - startValue);
      currentTime /= duration / 2;
      if (currentTime < 1) { return endValue / 2 * currentTime * currentTime * currentTime + startValue; }
      currentTime -= 2;
      return endValue / 2 * (currentTime * currentTime * currentTime + 2) + startValue;
   });
   
}