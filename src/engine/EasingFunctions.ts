module ex {
   
   /**
    * Standard easing functions for motion in Excalibur
    */
   export class EasingFunctions {

      /*
     easeInQuad: function (t) { return t * t },
     // decelerating to zero velocity
     easeOutQuad: function (t) { return t * (2 - t) },
     // acceleration until halfway, then deceleration
     easeInOutQuad: function (t) { return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t },
     // accelerating from zero velocity 
     easeInCubic: function (t) { return t * t * t },
     // decelerating to zero velocity 
     easeOutCubic: function (t) { return (--t) * t * t + 1 },
     // acceleration until halfway, then deceleration 
     easeInOutCubic: function (t) { return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1 },
     // accelerating from zero velocity 
     easeInQuart: function (t) { return t * t * t * t },
     // decelerating to zero velocity 
     easeOutQuart: function (t) { return 1 - (--t) * t * t * t },
     // acceleration until halfway, then deceleration
     easeInOutQuart: function (t) { return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t },
     // accelerating from zero velocity
     easeInQuint: function (t) { return t * t * t * t * t },
     // decelerating to zero velocity
     easeOutQuint: function (t) { return 1 + (--t) * t * t * t * t },
     // acceleration until halfway, then deceleration 
     easeInOutQuint: function (t) { return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t }
      */

      public static Linear = (currentTime: number, startValue: number, endValue: number, duration: number)  => {
         endValue = (endValue - startValue);
         return endValue * currentTime / duration + startValue;
      }

      public static EaseInQuad = (currentTime: number, startValue: number, endValue: number, duration: number) => {
         //endValue = (endValue - startValue);
         currentTime /= duration;
         return endValue*currentTime*currentTime+startValue;

      }
      public static EaseOutQuad = (currentTime: number, startValue: number, endValue: number, duration: number) => {
         //endValue = (endValue - startValue);
         currentTime /= duration;
         return -endValue * currentTime * (currentTime-2) + startValue;
      }

      public static EaseInOutQuad = (currentTime: number, startValue: number, endValue: number, duration: number) => {
         endValue = (endValue - startValue);
         currentTime /= duration / 2;

         if (currentTime < 1) return endValue / 2 * currentTime * currentTime + startValue;
         currentTime--;

         return -endValue/2 * (currentTime * (currentTime-2) -1) + startValue;
      }

      public static EaseInCubic = (currentTime: number, startValue: number, endValue: number, duration: number) => {
         endValue = (endValue - startValue);
         currentTime /= duration;
         return endValue * currentTime * currentTime * currentTime + startValue;
      }

      public static EaseOutCubic = (currentTime: number, startValue: number, endValue: number, duration: number) => {
         endValue = (endValue - startValue);
         currentTime /= duration;
         return endValue * (currentTime * currentTime * currentTime + 1)+ startValue;
      }

      public static EaseInOutCubic = (currentTime: number, startValue: number, endValue: number, duration: number) => {
         endValue = (endValue - startValue);
         currentTime /= duration / 2;
         if (currentTime < 1) return endValue / 2 * currentTime * currentTime * currentTime + startValue;
         currentTime -= 2;
         return endValue / 2 * (currentTime * currentTime * currentTime + 2) + startValue;
      }
      /*
      public static EaseInQuart = (currentTime: number, startValue: number, endValue: number, duration: number) => {
         
      }

      public static EaseOutQuart = (currentTime: number, startValue: number, endValue: number, duration: number) => {
         
      }

      public static EaseInOutQuart = (currentTime: number, startValue: number, endValue: number, duration: number) => {
         
      }

      public static EaseInQuint = (currentTime: number, startValue: number, endValue: number, duration: number) => {
         
      }

      public static EaseOutQuint = (currentTime: number, startValue: number, endValue: number, duration: number) => {
         
      }

      public static EaseInOutQuint = (currentTime: number, startValue: number, endValue: number, duration: number) => {
         
      }

      public static EaseInExpo = (currentTime: number, startValue: number, endValue: number, duration: number) => {
         
      }

      public static EaseOutExpo = (currentTime: number, startValue: number, endValue: number, duration: number) => {
         
      }

      public static EaseInOutExpo = (currentTime: number, startValue: number, endValue: number, duration: number) => {
         
      }*/


   }

} 