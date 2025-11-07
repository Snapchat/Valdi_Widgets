import { AttributesFrom, IRenderedElement } from 'valdi_core/src/IRenderedElement';
import { IRenderedElementAttributeApplier } from 'valdi_core/src/IRenderedElementApplier';
import { setTimeoutInterruptible } from 'valdi_core/src/SetTimeout';
import { makeMainThreadCallback } from 'valdi_core/src/utils/FunctionUtils';
import { clamp } from 'foundation/src/number';
import { ElementFrame } from 'valdi_tsx/src/Geometry';
import {
  ScrollEvent,
  ScrollDragEndEvent,
  ScrollDragEndingEvent,
  ScrollOffset,
  ContentSizeChangeEvent,
  ScrollEndEvent,
} from 'valdi_tsx/src/GestureEvents';
import { IRenderedElementBase } from 'valdi_tsx/src/IRenderedElementBase';
import { ScrollView, ScrollViewInteractive } from 'valdi_tsx/src/NativeTemplateElements';
import { ScrollViewListener, ScrollViewListenerSubscribeOptions, ScrollViewRegionEvent } from './ScrollViewListener';
import { ScrollViewSubscription } from './ScrollViewSubscription';

const enum ScrollViewCallbackMode {
  None,
  JsThread,
  MainThread,
}

type ScrollViewCallbackHandler<Event, Result> = (event: Event) => Result | undefined;
type ScrollViewCallbackApplier<Event, Result> = (listener: ScrollViewListener, event: Event) => Result | undefined;

/**
 * The scroll view callback object holds all information of which listener is listening on which thread
 * and how to notify all necessary listeners of an incoming event
 */
class ScrollViewCallback<Event, Result> {
  private listenersMainThread: ScrollViewListener[] = [];
  private listenersJsThread: ScrollViewListener[] = [];

  private handler: ScrollViewCallbackHandler<Event, Result> | undefined = undefined;
  private applier: ScrollViewCallbackApplier<Event, Result>;

  private mode: ScrollViewCallbackMode = ScrollViewCallbackMode.None;

  constructor(applier: ScrollViewCallbackApplier<Event, Result>) {
    this.applier = applier;
  }

  addListener(listener: ScrollViewListener, shouldCallOnMainThread: boolean): void {
    if (shouldCallOnMainThread) {
      this.listenersMainThread.push(listener);
    } else {
      this.listenersJsThread.push(listener);
    }
  }

  removeListener(listener: ScrollViewListener): void {
    const indexMainThread = this.listenersMainThread.indexOf(listener);
    if (indexMainThread >= 0) {
      this.listenersMainThread.splice(indexMainThread, 1);
    }
    const indexMainJs = this.listenersJsThread.indexOf(listener);
    if (indexMainJs >= 0) {
      this.listenersJsThread.splice(indexMainJs, 1);
    }
  }

  needUpdate(): boolean {
    return this.mode !== this.expectedMode();
  }

  getHandler(): ScrollViewCallbackHandler<Event, Result> | undefined {
    if (!this.needUpdate()) {
      return this.handler;
    }

    this.mode = this.expectedMode();
    switch (this.mode) {
      // when main thread, need to deal with both JsThread+MainThread scheduling
      case ScrollViewCallbackMode.MainThread:
        this.handler = makeMainThreadCallback((event: Event) => {
          // Schedule the JS-thread event in a setTimeout if needed
          if (this.listenersJsThread.length > 0) {
            setTimeoutInterruptible(() => {
              this.notifyListeners(event, this.listenersJsThread);
            });
          }
          // Main thread events immediately
          return this.notifyListeners(event, this.listenersMainThread);
        });
        break;
      // When JsThread only we don't use a main-thread callback
      case ScrollViewCallbackMode.JsThread:
        this.handler = (event: Event) => {
          // Just in case we have some lingering main-thread events, run them immediately
          this.notifyListeners(event, this.listenersMainThread);
          // Run JS-thread event normally
          return this.notifyListeners(event, this.listenersJsThread);
        };
        break;
      // Otherwise, we don't need anything!
      case ScrollViewCallbackMode.None:
        this.handler = undefined;
        break;
    }

    return this.handler;
  }

  private expectedMode(): ScrollViewCallbackMode {
    if (this.listenersMainThread.length > 0) {
      return ScrollViewCallbackMode.MainThread;
    } else if (this.listenersJsThread.length > 0) {
      return ScrollViewCallbackMode.JsThread;
    } else {
      return ScrollViewCallbackMode.None;
    }
  }

  private notifyListeners(event: Event, listeners: ScrollViewListener[]): Result | undefined {
    let output: Result | undefined = undefined;
    for (const listener of listeners) {
      const result = this.applier(listener, event);
      if (result) {
        if (output) {
          console.error(`Multiple listeners returned a result.`);
        }
        output = result;
      }
    }
    return output;
  }
}

/**
 * A ScrollViewHandler allows multiple consumers to subscribe to events
 * on a single scroll view, and allows consumers to manipulate it
 * as long as they have a reference to the handler.
 * The handler should be passed in as the "ref" attribute
 * of the backing scroll view element.
 */
export class ScrollViewHandler implements IRenderedElementAttributeApplier<ScrollViewInteractive> {
  private element?: IRenderedElement<ScrollViewInteractive> | undefined;
  private listeners: ScrollViewListener[] = [];

  private deferredAttributes?: ScrollViewInteractive;

  private contentWidth = 0;
  private contentHeight = 0;

  private onScrollRegionWillChangeCallback?: ScrollViewCallback<ScrollViewRegionEvent, void>;
  private onScrollRegionDidChangeCallback?: ScrollViewCallback<void, void>;

  private onLayoutCallback?: ScrollViewCallback<ElementFrame, void>;
  private onScrollCallback?: ScrollViewCallback<ScrollEvent, void>;
  private onScrollEndCallback?: ScrollViewCallback<ScrollEndEvent, void>;
  private onDragStartCallback?: ScrollViewCallback<ScrollEvent, void>;
  private onDragEndingCallback?: ScrollViewCallback<ScrollDragEndingEvent, ScrollOffset>;
  private onDragEndCallback?: ScrollViewCallback<ScrollDragEndEvent, void>;

  constructor() {
    this.setAttribute('onContentSizeChange', this.onContentSizeChange);
  }

  get circularRatio(): number {
    return this.element?.getAttribute('circularRatio') ?? 1;
  }

  get horizontal(): boolean {
    return this.element?.getAttribute('horizontal') ?? false;
  }

  get scrollX(): number {
    return this.element?.getAttribute('contentOffsetX') ?? 0;
  }

  get scrollY(): number {
    return this.element?.getAttribute('contentOffsetY') ?? 0;
  }

  get scrollAnimated(): boolean {
    return this.element?.getAttribute('contentOffsetAnimated') ?? false;
  }

  get scrollView(): IRenderedElement<ScrollView> | undefined {
    return this.element;
  }

  get scrollViewFrame(): ElementFrame | undefined {
    return this.element?.frame;
  }

  resetScroll(): void {
    this.scrollTo(0, 0, false);
  }

  scrollTo(x: number, y: number, animated: boolean): void {
    this.setAttributes({ contentOffsetX: x, contentOffsetY: y, contentOffsetAnimated: animated });
  }

  scrollToClamped(x: number, y: number, animated: boolean): void {
    const frame = this.scrollViewFrame;
    const finalX = clamp(x, 0, this.getContentWidth() - (frame?.width ?? 0));
    const finalY = clamp(y, 0, this.getContentHeight() - (frame?.height ?? 0));
    return this.scrollTo(finalX, finalY, animated);
  }

  setAttribute<K extends keyof AttributesFrom<ScrollViewInteractive>>(name: K, value: ScrollViewInteractive[K]): void {
    if (this.element) {
      this.element.setAttribute(name, value);
    } else {
      if (!this.deferredAttributes) {
        this.deferredAttributes = {};
      }
      this.deferredAttributes[name] = value;
    }
  }

  setAttributes(attributes: ScrollViewInteractive): void {
    if (this.element) {
      this.element.setAttributes(attributes);
    } else {
      if (!this.deferredAttributes) {
        this.deferredAttributes = attributes;
      } else {
        Object.assign(this.deferredAttributes, attributes);
      }
    }
  }

  setTranslationX(x: number | undefined): void {
    this.setAttribute('translationX', x);
  }

  setTranslationY(y: number | undefined): void {
    this.setAttribute('translationY', y);
  }

  getContentWidth(): number {
    return this.contentWidth;
  }

  getContentHeight(): number {
    return this.contentHeight;
  }

  setStaticContentWidth(staticContentWidth: number | undefined): void {
    this.setAttribute('staticContentWidth', staticContentWidth);
  }

  setStaticContentHeight(staticContentHeight: number | undefined): void {
    this.setAttribute('staticContentHeight', staticContentHeight);
  }

  /**
   * Registers a scroll listener to this handler.
   *
   * @param listener the listener which will receive the scroll callbacks
   * @param callOnMainThread whether the callbacks should be sync with the main thread.
   * You should use this flag only if your logic requires to run before the UI updates
   * after scroll.
   */
  subscribeListener(
    listener: ScrollViewListener,
    options?: ScrollViewListenerSubscribeOptions,
  ): ScrollViewSubscription {
    if (listener.onLayout) {
      if (!this.onLayoutCallback) {
        this.onLayoutCallback = new ScrollViewCallback(this.onLayout);
      }
      this.onLayoutCallback.addListener(listener, false);
    }
    if (listener.onScroll) {
      if (!this.onScrollCallback) {
        this.onScrollCallback = new ScrollViewCallback(this.onScroll);
      }
      this.onScrollCallback.addListener(listener, options?.callOnScrollOnMainThread ?? false);
    }
    if (listener.onScrollEnd) {
      if (!this.onScrollEndCallback) {
        this.onScrollEndCallback = new ScrollViewCallback(this.onScrollEnd);
      }
      this.onScrollEndCallback.addListener(listener, options?.callOnScrollEndOnMainThread ?? false);
    }
    if (listener.onDragStart) {
      if (!this.onDragStartCallback) {
        this.onDragStartCallback = new ScrollViewCallback(this.onDragStart);
      }
      this.onDragStartCallback.addListener(listener, options?.callOnDragStartOnMainThread ?? false);
    }
    if (listener.onDragEnding) {
      if (!this.onDragEndingCallback) {
        this.onDragEndingCallback = new ScrollViewCallback(this.onDragEnding);
      }
      this.onDragEndingCallback.addListener(listener, false);
    }
    if (listener.onDragEnd) {
      if (!this.onDragEndCallback) {
        this.onDragEndCallback = new ScrollViewCallback(this.onDragEnd);
      }
      this.onDragEndCallback.addListener(listener, options?.callOnDragEndOnMainThread ?? false);
    }
    if (listener.onScrollRegionWillChange) {
      if (!this.onScrollRegionWillChangeCallback) {
        this.onScrollRegionWillChangeCallback = new ScrollViewCallback(this.onScrollRegionWillChange);
      }
      this.onScrollRegionWillChangeCallback.addListener(listener, false);
    }
    if (listener.onScrollRegionDidChange) {
      if (!this.onScrollRegionDidChangeCallback) {
        this.onScrollRegionDidChangeCallback = new ScrollViewCallback(this.onScrollRegionDidChange);
      }
      this.onScrollRegionDidChangeCallback.addListener(listener, false);
    }
    if (listener.onContentSizeChange) {
      this.listeners.push(listener);
    }
    this.updateCallbacks();

    return {
      unsubscribe: () => {
        if (listener.onLayout) {
          this.onLayoutCallback?.removeListener(listener);
        }
        if (listener.onScroll) {
          this.onScrollCallback?.removeListener(listener);
        }
        if (listener.onScrollEnd) {
          this.onScrollEndCallback?.removeListener(listener);
        }
        if (listener.onDragStart) {
          this.onDragStartCallback?.removeListener(listener);
        }
        if (listener.onDragEnding) {
          this.onDragEndingCallback?.removeListener(listener);
        }
        if (listener.onDragEnd) {
          this.onDragEndCallback?.removeListener(listener);
        }
        if (listener.onScrollRegionWillChange) {
          this.onScrollRegionWillChangeCallback?.removeListener(listener);
        }
        if (listener.onScrollRegionDidChange) {
          this.onScrollRegionDidChangeCallback?.removeListener(listener);
        }
        this.updateCallbacks();
      },
    };
  }

  onElementCreated(element: IRenderedElementBase<ScrollViewInteractive>): void {
    this.element = element as IRenderedElement;

    this.updateCallbacks();

    if (this.deferredAttributes) {
      this.element.setAttributes(this.deferredAttributes);
      this.deferredAttributes = undefined;
    }
  }

  onElementDestroyed(): void {
    this.element = undefined;
  }

  setElements(): void {}

  // For compatibility with ElementRef
  single(): IRenderedElement<ScrollView> | undefined {
    return this.scrollView;
  }

  // For compatibility with ElementRef
  all(): IRenderedElement<ScrollView>[] {
    if (!this.scrollView) {
      return [];
    }
    return [this.scrollView];
  }

  notifyRegionWillChange(
    regionX: number,
    regionY: number,
    regionWidth: number,
    regionHeight: number,
    newRegionWidth: number,
    newRegionHeight: number,
  ): void {
    this.onScrollRegionWillChangeCallback?.getHandler()?.({
      regionX: regionX,
      regionY: regionY,
      regionWidth: regionWidth,
      regionHeight: regionHeight,
      newRegionWidth: newRegionWidth,
      newRegionHeight: newRegionHeight,
    });
  }

  notifyRegionDidChange(): void {
    this.onScrollRegionDidChangeCallback?.getHandler()?.(undefined);
  }

  private onContentSizeChange = (onContentSizeChange: ContentSizeChangeEvent): void => {
    this.contentWidth = onContentSizeChange.width;
    this.contentHeight = onContentSizeChange.height;

    for (const listener of this.listeners) {
      if (listener.onContentSizeChange) {
        listener.onContentSizeChange(onContentSizeChange);
      }
    }
  };

  private updateCallbacks(): void {
    const element = this.element;
    if (!element) {
      return;
    }
    if (this.onLayoutCallback?.needUpdate()) {
      element.setAttribute('onLayout', this.onLayoutCallback.getHandler());
    }
    if (this.onScrollCallback?.needUpdate()) {
      element.setAttribute('onScroll', this.onScrollCallback.getHandler());
    }
    if (this.onScrollEndCallback?.needUpdate()) {
      element.setAttribute('onScrollEnd', this.onScrollEndCallback.getHandler());
    }
    if (this.onDragStartCallback?.needUpdate()) {
      element.setAttribute('onDragStart', this.onDragStartCallback.getHandler());
    }
    if (this.onDragEndingCallback?.needUpdate()) {
      element.setAttribute('onDragEnding', this.onDragEndingCallback.getHandler());
    }
    if (this.onDragEndCallback?.needUpdate()) {
      element.setAttribute('onDragEnd', this.onDragEndCallback.getHandler());
    }
  }

  private onScrollRegionWillChange(listener: ScrollViewListener, event: ScrollViewRegionEvent): void {
    listener.onScrollRegionWillChange?.(event);
  }

  private onScrollRegionDidChange(listener: ScrollViewListener): void {
    listener.onScrollRegionDidChange?.();
  }

  private onLayout(listener: ScrollViewListener, frame: ElementFrame): void {
    listener.onLayout?.(frame);
  }

  private onScroll(listener: ScrollViewListener, event: ScrollEvent): void {
    listener.onScroll?.(event);
  }

  private onScrollEnd(listener: ScrollViewListener, event: ScrollEndEvent): void {
    listener.onScrollEnd?.(event);
  }

  private onDragStart(listener: ScrollViewListener, frame: ScrollEvent): void {
    listener.onDragStart?.(frame);
  }

  private onDragEnding(listener: ScrollViewListener, frame: ScrollDragEndingEvent): ScrollOffset | undefined {
    return listener.onDragEnding?.(frame);
  }

  private onDragEnd(listener: ScrollViewListener, event: ScrollDragEndEvent): void {
    listener.onDragEnd?.(event);
  }
}
