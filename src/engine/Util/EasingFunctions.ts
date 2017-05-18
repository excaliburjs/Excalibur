/**
 * A definition of an EasingFunction. See [[EasingFunctions]].    
 */
export interface EasingFunction { // tslint:disable-line
   (currentTime: number, startValue: number, endValue: number, duration: number): number;
}

/**
 * A definition of the cubic Bezier curve. See [[EasingFunctions]].    
 */
export interface IBezierInput {
   (currentTime: number, point1: number, point2: number, point3: number, point4: number): number;
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
 *
 * // the cubic bezier function, which draws a smooth curve according to the provided points
 * function CubicBezier (t) {
 *    return Math.pow(1-t, 3) * point1 + 3 * Math.pow(1-t, 2) * t * point2 + 3 * (1-t) * (t * t) * point3 + (t * t * t) * point4;
 * }
 * ```
 */
export class EasingFunctions {

   public static Linear: EasingFunction = (currentTime: number, startValue: number, endValue: number, duration: number)  => {
      endValue = (endValue - startValue);
      return endValue * currentTime / duration + startValue;
   };

   public static EaseInQuad = (currentTime: number, startValue: number, endValue: number, duration: number) => {
      endValue = (endValue - startValue);
      currentTime /= duration;

      return endValue * currentTime * currentTime + startValue;
   };
   
   public static EaseOutQuad: EasingFunction = (currentTime: number, startValue: number, endValue: number, duration: number) => {
      endValue = (endValue - startValue);
      currentTime /= duration;
      return -endValue * currentTime * (currentTime - 2) + startValue;
   };

   public static EaseInOutQuad: EasingFunction = (currentTime: number, startValue: number, endValue: number, duration: number) => {
      endValue = (endValue - startValue);
      currentTime /= duration / 2;

      if (currentTime < 1) { return endValue / 2 * currentTime * currentTime + startValue; }
      currentTime--;

      return -endValue / 2 * (currentTime * (currentTime - 2) - 1) + startValue;
   };

   public static EaseInCubic: EasingFunction = (currentTime: number, startValue: number, endValue: number, duration: number) => {
      endValue = (endValue - startValue);
      currentTime /= duration;
      return endValue * currentTime * currentTime * currentTime + startValue;
   };

   public static EaseOutCubic: EasingFunction = (currentTime: number, startValue: number, endValue: number, duration: number) => {
      endValue = (endValue - startValue);
      currentTime /= duration;
      currentTime--;
      return endValue * (currentTime * currentTime * currentTime + 1) + startValue;
   };

   public static EaseInOutCubic: EasingFunction = (currentTime: number, startValue: number, endValue: number, duration: number) => {
      endValue = (endValue - startValue);
      currentTime /= duration / 2;
      if (currentTime < 1) { return endValue / 2 * currentTime * currentTime * currentTime + startValue; }
      currentTime -= 2;
      return endValue / 2 * (currentTime * currentTime * currentTime + 2) + startValue;
   };
   
   public static CubicBezier: IBezierInput = (currentTime: number, point1: number, point2: number, point3: number, point4: number) => {
      return Math.pow(1 - currentTime, 3) * point1 + 3 * Math.pow(1 - currentTime, 2) * currentTime * point2 + 
             3 * (1 - currentTime) * (currentTime * currentTime) * point3 + (currentTime * currentTime * currentTime) * point4;
   };
}