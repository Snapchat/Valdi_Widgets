import { ElementRef } from 'valdi_core/src/ElementRef';
import { IRenderedElement } from 'valdi_core/src/IRenderedElement';
import { RenderedElementUtils } from 'valdi_core/src/utils/RenderedElementUtils';
import { binarySearchRange } from 'coreutils/src/ArrayUtils';
import { Layout } from 'valdi_tsx/src/NativeTemplateElements';
import { ScrollViewHandler } from '../ScrollViewHandler';

/**
 * Connect the ScrollBarAnchor scattered on the page with the scroll bar view
 */
export class ScrollBarHandler {
  private refByLabel: { [label: string]: ScrollBarRef } = {};

  private cachedItems?: { label: string; offsetY: number }[];

  getOrCreateRef(label: string): ScrollBarRef {
    let ref = this.refByLabel[label];
    if (!ref) {
      ref = new ScrollBarRef(this);
      this.refByLabel[label] = ref;
    }
    return ref;
  }

  getLabelAtPosition(scrollViewHandler: ScrollViewHandler, scrollOffsetY: number): string | undefined {
    if (this.cachedItems === undefined) {
      this.cachedItems = [];
      for (const label in this.refByLabel) {
        const ref = this.refByLabel[label];
        if (ref) {
          const offsetsY = ref.getOffsetsY(scrollViewHandler);
          for (const offsetY of offsetsY) {
            this.cachedItems.push({ label: label, offsetY: offsetY });
          }
        }
      }
      this.cachedItems.sort((a, b) => {
        return a.offsetY - b.offsetY;
      });
    }

    const range = binarySearchRange(this.cachedItems, item => {
      return item.offsetY - scrollOffsetY;
    });

    const item1 = this.cachedItems[range.min];
    const item2 = this.cachedItems[range.max];
    if (item1) {
      return item1?.label;
    } else {
      return item2?.label;
    }
  }

  invalidateLayout(): void {
    this.cachedItems = undefined;
  }
}

/**
 * Hold a set of scroll bar anchors for a specific label, caching positions within scrollview
 */
class ScrollBarRef<T = Layout> extends ElementRef<T> {
  private cachedOffsetsY?: number[];

  constructor(private handler: ScrollBarHandler) {
    super();
  }

  getOffsetsY(scrollViewHandler: ScrollViewHandler): number[] {
    const scrollView = scrollViewHandler.scrollView;
    if (!scrollView) {
      return [];
    }
    if (this.cachedOffsetsY === undefined) {
      this.cachedOffsetsY = [];
      for (const element of this.all()) {
        const offsetY = RenderedElementUtils.relativePositionTo(scrollView, element)?.y;
        if (offsetY) {
          this.cachedOffsetsY.push(offsetY);
        }
      }
    }
    return this.cachedOffsetsY;
  }

  onElementCreated(element: IRenderedElement<T>): void {
    super.onElementCreated(element);
    this.cachedOffsetsY = undefined;
    this.handler.invalidateLayout();
  }

  onElementDestroyed(element: IRenderedElement<T>): void {
    super.onElementDestroyed(element);
    this.cachedOffsetsY = undefined;
    this.handler.invalidateLayout();
  }

  setElements(): void {
    throw new Error('Method not implemented.');
  }
}
