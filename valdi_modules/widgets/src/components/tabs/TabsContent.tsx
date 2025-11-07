import { StatefulComponent } from 'valdi_core/src/Component';
import { ElementRef } from 'valdi_core/src/ElementRef';
import { Style } from 'valdi_core/src/Style';
import { RenderedElementUtils } from 'valdi_core/src/utils/RenderedElementUtils';
import { Subscription } from 'valdi_rxjs/src/Subscription';
import { AccessibilityPriority } from 'valdi_tsx/src/Accessibility';
import { ElementFrame } from 'valdi_tsx/src/Geometry';
import { ScrollEvent } from 'valdi_tsx/src/GestureEvents';
import { Layout, ScrollView, View } from 'valdi_tsx/src/NativeTemplateElements';
import { linearGradient } from 'widgets/src/styles/gradients';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { clamp } from 'foundation/src/number';
import { ScrollViewHandler } from '../scroll/ScrollViewHandler';
import { ScrollViewSubscription } from '../scroll/ScrollViewSubscription';
import { TabsCoordinator, TabsCoordinatorItems } from './TabsCoordinator';

export enum TabsContentLoading {
  // Will load all tabs content indiscriminately, never unload any
  Greedy,
  // Will lazily load content on visible tabs and adjacent tabs
  LazyNoUnload,
  // Will lazily load content on visible tabs and adjacent tabs, and unload all other
  LazyWithUnload,
  // Will lazily load only the visible tab (or partially visible tabs)
  AggressivelyLazyNoUnload,
  // Will lazily load only the visible tab (or partially visible tabs), and unload all other
  AggressivelyLazyWithUnload,
}

export interface TabsContentViewModel {
  /**
   * Coordinator object, create the connection between TabsHeader<->TabsContent
   */
  tabsCoordinator: TabsCoordinator;
  /**
   * Select the loading strategy for when to load and unload the content of each tab
   */
  tabsContentLoading?: TabsContentLoading;
  /**
   * ScrollViewHandler for the parent vertical scroll view,
   * needed to adjust tab content Y origin
   * when scrolling horizontally between tabs pages
   */
  scrollViewHandler: ScrollViewHandler;
  /**
   * Called when the user navigated to a new page
   */
  onNavigate?: (newIndex: number, oldIndex?: number) => void;
  /**
   * The amount of space that the tabs's content must leave available
   * in the parent scroll view so that sticky headers can be displayed
   */
  reservedTopSpace?: number;
  /**
   * Provide an easy way to optionally inject sticky content through the "sticky" slot
   * "sticky" content will be displayed floating exactly above the tabs content at all times
   */
  enableStickySlot?: boolean;
  /**
   * Some configuration parameters for the horizontal scroll view
   */
  horizontalScrollEnabled?: boolean;
  horizontalScrollBouncesFromDragAtStart?: boolean;
  horizontalScrollBouncesFromDragAtEnd?: boolean;
}

interface TabsContentItem {
  key: string;
  render: (focused: boolean) => void;
}

interface TabsContentState {
  ready?: boolean;
  focused?: number;
  items?: TabsContentItem[];
  renderMin?: number;
  renderMax?: number;
  verticalScrollViewHeight?: number;
}

export class TabsContent extends StatefulComponent<TabsContentViewModel, TabsContentState> {
  state: TabsContentState = {};

  private subscriptionIndex?: Subscription;
  private subscriptionItems?: Subscription;

  private subscriptionOnTap?: Subscription;
  private subscriptionOnNav?: Subscription;

  private subscriptionVertical?: ScrollViewSubscription;
  private subscriptionHorizontal?: ScrollViewSubscription;

  private horizontalScrollViewHandler = new ScrollViewHandler();
  private horizontalScrollViewWidth: number | undefined;

  private itemsInitialIndex: number | undefined;

  private containerRoot = new ElementRef<Layout>();

  private stickyContainer = new ElementRef<View>();
  private stickyGradient = new ElementRef<View>();

  private itemsFocused = new ElementRef<View>();
  private itemsUnfocused = new ElementRef<View>();

  /**
   * Local listeners
   */
  private verticalScrollViewListener = {
    onLayout: (frame: ElementFrame): void => {
      this.setStateAndGetReadyIfNeeded({
        verticalScrollViewHeight: frame.height,
      });
    },
    onScroll: (event: ScrollEvent): void => {
      this.renderer.batchUpdates(() => {
        // Compute the vertical translation needed to make unfocused tabs appear on the top of the scroll window
        const verticalOriginScrollY = this.getVerticalOriginScrollY();
        const reservedTopSpace = this.getReservedTopSpace();
        const verticalShift = Math.max(0, event.y - verticalOriginScrollY + reservedTopSpace);
        this.itemsFocused.setAttribute('translationY', 0);
        this.itemsUnfocused.setAttribute('translationY', verticalShift);
        // Optionally make the sticky header sticky if its used
        if (this.viewModel.enableStickySlot) {
          this.stickyContainer.setAttribute('translationY', Math.min(verticalShift, event.y));
          this.stickyGradient.setAttribute('opacity', Math.min(1, verticalShift / 10));
        } else {
          this.stickyContainer.setAttribute('translationY', 0);
          this.stickyGradient.setAttribute('opacity', 0);
        }
      });
    },
  };

  private horizontalScrollViewListener = {
    onLayout: (frame: ElementFrame): void => {
      this.horizontalScrollViewWidth = frame.width;
      this.setStateAndGetReadyIfNeeded({});
    },
    onScroll: (): void => {
      const scrollViewHandler = this.getHorizontalScrollViewHandler();
      const width = this.getHorizontalScrollViewWidth();
      const index = scrollViewHandler.scrollX / width;
      this.viewModel.tabsCoordinator.index.next(index);
    },
    onScrollEnd: (): void => {
      const scrollViewHandler = this.getHorizontalScrollViewHandler();
      const width = this.getHorizontalScrollViewWidth();
      const index = Math.round(scrollViewHandler.scrollX / width);
      this.viewModel.tabsCoordinator.index.next(index);
      this.viewModel.tabsCoordinator.onNav.next(index);
    },
  };

  /**
   * Life cycle
   */
  onCreate(): void {
    this.subscribeVerticalScroll();
    this.subscribeHorizontalScroll();
  }
  onViewModelUpdate(lastViewModel?: TabsContentViewModel): void {
    const tabsCoordinator = this.viewModel.tabsCoordinator;
    const tabsCoordinatorChanged = tabsCoordinator !== lastViewModel?.tabsCoordinator;
    if (tabsCoordinatorChanged) {
      this.unsubscribeCoordinator();
      this.subscribeCoordinator();
    }
  }
  onDestroy(): void {
    this.unsubscribeCoordinator();
    this.unsubscribeVerticalScroll();
    this.unsubscribeHorizontalScroll();
  }

  /**
   * Rendering
   */
  onRender(): void {
    const viewModel = this.viewModel;
    const minHeight = this.getVerticalScrollViewHeight() - this.getReservedTopSpace();
    <layout minHeight={minHeight} flexDirection='column-reverse' ref={this.containerRoot}>
      <scroll
        style={styles.scroll}
        ref={this.horizontalScrollViewHandler}
        scrollEnabled={viewModel.horizontalScrollEnabled}
        bouncesFromDragAtStart={viewModel.horizontalScrollBouncesFromDragAtStart}
        bouncesFromDragAtEnd={viewModel.horizontalScrollBouncesFromDragAtEnd}
      >
        {this.onRenderItems()}
      </scroll>
      {this.onRenderSticky()}
    </layout>;
  }
  private onRenderItems(): void {
    const items = this.state.items;
    if (items === undefined) {
      return;
    }
    const loading = this.viewModel.tabsContentLoading;
    const focused = this.state.focused;
    const ready = this.state.ready;
    const length = items.length;
    const renderMin = this.resolveRenderMin(loading);
    const renderMax = this.resolveRenderMax(loading);
    for (let i = 0; i < length; i++) {
      const item = items[i];
      const isFocused = i === focused;
      const isLoaded = i >= renderMin && i <= renderMax;
      const isRendered = ready && (isFocused || isLoaded);
      <layout style={styles.page} key={item.key}>
        <view
          style={styles.content}
          key={item.key}
          position={isFocused ? undefined : 'absolute'}
          ref={isFocused ? this.itemsFocused : this.itemsUnfocused}
          accessibilityNavigation={isFocused ? undefined : 'ignored'}
        >
          {isRendered ? item.render(isFocused) : undefined}
        </view>
      </layout>;
    }
  }
  private onRenderSticky(): void {
    if (!this.viewModel.enableStickySlot) {
      return;
    }
    <view ref={this.stickyContainer} limitToViewport={false} accessibilityPriority={AccessibilityPriority.High}>
      <slot name='sticky' />
      <view ref={this.stickyGradient} opacity={0} style={styles.stickyGradient} />
    </view>;
  }

  /**
   * Computing of the range of loaded tabs contents
   */
  private resolveRenderMin(loading?: TabsContentLoading): number {
    // Always render everything when greedy
    if (loading === TabsContentLoading.Greedy) {
      return -Infinity;
    }
    // Otherwise, render nothing until accurate render-min is available
    return this.state.renderMin ?? +Infinity;
  }
  private resolveRenderMax(loading?: TabsContentLoading): number {
    // Always render everything when greedy
    if (loading === TabsContentLoading.Greedy) {
      return +Infinity;
    }
    // Otherwise, render nothing until accurate render-max is available
    return this.state.renderMax ?? -Infinity;
  }

  /**
   * Vertical scroll (Listen to the parent vertical scroll view events for sizing and scrolling information)
   */
  private subscribeVerticalScroll(): void {
    const verticalScrollViewHandler = this.getVerticalScrollViewHandler();
    this.subscriptionVertical = verticalScrollViewHandler.subscribeListener(this.verticalScrollViewListener, {
      callOnScrollOnMainThread: this.viewModel.enableStickySlot, // must be main-thread-synced only when sticky
    });
    const frame = verticalScrollViewHandler.scrollViewFrame;
    if (frame && frame.height) {
      this.verticalScrollViewListener.onLayout(frame);
    }
  }
  private unsubscribeVerticalScroll(): void {
    this.subscriptionVertical?.unsubscribe();
    this.subscriptionVertical = undefined;
  }

  /**
   * Horizontal scroll (Listen to horizontal scroll to know when user changed tabs)
   */
  private subscribeHorizontalScroll(): void {
    const horizontalScrollViewHandler = this.getHorizontalScrollViewHandler();
    this.subscriptionHorizontal = horizontalScrollViewHandler.subscribeListener(this.horizontalScrollViewListener);
  }
  private unsubscribeHorizontalScroll(): void {
    this.subscriptionHorizontal?.unsubscribe();
    this.subscriptionHorizontal = undefined;
  }

  /**
   * Tabs coordinator observables listeners
   */
  private subscribeCoordinator(): void {
    const coordinator = this.viewModel.tabsCoordinator;
    this.subscriptionIndex = coordinator.index.subscribe(idx => this.onUpdateIndex(idx));
    this.subscriptionItems = coordinator.items.subscribe(items => this.onUpdateItems(items));
    this.subscriptionOnTap = coordinator.onTap.subscribe(idx => this.onTriggerTap(idx));
    this.subscriptionOnNav = coordinator.onNav.subscribe(idx => this.onTriggerNav(idx));
  }
  private unsubscribeCoordinator(): void {
    this.subscriptionIndex?.unsubscribe();
    this.subscriptionIndex = undefined;
    this.subscriptionItems?.unsubscribe();
    this.subscriptionItems = undefined;
    this.subscriptionOnTap?.unsubscribe();
    this.subscriptionOnTap = undefined;
    this.subscriptionOnNav?.unsubscribe();
    this.subscriptionOnNav = undefined;
  }

  /**
   * Coordinator state changes
   */
  private onUpdateIndex = (index?: number): void => {
    if (index === undefined) {
      this.setStateAndGetReadyIfNeeded({
        renderMin: undefined,
        renderMax: undefined,
      });
      return;
    }
    const loading = this.viewModel.tabsContentLoading ?? TabsContentLoading.LazyWithUnload;
    const indexPerceptible = Math.round(index * 100) / 100;
    const indexFloored = Math.floor(indexPerceptible);
    const indexRounded = Math.round(indexPerceptible);
    const indexCeiled = Math.ceil(indexPerceptible);
    const indexMinRange = indexRounded - 1;
    const indexMaxRange = indexRounded + 1;
    switch (loading) {
      case TabsContentLoading.Greedy: {
        this.setStateAndGetReadyIfNeeded({
          renderMin: -Infinity,
          renderMax: +Infinity,
        });
        break;
      }
      case TabsContentLoading.LazyNoUnload: {
        this.setStateAndGetReadyIfNeeded({
          renderMin: Math.min(indexMinRange, this.state.renderMin ?? indexMinRange),
          renderMax: Math.max(indexMaxRange, this.state.renderMax ?? indexMaxRange),
        });
        break;
      }
      case TabsContentLoading.LazyWithUnload: {
        this.setStateAndGetReadyIfNeeded({
          renderMin: indexMinRange,
          renderMax: indexMaxRange,
        });
        break;
      }
      case TabsContentLoading.AggressivelyLazyNoUnload: {
        this.setStateAndGetReadyIfNeeded({
          renderMin: Math.min(indexFloored, this.state.renderMin ?? indexFloored),
          renderMax: Math.max(indexCeiled, this.state.renderMax ?? indexCeiled),
        });
        break;
      }
      case TabsContentLoading.AggressivelyLazyWithUnload: {
        this.setStateAndGetReadyIfNeeded({
          renderMin: indexFloored,
          renderMax: indexCeiled,
        });
        break;
      }
    }
  };
  private onUpdateItems = (items?: TabsCoordinatorItems): void => {
    this.itemsInitialIndex = items?.initialIndex;
    this.setStateAndGetReadyIfNeeded({
      ready: false,
      renderMin: undefined,
      renderMax: undefined,
      items: items?.array?.map((item, index) => {
        return {
          key: item.key ?? index.toString(),
          render: item.renderContent.bind(item),
        };
      }),
    });
  };

  /**
   * Coordinator events
   */
  private onTriggerTap = (index: number): void => {
    if (index === undefined) {
      return;
    }
    const scrollViewHandler = this.getHorizontalScrollViewHandler();
    const offset = (scrollViewHandler.scrollViewFrame?.width ?? 0) * index;
    scrollViewHandler.scrollTo(offset, 0, this.viewModel.horizontalScrollEnabled ?? true);
  };
  private onTriggerNav = (index: number): void => {
    const oldIndex = this.state.focused;
    const newIndex = index;
    if (newIndex !== oldIndex) {
      this.renderer.batchUpdates(() => {
        // Compute the amount of scroll to move the tabs back to the top of the scroll window
        const verticalOriginScrollY = this.getVerticalOriginScrollY();
        const reservedTopSpace = this.getReservedTopSpace();
        const scrollViewHandler = this.getVerticalScrollViewHandler();
        // Scroll back up to it, if needed
        const adjustedScrollY = Math.min(scrollViewHandler.scrollY, verticalOriginScrollY - reservedTopSpace);
        scrollViewHandler.scrollToClamped(0, adjustedScrollY, false);
        this.setStateAndGetReadyIfNeeded({
          focused: newIndex,
        });
      });
    }
    const onNavigate = this.viewModel.onNavigate;
    if (onNavigate) {
      onNavigate(newIndex, oldIndex);
    }
  };

  /**
   * Getters
   */
  private getVerticalScrollViewHandler(): ScrollViewHandler {
    return this.viewModel.scrollViewHandler;
  }
  private getHorizontalScrollViewHandler(): ScrollViewHandler {
    return this.horizontalScrollViewHandler;
  }

  private getHorizontalScrollViewWidth(): number {
    return this.horizontalScrollViewWidth ?? 1;
  }

  private getReservedTopSpace(): number {
    return this.viewModel.reservedTopSpace ?? 0;
  }

  private getVerticalScrollViewHeight(): number {
    return this.state.verticalScrollViewHeight ?? 0;
  }

  private getVerticalOriginScrollY(): number {
    const verticalScrollViewElement = this.getVerticalScrollViewHandler().scrollView;
    const containerRootElement = this.containerRoot.single();
    if (verticalScrollViewElement === undefined || containerRootElement === undefined) {
      return 0;
    }
    const relativePosition = RenderedElementUtils.relativePositionTo(verticalScrollViewElement, containerRootElement);
    if (relativePosition === undefined) {
      return 0;
    }
    return relativePosition.y;
  }

  /**
   * Since the chain of event leading to full rendering can be
   * platform dependent and also timing dependent,
   * we simply check if every dependency is ready
   * before proceeding to the final "ready" setup
   */
  private setStateAndGetReadyIfNeeded(state: Partial<TabsContentState>): void {
    const updating = state.ready === false;
    const ready = this.state.ready && !updating;
    const items = state.items ?? this.state.items;
    const verticalScrollViewHeight = this.state.verticalScrollViewHeight;
    const horizontalScrollViewWidth = this.horizontalScrollViewWidth;
    if (
      ready ||
      items === undefined ||
      verticalScrollViewHeight === undefined ||
      horizontalScrollViewWidth === undefined
    ) {
      this.setState(state);
      return;
    }
    this.renderer.batchUpdates(() => {
      state.ready = true;
      this.setState(state);
      const origin = clamp(this.itemsInitialIndex ?? 0, 0, items.length - 1);
      const scrollViewHandler = this.getHorizontalScrollViewHandler();
      scrollViewHandler.scrollTo(horizontalScrollViewWidth * origin, 0, false);
      this.viewModel.tabsCoordinator.index.next(origin);
      this.viewModel.tabsCoordinator.onNav.next(origin);
    });
  }
}

/**
 * Elements static styling
 */
const stickyHeaderShadowHeight = 11;
const styles = {
  scroll: new Style<ScrollView>({
    pagingEnabled: true,
    horizontal: true,
    showsHorizontalScrollIndicator: false,
    flexGrow: 1,
  }),
  page: new Style<Layout>({
    width: '100%',
  }),
  content: new Style<View>({
    width: '100%',
  }),

  stickyGradient: new Style<View>({
    marginBottom: -stickyHeaderShadowHeight,
    height: stickyHeaderShadowHeight,
    background: linearGradient([
      [SemanticColor.Elevation.HEADER_SHADOW, 0],
      [SemanticColor.Flat.CLEAR, 1],
    ]),
    limitToViewport: false,
  }),
};
