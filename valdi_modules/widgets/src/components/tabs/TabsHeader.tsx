import { StatefulComponent } from 'valdi_core/src/Component';
import { ElementRef } from 'valdi_core/src/ElementRef';
import { setTimeoutInterruptible } from 'valdi_core/src/SetTimeout';
import { Style } from 'valdi_core/src/Style';
import { Subscription } from 'valdi_rxjs/src/Subscription';
import { ElementFrame } from 'valdi_tsx/src/Geometry';
import { ScrollEvent } from 'valdi_tsx/src/GestureEvents';
import { Layout, ScrollView, View } from 'valdi_tsx/src/NativeTemplateElements';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { Spacing } from 'widgets/src/styles/spacing';
import { clamp, lerp } from 'foundation/src/number';
import { ScrollViewHandler } from '../scroll/ScrollViewHandler';
import { ScrollViewSubscription } from '../scroll/ScrollViewSubscription';
import { TabsCoordinator, TabsCoordinatorItems } from './TabsCoordinator';
import { TabsItem } from './TabsItem';

interface TabsHeaderViewContext {
  /**
   * Defaults to false.
   */
  callOnScrollOnMainThread?: boolean;
}

export interface TabsHeaderViewModel {
  /**
   * Coordinator object, create the connection between TabsHeader<->TabsContent
   */
  tabsCoordinator: TabsCoordinator;
  /**
   * The list of tabs to render, contains all tabs information
   * note: MAKE SURE NOT TO RE-GENERATE THIS ARRAY ON ALL RENDERS
   */
  tabsItemsArray: TabsItem[];
  /**
   * Specify the tab to be focused when the list of tabs is reset
   */
  tabsItemsInitialIndex?: number;
  /**
   * If set to true, the width of the titles is fixed, doesn't depend on text (defaults to true)
   */
  tabsColumnsFixed?: boolean;
  /**
   * If set to true, the tabs will be spaced out (defaults to true)
   */
  tabsColumnsSpaced?: boolean;
  /**
   * Optionally, we can display a ruler in the bottom
   */
  bottomRulerHeight?: number;
  bottomRulerColor?: SemanticColor;
  /**
   * Underline under the currently focused item
   */
  underlineHeight?: number;
  underlineColor?: SemanticColor;
  /**
   * Visual transition between the focused/unfocused items
   */
  unfocusedOpacity?: number;
  unfocusedScale?: number;

  /**
   * Called before every state index change
   */
  onItemIndexChanged?: (index: number | undefined) => void;

  /**
   * Called on every scroll tick for every tabs (performance is critical here)
   * Used to create a smooth transition between focus/unfocus visuals on tabs
   * Make sure to only do the minimum amount of work,
   * Make sure NOT TO TRIGGER ANY LAYOUT CHANGES IN HERE (translation/opacity/scale changes allowed)
   */
  onItemFocusChanged?: (index: number, focusRatio: number) => void;
  /**
   * TabsHeader is tightly coupled with TabsContent and controls the coordinator.
   * In some cases, we want to hide the tabsHeader but display the content.
   * For example, if we have one tab.
   */
  isHidden?: boolean;
  /**
   * Some configuration parameters for the horizontal scroll view
   */
  horizontalScrollEnabled?: boolean;
  horizontalScrollBouncesFromDragAtStart?: boolean;
  horizontalScrollBouncesFromDragAtEnd?: boolean;
  horizontalScrollPadding?: number;
  horizontalScrollFadingEdgeLength?: number;
  /**
   * Called on tap on the current active tab
   * Used to define the behavior when the user taps on the current active tab
   */
  onCurrentTabTapped?: () => void;
}

interface TabsHeaderItem {
  tap: () => void;
  render: (focused: boolean) => void;
}

interface TabsHeaderState {
  items?: TabsHeaderItem[];
  currentIndex?: number;
}

export class TabsHeader extends StatefulComponent<TabsHeaderViewModel, TabsHeaderState, TabsHeaderViewContext> {
  private static sides = Spacing.XS;

  state: TabsHeaderState = {};

  private refItemsBar = new ElementRef<Layout>();

  private refItemsOuter = new ElementRef<View>();
  private refItemsInner = new ElementRef<Layout>();

  private refHighlightBar = new ElementRef<Layout>();
  private refHighlightRuler = new ElementRef<View>();
  private refHighlightUnderline = new ElementRef<View>();

  private subscriptionIndex?: Subscription;
  private subscriptionItems?: Subscription;

  private subscriptionOnTap?: Subscription;
  private subscriptionOnNav?: Subscription;

  private scrollViewHandler = new ScrollViewHandler();
  private scrollViewSubscription?: ScrollViewSubscription;

  private isReady = false;
  private isAnimating = false;
  private startingIndex: number | undefined;
  private destinationIndex: number | undefined;

  private currentWidth: number | undefined;
  private currentFrames: ElementFrame[] | undefined;

  private isDirtyLayout = false;

  /**
   * When the scrollview size change, we'll need to recompute the layout
   */
  private scrollViewListener = {
    onLayout: (frame: ElementFrame): void => {
      this.currentWidth = frame.width;
      this.dirtyLayouts();
    },
    onScroll: (event: ScrollEvent): void => {
      this.refHighlightRuler.setAttribute('translationX', event.x);
    },
  };

  /**
   * Life cycle
   */
  onCreate(): void {
    const callOnScrollOnMainThread = this.context.callOnScrollOnMainThread;
    this.scrollViewSubscription = this.scrollViewHandler.subscribeListener(this.scrollViewListener, {
      callOnScrollOnMainThread: callOnScrollOnMainThread === true,
    });
    this.renderer.batchUpdates(() => {
      this.refItemsBar.setAttribute('width', 0);
      this.refItemsBar.setAttribute('height', 0);
      this.refItemsOuter.setAttribute('marginLeft', 0);
      this.refItemsOuter.setAttribute('paddingLeft', 0);
      this.refItemsOuter.setAttribute('paddingRight', 0);
      this.refItemsOuter.setAttribute('scaleX', 0);
      this.refItemsOuter.setAttribute('scaleY', 0);
      this.refItemsOuter.setAttribute('opacity', 0);
      this.refHighlightBar.setAttribute('height', 0);
      this.refHighlightRuler.setAttribute('top', 0);
      this.refHighlightRuler.setAttribute('height', 0);
      this.refHighlightUnderline.setAttribute('top', 0);
      this.refHighlightUnderline.setAttribute('height', 0);
      this.refHighlightUnderline.setAttribute('translationX', 0);
      this.refHighlightUnderline.setAttribute('scaleX', 0);
      this.refHighlightUnderline.setAttribute('opacity', 0);
    });
  }
  onViewModelUpdate(lastViewModel?: TabsHeaderViewModel): void {
    const newViewModel = this.viewModel;
    const tabsCoordinator = newViewModel.tabsCoordinator;
    const tabsItemsArray = newViewModel.tabsItemsArray;
    const tabsItemsInitialIndex = newViewModel.tabsItemsInitialIndex;
    const tabsCoordinatorChanged = tabsCoordinator !== lastViewModel?.tabsCoordinator;
    const tabsItemsChanged = tabsItemsArray !== lastViewModel?.tabsItemsArray;
    if (tabsCoordinatorChanged) {
      this.unsubscribe();
      this.subscribe();
    }
    if (tabsCoordinatorChanged || tabsItemsChanged) {
      tabsCoordinator.items.next({
        array: tabsItemsArray,
        initialIndex: tabsItemsInitialIndex,
      });
    }
  }
  onDestroy(): void {
    this.scrollViewSubscription?.unsubscribe();
    this.unsubscribe();
  }

  /**
   * Rendering, here we want to render the content of each header
   * note that all dynamic attributes will be adjusted manually on events
   * for performance reasons (to avoid constantly re-rendering content)
   */
  onRender(): void {
    const viewModel = this.viewModel;
    if (viewModel.isHidden) {
      return;
    }
    <scroll
      style={styles.scroll}
      ref={this.scrollViewHandler}
      scrollEnabled={viewModel.horizontalScrollEnabled}
      bouncesFromDragAtStart={viewModel.horizontalScrollBouncesFromDragAtStart}
      bouncesFromDragAtEnd={viewModel.horizontalScrollBouncesFromDragAtEnd}
      paddingLeft={viewModel.horizontalScrollPadding}
      paddingRight={viewModel.horizontalScrollPadding}
      fadingEdgeLength={viewModel.horizontalScrollFadingEdgeLength}
    >
      <layout style={styles.itemBar} ref={this.refItemsBar}>
        {this.onRenderItems()}
      </layout>
      <layout ref={this.refHighlightBar} style={styles.highlightBar}>
        <view
          ref={this.refHighlightRuler}
          style={styles.highlightRuler}
          backgroundColor={this.viewModel.bottomRulerColor}
        />
        <view
          ref={this.refHighlightUnderline}
          style={styles.highlightUnderline}
          backgroundColor={this.viewModel.underlineColor}
        />
      </layout>
    </scroll>;
  }
  private onRenderItems(): void {
    const items = this.state.items ?? [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      <view
        style={styles.itemOuter}
        ref={this.refItemsOuter}
        onTap={item.tap}
        accessibilityId={`tabs_header_item_${i}`}
        accessibilityCategory='button'
      >
      <layout style={styles.itemInner} ref={this.refItemsInner} onLayout={this.onLayoutItem}>
          {item.render(i === this.state.currentIndex)}
        </layout>
      </view>;
    }
  }

  /**
   * Observables
   */
  private subscribe(): void {
    const coordinator = this.viewModel.tabsCoordinator;
    this.subscriptionIndex = coordinator.index.subscribe(idx => this.onUpdateIndex(idx));
    this.subscriptionItems = coordinator.items.subscribe(items => this.onUpdateItems(items));
    this.subscriptionOnTap = coordinator.onTap.subscribe(idx => this.onTriggerTap(idx));
    this.subscriptionOnNav = coordinator.onNav.subscribe(this.onTriggerNav.bind(this));
  }
  private unsubscribe(): void {
    this.subscriptionIndex?.unsubscribe();
    this.subscriptionItems?.unsubscribe();
    this.subscriptionOnTap?.unsubscribe();
    this.subscriptionOnNav?.unsubscribe();
  }

  /**
   * When index change, render for highlight change and we scroll to current spot
   */
  private onUpdateIndex = (index?: number): void => {
    this.updateIndex(index);

    const ready = this.isReady;
    const animating = this.isAnimating;
    if (ready && !animating) {
      this.updateScroll(index, false);
    }
  };

  /**
   * When items changes, we need to recompute the spacing for header items for future rendering
   */
  private onUpdateItems = (items?: TabsCoordinatorItems): void => {
    this.renderer.batchUpdates(() => {
      this.currentFrames = undefined;
      this.setState({
        items: items?.array?.map((item, index) => {
          return {
            render: item.renderHeader.bind(item),
            tap: () => {
              const ready = this.isReady;
              const animating = this.isAnimating;
              const focused = this.state.currentIndex === index;
              if (ready && !animating) {
                if (!focused) {
                  this.viewModel.tabsCoordinator.onTap.next(index);
                } else {
                  this.viewModel.onCurrentTabTapped?.();
                }
              }
            },
          };
        }),
      });
      this.dirtyLayouts();
    });
  };

  /**
   * When an item gets tapped, we scroll to it
   */
  private onTriggerTap = (index: number): void => {
    const ready = this.isReady;
    const animating = this.isAnimating;
    if (ready && !animating) {
      this.startingIndex = this.state.currentIndex;
      this.destinationIndex = index;
      this.updateScroll(index, true);
      this.isAnimating = true;
    }
  };

  /**
   * When an item gets navigated to, we stopped animating
   */
  private onTriggerNav = (): void => {
    this.isAnimating = false;
    this.startingIndex = undefined;
    this.destinationIndex = undefined;
  };

  /**
   * When the items re-layout, we'll need to recompute the layout
   */
  private onLayoutItem = (): void => {
    this.dirtyLayouts();
  };

  /**
   * Schedule a re-computation of the layouts
   */
  private dirtyLayouts(): void {
    if (!this.isDirtyLayout) {
      this.isDirtyLayout = true;
      this.isReady = false;
      setTimeoutInterruptible(() => {
        this.renderer.batchUpdates(() => {
          this.updateLayouts();
          this.updateIndex(this.state.currentIndex);
          this.updateScroll(this.state.currentIndex, false);
          this.isDirtyLayout = false;
        });
      });
    }
  }

  /**
   * Layout computing, make sure items are properly spaced
   */
  private updateLayouts(): void {
    // Check if we should run the item computation
    const itemsInner = this.refItemsInner.all();
    const framesInner = itemsInner.map(item => item.frame);
    if (framesInner.length <= 0) {
      return;
    }
    const width = this.currentWidth;
    if (width === undefined) {
      return;
    }
    // If we need a fixed width, compute the max width of all contents
    const fixedMode = this.viewModel.tabsColumnsFixed ?? true;
    let fixedWidth: number | undefined = undefined;
    if (fixedMode) {
      let maxWidth = 0;
      for (const frameInner of framesInner) {
        maxWidth = Math.max(maxWidth, Math.ceil(frameInner.width));
      }
      fixedWidth = maxWidth;
    }
    // Based on previous data, check the size of all elements
    let sumWidthFixed = 0;
    let sumWidthDynamic = 0;
    for (const frameInner of framesInner) {
      const frameWidth = frameInner.width;
      sumWidthFixed += fixedWidth ?? frameWidth;
      sumWidthDynamic += frameWidth;
    }
    // Based on previous data, check if we have overflow
    const windowWidth = width - TabsHeader.sides * 2;
    const overflowFixed = sumWidthFixed > windowWidth;
    const overflowDynamic = sumWidthDynamic > windowWidth;
    // If we overflow we may want to choose between fixed and dynamic columns
    let overflowChosen = overflowDynamic;
    let sumWidthChosen = sumWidthDynamic;
    if (fixedWidth !== undefined) {
      // If the fixed items are overflowing, disable fixed width logic
      if (overflowFixed) {
        fixedWidth = undefined;
      }
      // Otherwise we simply use the fixed width for all items
      else {
        overflowChosen = overflowFixed;
        sumWidthChosen = sumWidthFixed;
      }
    }
    // Based on previous data, find the most suitable spacer
    const useSpacer = this.viewModel.tabsColumnsSpaced ?? true;
    let computedSpacer = 0;
    if (useSpacer) {
      if (!overflowChosen) {
        computedSpacer = Math.floor((windowWidth - sumWidthChosen) / framesInner.length);
      } else {
        const spacersConsidered = [0, 2, 4, 6, 8, 10, 12];
        const spacersPeekingScores = spacersConsidered.map(value => {
          return {
            score: this.computePeekingScore(windowWidth, value, framesInner, fixedWidth),
            value: value,
          };
        });
        const bestSpacer = spacersPeekingScores.reduce((prev, curr) => {
          const prevScore = prev.score ?? 0;
          const currScore = curr.score ?? 0;
          return prevScore < currScore ? prev : curr;
        });
        computedSpacer = bestSpacer.value;
      }
    }
    // Now that we have everything, compute all layouts
    const framesOuter: ElementFrame[] = [];
    let currentWidth = TabsHeader.sides;
    let maxHeight = 0;
    for (const frameInner of framesInner) {
      const x = currentWidth;
      const width = (fixedWidth ?? frameInner.width) + computedSpacer;
      const height = frameInner.height;
      framesOuter.push({
        x: x,
        y: 0,
        width: width,
        height: height,
      });
      currentWidth += width;
      maxHeight = Math.max(maxHeight, height);
    }
    currentWidth += TabsHeader.sides;
    // Update current rendering
    this.renderer.batchUpdates(() => {
      this.refItemsBar.setAttribute('width', currentWidth);
      this.refItemsBar.setAttribute('height', maxHeight);
      const itemsOuter = this.refItemsOuter.all();
      for (let i = 0; i < itemsOuter.length; i++) {
        const itemOuter = itemsOuter[i];
        const frameOuter = framesOuter[i];
        const frameInner = framesInner[i];
        const padding = (frameOuter.width - frameInner.width) / 2;
        itemOuter.setAttribute('marginLeft', frameOuter.x);
        itemOuter.setAttribute('paddingLeft', padding);
        itemOuter.setAttribute('paddingRight', padding);
      }
      const ruler = this.viewModel.bottomRulerHeight ?? 0;
      const underline = this.viewModel.underlineHeight ?? 3;
      const height = Math.max(underline, ruler);
      this.refHighlightBar.setAttribute('height', height);
      this.refHighlightRuler.setAttribute('top', height - ruler);
      this.refHighlightRuler.setAttribute('height', ruler);
      this.refHighlightUnderline.setAttribute('top', height - underline);
      this.refHighlightUnderline.setAttribute('height', underline);
    });
    // Save new frames
    this.isReady = true;
    this.currentFrames = framesOuter;
  }

  /**
   * Focus index update, optionally change the transparency, scale and underline
   */
  private updateIndex(currentIndex?: number): void {
    this.renderer.batchUpdates(() => {
      // Only update state's selected index when its fully settled
      // to avoid extra updates during transitions.
      if (Number.isInteger(currentIndex)) {
        this.viewModel.onItemIndexChanged?.(currentIndex);
        this.setState({ currentIndex: currentIndex });
      }
      const index = currentIndex;
      const frames = this.currentFrames;
      if (index !== undefined && frames !== undefined) {
        const items = this.refItemsOuter.all();
        const unfocusedOpacity = this.viewModel.unfocusedOpacity ?? 0.5;
        const unfocusedScale = this.viewModel.unfocusedScale ?? 1;
        for (let i = 0; i < items.length; i++) {
          const distance = Math.abs(i - index);
          const focused = 1 - clamp(distance, 0, 1);
          const opacity = lerp(unfocusedOpacity, 1, focused);
          const scale = lerp(unfocusedScale, 1, focused);
          const item = items[i];
          item.setAttribute('scaleX', scale);
          item.setAttribute('scaleY', scale);
          item.setAttribute('opacity', opacity);
          this.viewModel.onItemFocusChanged?.(i, focused);
        }
        const positioning = this.computePositioning(index);
        this.refHighlightUnderline.setAttribute('translationX', positioning.left + positioning.width / 2);
        this.refHighlightUnderline.setAttribute('scaleX', positioning.width);
        this.refHighlightUnderline.setAttribute('opacity', 1);
      } else {
        this.refItemsOuter.setAttribute('opacity', 0);
        this.refHighlightUnderline.setAttribute('opacity', 0);
      }
    });
  }

  /**
   * Scroll position updater (used to ensure current tab is centered)
   */
  private updateScroll(index?: number, animated?: boolean): void {
    const width = this.currentWidth;
    if (!width) {
      return;
    }
    const frames = this.currentFrames;
    if (!frames) {
      return;
    }
    const positioning = this.computeFinalPositioning(index);
    const last = frames[frames.length - 1];
    const center = positioning.left + positioning.width / 2;
    const x = center - width / 2;
    const scrollPadding = this.viewModel.horizontalScrollPadding ?? 0;
    const clamped = clamp(x, 0, last.x + last.width - width + TabsHeader.sides + scrollPadding);
    this.scrollViewHandler.scrollTo(clamped, 0, animated ?? false);
  }

  /**
   * Computate the current tab horizontal positioning, based on fractional index
   */
  private computePositioning(fractionalIndex?: number): { left: number; width: number } {
    const frames = this.currentFrames;
    if (frames === undefined || fractionalIndex === undefined || frames.length <= 0) {
      return {
        left: 0,
        width: 0,
      };
    }
    let left: number;
    let width: number;
    const clamped = Math.max(0, Math.min(frames.length - 1, fractionalIndex));
    if (this.destinationIndex === undefined) {
      const indexFloor = Math.floor(clamped);
      const indexCeil = Math.ceil(clamped);
      const ratioFloor = indexCeil - fractionalIndex;
      const ratioCeil = 1 - ratioFloor;
      const frameFloor = frames[indexFloor];
      const frameCeil = frames[indexCeil];
      left = frameFloor.x * ratioFloor + frameCeil.x * ratioCeil;
      width = frameFloor.width * ratioFloor + frameCeil.width * ratioCeil;
    } else {
      const rangeIndexFloor = Math.min(this.startingIndex ?? 0, this.destinationIndex);
      const rangeIndexCeil = Math.max(this.startingIndex ?? 0, this.destinationIndex);
      const ratioFloor = (rangeIndexCeil - fractionalIndex) / (rangeIndexCeil - rangeIndexFloor);
      const ratioCeil = 1 - ratioFloor;
      const frameFloor = frames[rangeIndexFloor];
      const frameCeil = frames[rangeIndexCeil];
      left = frameFloor.x * ratioFloor + frameCeil.x * ratioCeil;
      width = frameFloor.width * ratioFloor + frameCeil.width * ratioCeil;
    }
    return {
      left: left,
      width: width,
    };
  }

  /**
   * Computate the final tab horizontal positioning, based on the index integer
   */
  private computeFinalPositioning(index?: number): { left: number; width: number } {
    const frames = this.currentFrames;
    if (frames === undefined || index === undefined || frames.length <= 0) {
      return {
        left: 0,
        width: 0,
      };
    }
    const clamped = Math.max(0, Math.min(frames.length - 1, index));
    const indexFloor = Math.floor(clamped);
    const indexCeil = Math.ceil(clamped);
    const ratioFloor = indexCeil - index;
    const ratioCeil = 1 - ratioFloor;
    const frameFloor = frames[indexFloor];
    const frameCeil = frames[indexCeil];
    const left = frameFloor.x * ratioFloor + frameCeil.x * ratioCeil;
    const width = frameFloor.width * ratioFloor + frameCeil.width * ratioCeil;
    return {
      left: left,
      width: width,
    };
  }

  /**
   * Compute the quality of a spacer to maximize peeking behavior
   */
  private computePeekingScore(
    window: number,
    spacer: number,
    framesInner: ElementFrame[],
    fixedWidth?: number,
  ): number | undefined {
    let left = 0;
    for (const frameInner of framesInner) {
      const width = (fixedWidth ?? frameInner.width) + spacer;
      if (left + width > window) {
        const center = left + width / 2;
        const distance = Math.abs(center - window);
        const score = distance / width;
        return score;
      }
      left += width;
    }
    return undefined;
  }
}

/**
 * Elements static styling
 */
const styles = {
  scroll: new Style<ScrollView>({
    horizontal: true,
    flexWrap: 'wrap',
    showsHorizontalScrollIndicator: false,
  }),
  itemBar: new Style<Layout>({
    flexDirection: 'row',
  }),
  itemOuter: new Style<View>({
    position: 'absolute',
  }),
  itemInner: new Style<Layout>({}),
  highlightBar: new Style<Layout>({
    minWidth: '100%',
  }),
  highlightRuler: new Style<View>({
    position: 'absolute',
    backgroundColor: SemanticColor.Layout.DIVIDER,
    left: 0,
    right: 0,
    limitToViewport: false,
  }),
  highlightUnderline: new Style<View>({
    position: 'absolute',
    backgroundColor: SemanticColor.Text.PRIMARY,
    width: 1,
    limitToViewport: false,
  }),
};
