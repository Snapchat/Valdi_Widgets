import { ElementFrame } from 'valdi_tsx/src/Geometry';
import {
  ScrollEvent,
  ScrollDragEndEvent,
  ScrollDragEndingEvent,
  ScrollOffset,
  ContentSizeChangeEvent,
  ScrollEndEvent,
} from 'valdi_tsx/src/GestureEvents';

export interface ScrollViewRegionEvent {
  regionX: number;
  regionY: number;
  regionWidth: number;
  regionHeight: number;
  newRegionWidth: number;
  newRegionHeight: number;
}

export interface ScrollViewListenerSubscribeOptions {
  callOnScrollOnMainThread?: boolean;
  callOnScrollEndOnMainThread?: boolean;
  callOnDragStartOnMainThread?: boolean;
  callOnDragEndOnMainThread?: boolean;
}

export interface ScrollViewListener {
  onLayout?(frame: ElementFrame): void;
  onScroll?(event: ScrollEvent): void;
  onDragStart?(event: ScrollEvent): void;

  /**
   * Called synchronously when the ScrollView will end dragging.
   * The called function can return a scroll offset that should be
   * used to replace the content offset where the scroll view should
   * settle.
   */
  onDragEnding?(event: ScrollDragEndingEvent): ScrollOffset | undefined;

  /**
   * Called when the ScrollView ended dragging. This will be called right
   * after onDragEnding() is called, and will be called asynchronously
   * by default unlike onDragEnding. The scroll view might still be animating
   * its scroll at this point.
   */
  onDragEnd?(event: ScrollDragEndEvent): void;

  onScrollEnd?(event: ScrollEndEvent): void;
  onContentSizeChange?(event: ContentSizeChangeEvent): void;

  /**
   * Called whenever a component is notifying that is it going to grow or shrink
   * a region within the scroll view.
   */
  onScrollRegionWillChange?(event: ScrollViewRegionEvent): void;

  /**
   * Called after a previous call of onScrollRegionWillChange() to notify that the region change has been completed.
   */
  onScrollRegionDidChange?(): void;
}
