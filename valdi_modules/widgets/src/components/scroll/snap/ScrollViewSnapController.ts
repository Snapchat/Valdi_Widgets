import { Point } from 'valdi_core/src/Geometry';
import { IRenderedElement } from 'valdi_core/src/IRenderedElement';
import { IRenderer } from 'valdi_core/src/IRenderer';
import { RenderedElementUtils } from 'valdi_core/src/utils/RenderedElementUtils';
import { binarySearch, binarySearchRange } from 'coreutils/src/ArrayUtils';
import { StringMap } from 'coreutils/src/StringMap';
import { clamp } from 'foundation/src/number';
import { ElementFrame } from 'valdi_tsx/src/Geometry';
import { ScrollDragEndingEvent, ScrollEndEvent } from 'valdi_tsx/src/GestureEvents';
import { IRenderedElementHolder } from 'valdi_tsx/src/IRenderedElementHolder';
import { LayoutAttributes } from 'valdi_tsx/src/NativeTemplateElements';
import { ScrollViewHandler } from '../ScrollViewHandler';
import { ScrollViewSubscription } from '../ScrollViewSubscription';
import { ScrollViewSnapAlign } from './ScrollViewSnapAlign';
import { ScrollViewSnapListener } from './ScrollViewSnapListener';
import { ScrollViewSnapOptions } from './ScrollViewSnapOptions';
import { ScrollViewSnapType } from './ScrollViewSnapType';

// Best effort deceleration estimation
const DECELERATION_RATE = 0.998;
const DECELERATION_COEFFICIENT = 1000 * Math.log(DECELERATION_RATE);
const DECELERATION_CORRECTION = 1 / -DECELERATION_COEFFICIENT;

enum SnapAction {
  DoSnapNow = 'do-snap-now',
  AnchorScroll = 'anchor-scroll',
  AnchorSnap = 'anchor-snap',
}

interface SnapItem<T> {
  origin?: Point;
  element: IRenderedElement<T>;
}

function compareOrigins(horizontal: boolean, originA: Point, originB: Point): number {
  if (horizontal) {
    return originA.x - originB.x;
  }
  return originA.y - originB.y;
}

function compareItems<T>(horizontal: boolean, a: SnapItem<T>, b: SnapItem<T>): number {
  if (!a.origin) {
    return -1;
  }
  if (!b.origin) {
    return 1;
  }
  return compareOrigins(horizontal, a.origin, b.origin);
}

/**
 * This class enable setting up snapping behavior on a ScrollViewHandler
 * use startSnapping to setup the snapping effect
 * and then pass this instance as element reference to register snappable elements
 */
export class ScrollViewSnapController<T extends LayoutAttributes = LayoutAttributes>
  implements IRenderedElementHolder<T>
{
  private handler: ScrollViewHandler;

  private items: Array<SnapItem<T>> = [];
  private needsSort = false;
  private waiting: boolean = false;

  private options: ScrollViewSnapOptions;

  private renderWaiting: boolean = false;
  private renderCounter: number = 0;
  private renderCompletions: StringMap<() => void> = {};

  private lastItems: StringMap<SnapItem<T>> = {};

  private scrollSubscription?: ScrollViewSubscription = undefined;

  private listenersArray: ScrollViewSnapListener<T>[] = [];
  private listenersCounter: number = 0;
  private staticAnchorSize: number | undefined;
  private _currentSnapIndex = 0;

  constructor(handler: ScrollViewHandler, options?: ScrollViewSnapOptions) {
    this.handler = handler;
    this.options = options ?? {};
    this.staticAnchorSize = this.options.staticAnchorSize;
  }

  // Return the index to the currently snapped item
  get currentSnapIndex(): number {
    return this._currentSnapIndex;
  }

  /**
   * overrides for IRenderedElementHolder<T>
   */
  onElementCreated(element: IRenderedElement<T>): void {
    // Apply all attributes to new element
    this.applyOnLayout(element);
    // Just append the element and schedule a sort
    this.setNeedsSort();
    this.items.push({
      element: element,
    });
  }
  onElementDestroyed(element: IRenderedElement<T>): void {
    // If elements are sorted, try to find deleted element through a binary search
    if (!this.needsSort) {
      // Compute the actual snap origin within the scroll content
      const origin = this.computeElementOrigin(element);
      if (origin) {
        const horizontal = this.handler.horizontal;
        const index = binarySearch(this.items, item => compareOrigins(horizontal, item.origin!, origin));
        if (index !== -1) {
          const item = this.items[index];
          if (item.element === element) {
            this.items.splice(index, 1);
            return;
          }
        }
      }
    }
    // Otherwise just do a linear search
    const index = this.items.findIndex((item: SnapItem<T>): boolean => {
      return item.element === element;
    });
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }
  setElements(elements: IRenderedElement<T>[]): void {
    // Apply all attributes to all new elements
    for (const element of elements) {
      this.applyOnLayout(element);
    }
    // Save unordered elements as dirty
    this.setNeedsSort();
    this.items = elements.map(element => {
      return {
        element: element,
      };
    });
  }

  /**
   * Add a snapping effect to a scroll view
   */
  startSnapping(listener?: ScrollViewSnapListener<T>): ScrollViewSubscription {
    // Increment the listener count
    this.listenersCounter++;
    if (listener) {
      this.listenersArray.push(listener);
    }
    // Update subscription to scroll view
    this.updateScrollSubscription();
    // Return a subscription object to cleanup
    return {
      unsubscribe: () => {
        // Decrement the listener count
        this.listenersCounter--;
        if (listener) {
          const index = this.listenersArray.indexOf(listener);
          if (index >= 0) {
            this.listenersArray.splice(index, 1);
          }
        }
        // Potentially remove scroll view subscription
        this.updateScrollSubscription();
      },
    };
  }

  /**
   * In some cases, we want to ensure the current render pass's frames are available,
   * this API enable consuming code to notify that the frames may have changed during the current render
   */
  notifyWillRender(renderer: IRenderer): void {
    if (this.staticAnchorSize) {
      return;
    }

    this.renderWaiting = true;
    const renderCounter = ++this.renderCounter;
    renderer.onLayoutComplete(() => {
      if (renderCounter === this.renderCounter) {
        this.renderWaiting = false;
        this.renderCompletions[SnapAction.DoSnapNow]?.();
        this.renderCompletions[SnapAction.AnchorScroll]?.();
        this.renderCompletions[SnapAction.AnchorSnap]?.();
        this.renderCompletions = {};
      }
    });
  }

  /**
   * Manually snap now to a position
   */
  doSnapNow(targetX?: number, targetY?: number, animated?: boolean): void {
    this.scheduleWhenFramesAvailable(SnapAction.DoSnapNow, () => {
      const snapIndex = this.findSnapIndex(targetX, targetY);
      if (snapIndex !== undefined) {
        this.doSnapNowToIndex(snapIndex, animated);
      }
    });
  }

  /**
   * Manually snap now to an index
   */
  doSnapNowToIndex(snapIndex: number, animated?: boolean): void {
    this.scheduleWhenFramesAvailable(SnapAction.DoSnapNow, () => {
      const snapItem = this.findSnapItem(snapIndex);
      const snapOffset = this.findSnapScrollOffset(snapItem);
      const snapAnimated = animated ?? false;
      if (snapOffset !== undefined) {
        // Check if we already are at the correct spot, in that case no need to animate, just trigger immediately
        // TODO - this could be checked at the setAttribute() level
        if (
          this.handler.scrollX === snapOffset.x &&
          this.handler.scrollY === snapOffset.y &&
          this.handler.scrollAnimated === snapAnimated
        ) {
          this.triggerSnapEvent(SnapAction.AnchorSnap, this.callListenersAnchorSnap);
          return;
        }

        // Otherwise scroll to the new position and wait for the listeners to be triggered
        const staticContentSize =
          this.staticAnchorSize === undefined ? undefined : this.staticAnchorSize * this.items.length;

        this.handler.horizontal
          ? this.handler.setStaticContentWidth(staticContentSize)
          : this.handler.setStaticContentHeight(staticContentSize);

        this.handler.scrollTo(snapOffset.x, snapOffset.y, snapAnimated);
      }
    });
  }

  private updateScrollSubscription(): void {
    // Create and register a scroll listener when needed
    if (this.scrollSubscription === undefined && this.listenersCounter > 0) {
      const options = this.options;
      const type = options.type ?? ScrollViewSnapType.SnapAfterRelease;
      this.scrollSubscription = this.handler.subscribeListener({
        onDragEnding: (event: ScrollDragEndingEvent): Point | undefined => {
          switch (type) {
            case ScrollViewSnapType.SnapAfterRelease: {
              const flingMaxVelocityX = options.flingMaxVelocityX ?? Infinity;
              const flingMaxVelocityY = options.flingMaxVelocityY ?? Infinity;
              const flingMaxDistanceX = options.flingMaxDistanceX ?? Infinity;
              const flingMaxDistanceY = options.flingMaxDistanceY ?? Infinity;
              const velocityX = clamp(event.velocityX, -flingMaxVelocityX, flingMaxVelocityX);
              const velocityY = clamp(event.velocityY, -flingMaxVelocityY, flingMaxVelocityY);
              const distanceX = clamp(velocityX * DECELERATION_CORRECTION, -flingMaxDistanceX, flingMaxDistanceX);
              const distanceY = clamp(velocityY * DECELERATION_CORRECTION, -flingMaxDistanceY, flingMaxDistanceY);
              const snapIndex = this.findSnapIndex(event.x + distanceX, event.y + distanceY);
              const snapItem = this.findSnapItem(snapIndex);
              return this.findSnapScrollOffset(snapItem);
            }
            case ScrollViewSnapType.SnapAfterDeceleration:
              this.waiting = true;
              return undefined;
          }
        },
        onScrollEnd: (event: ScrollEndEvent): void => {
          if (this.waiting) {
            this.waiting = false;
            this.doSnapNow(event.x, event.y, true);
          }
          this.triggerSnapEvent(SnapAction.AnchorSnap, this.callListenersAnchorSnap);
        },
        onScroll: (): void => {
          this.triggerSnapEvent(SnapAction.AnchorScroll, this.callListenersAnchorScroll);
        },
      });
      return;
    }
    // If we don't need the subscription anymore
    if (this.scrollSubscription !== undefined && this.listenersCounter <= 0) {
      this.scrollSubscription.unsubscribe();
      this.scrollSubscription = undefined;
      return;
    }
  }

  /**
   * Call the onAnchorSnap callback of all registered listeners
   */
  private callListenersAnchorSnap = (index: number, element: IRenderedElement): void => {
    for (const listener of this.listenersArray) {
      listener.onAnchorSnap?.(index, element);
    }
  };

  /**
   * Call the onAnchorScroll callback of all registered listeners
   */
  private callListenersAnchorScroll = (index: number, element: IRenderedElement): void => {
    for (const listener of this.listenersArray) {
      listener.onAnchorScroll?.(index, element);
    }
  };

  /**
   * Schedule an event that needs proper frames to be available
   */
  private scheduleWhenFramesAvailable(key: SnapAction, cb: () => void): void {
    if (this.renderWaiting) {
      this.renderCompletions[key] = cb;
    } else {
      cb();
    }
  }

  /**
   * Notify consuming code that a snapping event has taken place
   */
  private triggerSnapEvent(key: SnapAction, listener?: (index: number, element: IRenderedElement) => void): void {
    this.scheduleWhenFramesAvailable(key, () => {
      const lastItem = this.lastItems[key];
      const x = this.handler.scrollX;
      const y = this.handler.scrollY;
      const snapIndex = this.findSnapIndex(x, y) ?? 0;
      this._currentSnapIndex = snapIndex;
      const snapItem = this.findSnapItem(snapIndex);
      if (lastItem !== snapItem) {
        if (snapItem !== undefined) {
          if (listener) {
            listener(snapIndex, snapItem.element);
          }
          this.lastItems[key] = snapItem;
        }
      }
    });
  }

  /**
   * Manually find the closest snap item's index
   */
  private findSnapIndex(targetX?: number, targetY?: number): number | undefined {
    return this.computeClosestItemIndex({
      x: targetX ?? this.handler.scrollX,
      y: targetY ?? this.handler.scrollY,
    });
  }

  /**
   * Manually find the snap item at the specified index
   */
  private findSnapItem(snapIndex?: number): SnapItem<T> | undefined {
    if (snapIndex === undefined) {
      return undefined;
    }
    if (!this.ensureElementsSort()) {
      return undefined;
    }
    return this.items[snapIndex];
  }

  /**
   * Manually find the snap offset from the snap item
   */
  private findSnapScrollOffset(snapItem?: SnapItem<T>): Point | undefined {
    if (snapItem === undefined) {
      return undefined;
    }
    if (snapItem.origin === undefined) {
      return undefined;
    }
    return this.computeScrollOffsetFromItemOrigin(snapItem.origin);
  }

  /**
   * Search the most suitable element based on the snap origin
   */
  private computeClosestItemIndex(scrollOffset: Point): number | undefined {
    // No sort, no snap
    if (!this.ensureElementsSort()) {
      return undefined;
    }
    // No frame, no snap
    const scrollViewFrame = this.handler.scrollViewFrame;
    if (!scrollViewFrame) {
      return undefined;
    }
    // Normalize positioning
    const itemOrigin = this.normalizedScrollOffsetToItemOrigin(scrollOffset, scrollViewFrame);
    // Try to find the closest element in the sorted element list
    const horizontal = this.handler.horizontal;
    const range = binarySearchRange(this.items, item => compareOrigins(horizontal, item.origin!, itemOrigin));
    const itemMin = this.items[range.min];
    const itemMax = this.items[range.max];
    if (itemMin && itemMax) {
      const distanceMin = compareOrigins(horizontal, itemMin.origin!, itemOrigin);
      const distanceMax = compareOrigins(horizontal, itemMax.origin!, itemOrigin);
      if (Math.abs(distanceMin) <= Math.abs(distanceMax)) {
        return range.min;
      } else {
        return range.max;
      }
    } else if (itemMin) {
      return range.min;
    } else if (itemMax) {
      return range.max;
    } else {
      return undefined;
    }
  }

  /**
   * Convert a snap origin into a scroll offset
   */
  private computeScrollOffsetFromItemOrigin(itemOrigin: Point): Point | undefined {
    // No frame, no snap
    const scrollViewFrame = this.handler.scrollViewFrame;
    if (!scrollViewFrame) {
      return undefined;
    }
    // Normalize positioning
    const scrollOffset = this.normalizedItemOriginToScrollOffset(itemOrigin, scrollViewFrame);
    // Clamp to the scroll content limits
    const circular = this.handler.circularRatio > 1;
    const horizontal = this.handler.horizontal;
    if (horizontal) {
      const maxX = this.handler.getContentWidth() - scrollViewFrame.width;
      return {
        x: circular ? scrollOffset.x : clamp(scrollOffset.x, 0, maxX),
        y: this.handler.scrollY,
      };
    } else {
      const maxY = this.handler.getContentHeight() - scrollViewFrame.height;
      return {
        x: this.handler.scrollX,
        y: circular ? scrollOffset.y : clamp(scrollOffset.y, 0, maxY),
      };
    }
  }

  /**
   * Convert a scroll offset into its snap target
   */
  private normalizedScrollOffsetToItemOrigin(offset: Point, scrollViewFrame: ElementFrame): Point {
    const delta = this.normalizedScrollFrameDelta(scrollViewFrame);
    return {
      x: offset.x + delta.x,
      y: offset.y + delta.y,
    };
  }
  /**
   * Convert a snap target into its scroll offset
   */
  private normalizedItemOriginToScrollOffset(origin: Point, scrollViewFrame: ElementFrame): Point {
    const delta = this.normalizedScrollFrameDelta(scrollViewFrame);
    return {
      x: origin.x - delta.x,
      y: origin.y - delta.y,
    };
  }

  /**
   * Compute offset applied by the scroll context
   */
  private normalizedScrollFrameDelta(scrollViewFrame: ElementFrame): Point {
    const delta = {
      x: -(this.options.extraOffsetX ?? 0),
      y: -(this.options.extraOffsetY ?? 0),
    };
    if (this.options.align === ScrollViewSnapAlign.CenterToCenter) {
      delta.x += scrollViewFrame.width / 2;
      delta.y += scrollViewFrame.height / 2;
    } else if (this.options.align === ScrollViewSnapAlign.EndToEnd) {
      delta.x += scrollViewFrame.width;
      delta.y += scrollViewFrame.height;
    }
    return delta;
  }

  /**
   * Element sorting logic
   */
  private setNeedsSort(): void {
    this.needsSort = true;
  }

  private sortElementsIfNeeded(): void {
    if (this.needsSort) {
      // Recompute the origin based on the new frame
      if (this.staticAnchorSize) {
        // Static anchor size, we infer the origin based on
        // the given anchor size
        const sizePerAnchor = this.staticAnchorSize;

        // Sort by parent index. Each item would need to have the same parent element.
        this.items.sort((a, b) => {
          return a.element.parentIndex - b.element.parentIndex;
        });

        let widthIncrement = 0;
        let heightIncrement = 0;
        if (this.handler.horizontal) {
          widthIncrement = sizePerAnchor;
        } else {
          heightIncrement = sizePerAnchor;
        }

        let currentX = 0;
        let currentY = 0;

        for (const item of this.items) {
          item.origin = this.makeElementOrigin(currentX, currentY, sizePerAnchor, sizePerAnchor);
          currentX += widthIncrement;
          currentY += heightIncrement;
        }

        this.needsSort = false;
      } else {
        for (const item of this.items) {
          item.origin = this.computeElementOrigin(item.element);
        }

        // Try to use the newly computed origin to build the sorted element list
        const allPositionable = this.items.every(item => item.origin);
        if (allPositionable) {
          const horizontal = this.handler.horizontal;
          this.items.sort((a, b) => {
            return compareItems(horizontal, a, b);
          });
          this.needsSort = false;
        }
      }
    }
  }

  private ensureElementsSort(): boolean {
    // Only do the sorting when element are changed, otherwise don't snap
    this.sortElementsIfNeeded();
    if (this.needsSort) {
      console.error('could not compute elements to snap to, make sure all anchors are within the scroll view');
      return false;
    }
    return true;
  }

  /**
   * Make sure to always update element positions when their layout changed
   */
  private applyOnLayout(element: IRenderedElement<T>): void {
    // The type safety really messes things up here, so we manually bypass it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element.setAttribute('onLayout' as any, this.onLayout as any);
  }

  private onLayout = (): void => {
    // On any layout, schedule a sort
    this.setNeedsSort();
  };

  /**
   * Resolve the snapping origin of an element
   */
  private computeElementOrigin(element: IRenderedElement): Point | undefined {
    const scrollView = this.handler.scrollView;
    if (scrollView) {
      const relativePosition = RenderedElementUtils.relativePositionTo(scrollView, element);
      if (relativePosition) {
        return this.makeElementOrigin(
          relativePosition.x,
          relativePosition.y,
          element.frame.width,
          element.frame.height,
        );
      }
    }
    return undefined;
  }

  private makeElementOrigin(elementX: number, elementY: number, elementWidth: number, elementHeight: number): Point {
    switch (this.options.align ?? ScrollViewSnapAlign.StartToStart) {
      case ScrollViewSnapAlign.StartToStart:
        return {
          x: elementX,
          y: elementY,
        };
      case ScrollViewSnapAlign.CenterToCenter:
        return {
          x: elementX + elementWidth / 2,
          y: elementY + elementHeight / 2,
        };
      case ScrollViewSnapAlign.EndToEnd:
        return {
          x: elementX + elementWidth,
          y: elementY + elementHeight,
        };
    }
  }
}
