import { onIdleInterruptible } from 'valdi_core/src/utils/OnIdle';

export interface DeferredItemsRendererListener {
  onReadyToRenderNewItems(deferredItemsRenderer: DeferredItemsRenderer): void;
}

/**
 * The deferredItemsRenderer allows to limit the number of items
 * to render in a component to reduce first render latency.
 * It will repeatedly keep calling its listener up until all items
 * have been rendered.
 */
export class DeferredItemsRenderer {
  readonly initialItemsCount: number;
  readonly itemsCountIncrement: number;

  private listener: DeferredItemsRendererListener;
  private renderedItemsCount: number;
  private currentAllowedItems: number;
  private newRenderScheduled = false;

  constructor(initialItemsCount: number, itemsCountIncrement: number, listener: DeferredItemsRendererListener) {
    this.initialItemsCount = initialItemsCount;
    this.itemsCountIncrement = itemsCountIncrement;
    this.listener = listener;

    this.renderedItemsCount = 0;
    this.currentAllowedItems = this.initialItemsCount;
  }

  /**
   * Notifies that items are going to be rendered.
   */
  prepareForRender(): void {
    this.renderedItemsCount = 0;
  }

  /**
   * Notifies that an item from a section is going to be rendered.
   * Returns whether the item should be rendered.
   */
  shouldRenderNextItem(): boolean {
    if (this.renderedItemsCount >= this.currentAllowedItems) {
      if (!this.newRenderScheduled) {
        this.newRenderScheduled = true;
        onIdleInterruptible(() => {
          this.newRenderScheduled = false;
          this.renderNextItemsIfNeeded();
        });
      }
      return false;
    }
    this.renderedItemsCount++;
    return true;
  }

  private renderNextItemsIfNeeded(): void {
    this.currentAllowedItems += this.itemsCountIncrement;

    this.prepareForRender();
    this.listener.onReadyToRenderNewItems(this);
  }
}
