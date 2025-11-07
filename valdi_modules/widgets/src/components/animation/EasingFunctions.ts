import { clamp } from 'foundation/src/number';

function easingClamped(easing: (ratio: number) => number): (ratio: number) => number {
  return (ratio: number): number => {
    return easing(clamp(ratio, 0, 1));
  };
}

/*
 * Easing Functions - inspired from http://gizma.com/easing/
 * only considering the t value for the range [0, 1] => [0, 1]
 * note: for correctness, all input value is always clamped between [0, 1]
 */
export class EasingFunctions {
  /**
   * no easing, no acceleration
   */
  static linear = easingClamped((t: number): number => {
    return t;
  });
  /**
   * accelerating from zero velocity
   */
  static easeInQuad = easingClamped((t: number): number => {
    return t * t;
  });
  /**
   * decelerating to zero velocity
   */
  static easeOutQuad = easingClamped((t: number): number => {
    return t * (2 - t);
  });
  /**
   * acceleration until halfway then deceleration
   */
  static easeInOutQuad = easingClamped((t: number): number => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  });
  /**
   * accelerating from zero velocity
   */
  static easeInCubic = easingClamped((t: number): number => {
    return t * t * t;
  });
  /**
   * decelerating to zero velocity
   */
  static easeOutCubic = easingClamped((t: number): number => {
    return --t * t * t + 1;
  });
  /**
   * acceleration until halfway then deceleration
   */
  static easeInOutCubic = easingClamped((t: number): number => {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  });
  /**
   * accelerating from zero velocity
   */
  static easeInQuart = easingClamped((t: number): number => {
    return t * t * t * t;
  });
  /**
   * decelerating to zero velocity
   */
  static easeOutQuart = easingClamped((t: number): number => {
    return 1 - --t * t * t * t;
  });
  /**
   * acceleration until halfway then deceleration
   */
  static easeInOutQuart = easingClamped((t: number): number => {
    return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
  });
  /**
   * accelerating from zero velocity
   */
  static easeInQuint = easingClamped((t: number): number => {
    return t * t * t * t * t;
  });
  /**
   * decelerating to zero velocity
   */
  static easeOutQuint = easingClamped((t: number): number => {
    return 1 + --t * t * t * t * t;
  });
  /**
   * acceleration until halfway then deceleration
   */
  static easeInOutQuint = easingClamped((t: number): number => {
    return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
  });
}
