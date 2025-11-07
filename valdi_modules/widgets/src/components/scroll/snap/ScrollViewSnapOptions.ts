import { ScrollViewSnapAlign } from './ScrollViewSnapAlign';
import { ScrollViewSnapType } from './ScrollViewSnapType';

export interface ScrollViewSnapOptions {
  // Different types of snap are available
  type?: ScrollViewSnapType;
  // Different alignment referencials for snapping are available
  align?: ScrollViewSnapAlign;
  // Set a global offset to the snapping, which can be used for sticky headers for example
  extraOffsetX?: number;
  extraOffsetY?: number;
  // Set the maximum initial velocity for the post-scroll fling
  flingMaxVelocityX?: number;
  flingMaxVelocityY?: number;
  // Set the maximum travel distance for the post-scroll fling
  flingMaxDistanceX?: number;
  flingMaxDistanceY?: number;
  /**
   * By default, the ScrollViewSnapController will resolve the frames asynchronously
   * to find the snappable regions. This can result in some delay before snapping
   * occurs after a re-render. If the layout consists of a list of elements that
   * are sized and spaced identically, the "staticAnchorSize" property can be used
   * to tell the ScrollViewSnapController that frames don't need to be dynamically
   * resolved as it can use the provided static anchor size instead. When provided,
   * each rendered ScrollViewSnapAnchor will be considered as consuming the given
   * anchor size, laid out linearly either vertically or horizontally.
   */
  staticAnchorSize?: number;
}
