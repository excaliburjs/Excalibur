import { clamp } from './util';

/**
 * @param currentTime time value between 0 and 1
 * @returns scale of the final value between 0 and 1
 */
export type Easing = (currentTime: number, ...args: number[]) => number;

// No easing, no acceleration
export function linear(currentTime: number): number {
  return currentTime;
}

export function smoothstep(currentTime: number, edge0: number, edge1: number): number {
  // Scale, and clamp x to 0..1 range
  currentTime = clamp((currentTime - edge0) / (edge1 - edge0), 0, 1);
  return currentTime * currentTime * (3.0 - 2.0 * currentTime);
}

export function smootherstep(currentTime: number, edge0: number, edge1: number): number {
  // Scale, and clamp x to 0..1 range
  currentTime = clamp((currentTime - edge0) / (edge1 - edge0), 0, 1);
  return currentTime * currentTime * currentTime * (currentTime * (6.0 * currentTime - 15.0) + 10.0);
}

// Slight acceleration from zero to full speed
export function easeInSine(currentTime: number): number {
  return -1 * Math.cos(currentTime * (Math.PI / 2)) + 1;
}

// Slight deceleration at the end
export function easeOutSine(currentTime: number): number {
  return Math.sin(currentTime * (Math.PI / 2));
}

// Slight acceleration at beginning and slight deceleration at end
export function easeInOutSine(currentTime: number): number {
  return -0.5 * (Math.cos(Math.PI * currentTime) - 1);
}

// Accelerating from zero velocity
export function easeInQuad(currentTime: number): number {
  return currentTime * currentTime;
}

// Decelerating to zero velocity
export function easeOutQuad(currentTime: number): number {
  return currentTime * (2 - currentTime);
}

// Acceleration until halfway, then deceleration
export function easeInOutQuad(currentTime: number): number {
  return currentTime < 0.5 ? 2 * currentTime * currentTime : -1 + (4 - 2 * currentTime) * currentTime;
}

// Accelerating from zero velocity
export function easeInCubic(currentTime: number): number {
  return currentTime * currentTime * currentTime;
}

// Decelerating to zero velocity
export function easeOutCubic(currentTime: number): number {
  const t1 = currentTime - 1;
  return t1 * t1 * t1 + 1;
}

// Acceleration until halfway, then deceleration
export function easeInOutCubic(currentTime: number): number {
  return currentTime < 0.5
    ? 4 * currentTime * currentTime * currentTime
    : (currentTime - 1) * (2 * currentTime - 2) * (2 * currentTime - 2) + 1;
}

// Accelerating from zero velocity
export function easeInQuart(currentTime: number): number {
  return currentTime * currentTime * currentTime * currentTime;
}

// Decelerating to zero velocity
export function easeOutQuart(currentTime: number): number {
  const t1 = currentTime - 1;
  return 1 - t1 * t1 * t1 * t1;
}

// Acceleration until halfway, then deceleration
export function easeInOutQuart(currentTime: number): number {
  const t1 = currentTime - 1;
  return currentTime < 0.5 ? 8 * currentTime * currentTime * currentTime * currentTime : 1 - 8 * t1 * t1 * t1 * t1;
}

// Accelerating from zero velocity
export function easeInQuint(currentTime: number): number {
  return currentTime * currentTime * currentTime * currentTime * currentTime;
}

// Decelerating to zero velocity
export function easeOutQuint(currentTime: number): number {
  const t1 = currentTime - 1;
  return 1 + t1 * t1 * t1 * t1 * t1;
}

// Acceleration until halfway, then deceleration
export function easeInOutQuint(currentTime: number): number {
  const t1 = currentTime - 1;
  return currentTime < 0.5 ? 16 * currentTime * currentTime * currentTime * currentTime * currentTime : 1 + 16 * t1 * t1 * t1 * t1 * t1;
}

// Accelerate exponentially until finish
export function easeInExpo(currentTime: number): number {
  if (currentTime === 0) {
    return 0;
  }
  return Math.pow(2, 10 * (currentTime - 1));
}

// Initial exponential acceleration slowing to stop
export function easeOutExpo(currentTime: number): number {
  if (currentTime === 1) {
    return 1;
  }
  return -Math.pow(2, -10 * currentTime) + 1;
}

// Exponential acceleration and deceleration
export function easeInOutExpo(currentTime: number): number {
  if (currentTime === 0 || currentTime === 1) {
    return currentTime;
  }
  const scaledTime = currentTime * 2;
  const scaledTime1 = scaledTime - 1;

  if (scaledTime < 1) {
    return 0.5 * Math.pow(2, 10 * scaledTime1);
  }

  return 0.5 * (-Math.pow(2, -10 * scaledTime1) + 2);
}

// Increasing velocity until stop
export function easeInCirc(currentTime: number): number {
  const scaledTime = currentTime / 1;
  return -1 * (Math.sqrt(1 - scaledTime * currentTime) - 1);
}

// Start fast, decreasing velocity until stop
export function easeOutCirc(currentTime: number): number {
  const t1 = currentTime - 1;
  return Math.sqrt(1 - t1 * t1);
}

// Fast increase in velocity, fast decrease in velocity
export function easeInOutCirc(currentTime: number): number {
  const scaledTime = currentTime * 2;
  const scaledTime1 = scaledTime - 2;

  if (scaledTime < 1) {
    return -0.5 * (Math.sqrt(1 - scaledTime * scaledTime) - 1);
  }

  return 0.5 * (Math.sqrt(1 - scaledTime1 * scaledTime1) + 1);
}

// Slow movement backwards then fast snap to finish
export function easeInBack(currentTime: number, magnitude = 1.70158): number {
  return currentTime * currentTime * ((magnitude + 1) * currentTime - magnitude);
}

// Fast snap to backwards point then slow resolve to finish
export function easeOutBack(currentTime: number, magnitude = 1.70158): number {
  const scaledTime = currentTime / 1 - 1;

  return scaledTime * scaledTime * ((magnitude + 1) * scaledTime + magnitude) + 1;
}

// Slow movement backwards, fast snap to past finish, slow resolve to finish
export function easeInOutBack(currentTime: number, magnitude = 1.70158): number {
  const scaledTime = currentTime * 2;
  const scaledTime2 = scaledTime - 2;

  const s = magnitude * 1.525;

  if (scaledTime < 1) {
    return 0.5 * scaledTime * scaledTime * ((s + 1) * scaledTime - s);
  }

  return 0.5 * (scaledTime2 * scaledTime2 * ((s + 1) * scaledTime2 + s) + 2);
}

// Bounces slowly then quickly to finish
export function easeInElastic(currentTime: number, magnitude = 0.7): number {
  if (currentTime === 0 || currentTime === 1) {
    return currentTime;
  }

  const scaledTime = currentTime / 1;
  const scaledTime1 = scaledTime - 1;

  const p = 1 - magnitude;
  const s = (p / (2 * Math.PI)) * Math.asin(1);

  return -(Math.pow(2, 10 * scaledTime1) * Math.sin(((scaledTime1 - s) * (2 * Math.PI)) / p));
}

// Fast acceleration, bounces to zero
export function easeOutElastic(currentTime: number, magnitude = 0.7): number {
  if (currentTime === 0 || currentTime === 1) {
    return currentTime;
  }

  const p = 1 - magnitude;
  const scaledTime = currentTime * 2;

  const s = (p / (2 * Math.PI)) * Math.asin(1);
  return Math.pow(2, -10 * scaledTime) * Math.sin(((scaledTime - s) * (2 * Math.PI)) / p) + 1;
}

// Slow start and end, two bounces sandwich a fast motion
export function easeInOutElastic(currentTime: number, magnitude = 0.65): number {
  if (currentTime === 0 || currentTime === 1) {
    return currentTime;
  }

  const p = 1 - magnitude;
  const scaledTime = currentTime * 2;
  const scaledTime1 = scaledTime - 1;

  const s = (p / (2 * Math.PI)) * Math.asin(1);

  if (scaledTime < 1) {
    return -0.5 * (Math.pow(2, 10 * scaledTime1) * Math.sin(((scaledTime1 - s) * (2 * Math.PI)) / p));
  }

  return Math.pow(2, -10 * scaledTime1) * Math.sin(((scaledTime1 - s) * (2 * Math.PI)) / p) * 0.5 + 1;
}

// Bounce to completion
export function easeOutBounce(currentTime: number): number {
  const scaledTime = currentTime / 1;

  if (scaledTime < 1 / 2.75) {
    return 7.5625 * scaledTime * scaledTime;
  } else if (scaledTime < 2 / 2.75) {
    const scaledTime2 = scaledTime - 1.5 / 2.75;
    return 7.5625 * scaledTime2 * scaledTime2 + 0.75;
  } else if (scaledTime < 2.5 / 2.75) {
    const scaledTime2 = scaledTime - 2.25 / 2.75;
    return 7.5625 * scaledTime2 * scaledTime2 + 0.9375;
  } else {
    const scaledTime2 = scaledTime - 2.625 / 2.75;
    return 7.5625 * scaledTime2 * scaledTime2 + 0.984375;
  }
}

// Bounce increasing in velocity until completion
export function easeInBounce(currentTime: number): number {
  return 1 - easeOutBounce(1 - currentTime);
}

// Bounce in and bounce out
export function easeInOutBounce(currentTime: number): number {
  if (currentTime < 0.5) {
    return easeInBounce(currentTime * 2) * 0.5;
  }

  return easeOutBounce(currentTime * 2 - 1) * 0.5 + 0.5;
}
