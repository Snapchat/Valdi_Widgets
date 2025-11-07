import { StatefulComponent } from 'valdi_core/src/Component';
import { Subscription } from 'valdi_rxjs/src/Subscription';
import { ScrollViewHandler } from 'widgets/src/components/scroll/ScrollViewHandler';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { PullToRefresh, PullToRefreshEvent } from '../refresh/PullToRefresh';
import { ScrollBarHandler } from '../scroll/scrollbar/ScrollBarHandler';
import { TabsContent, TabsContentLoading } from '../tabs/TabsContent';
import { TabsCoordinator } from '../tabs/TabsCoordinator';
import { TabsHeader } from '../tabs/TabsHeader';
import { TabsItem } from '../tabs/TabsItem';
import { Subscreen } from './Subscreen';
import { SubscreenContent } from './SubscreenContent';
import { SubscreenHeader, SubscreenHeaderPacking } from './SubscreenHeader';

export interface SubscreenTabsViewModel {
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
   * Do we need to render the header for the tabs?
   */
  hideTabsHeader?: boolean;
  /**
   * Tabs header rendering flags (@see TabsHeaderViewModel)
   */
  tabsColumnsFixed?: boolean;
  tabsUnderlineHeight?: number;
  tabsUnderlineColor?: SemanticColor;
  tabsBottomRulerHeight?: number;
  tabsBottomRulerColor?: SemanticColor;
  tabsUnfocusedOpacity?: number;
  tabsUnfocusedScale?: number;
  /**
   * Tabs content behavior flag (@see TabsContentViewModel)
   */
  tabsContentLoading?: TabsContentLoading;
  /**
   * Insets and padding setup
   */
  headerInsets?: boolean;
  headerSidePadding?: number;
  headerPacking?: SubscreenHeaderPacking;
  /**
   * Screen background setup
   */
  backgroundColor?: SemanticColor;
  backgroundOpacity?: number;
  headerBackgroundColor?: SemanticColor;
  /**
   * Scroll view behavior tweaks
   */
  scrollViewDismissKeyboardOnDrag?: boolean;
  scrollViewShowsScrollIndicator?: boolean;
  scrollViewBouncesFromDragAtStart?: boolean;
  scrollViewBouncesFromDragAtEnd?: boolean;
  scrollViewAccessibilityId?: string;
  /**
   * Optionally interact with the scroll view handler if needed
   */
  scrollViewHandler?: ScrollViewHandler;
  /**
   * Indicates whether the vertical scroll bar should be enabled
   */
  scrollBarEnabled?: boolean;
  /**
   * Optionally interact with the tabs coordinator if needed
   */
  tabsCoordinator?: TabsCoordinator;
  /**
   * Horizontal scrolling configuration, control TabsHeader
   */
  headerHorizontalScrollEnabled?: boolean;
  headerHorizontalScrollBouncesFromDragAtStart?: boolean;
  headerHorizontalScrollBouncesFromDragAtEnd?: boolean;
  /*
   * Horizontal scrolling configuration, control TabsContent
   */
  contentHorizontalScrollEnabled?: boolean;
  contentHorizontalScrollBouncesFromDragAtStart?: boolean;
  contentHorizontalScrollBouncesFromDragAtEnd?: boolean;
  /**
   * Optionally specify a pull-to-request behavior
   */
  onPullToRefresh?: (event: PullToRefreshEvent) => void;
  /**
   * Optionally specify a tab changed behavior
   */
  onTabChanged?: (index: number) => void;
  /**
   * Optionally specify Callback when the component is created
   */
  onCreated?(): void;
  /**
   * Optionally specify behavior when current tab is tapped
   */
  onCurrentTabTapped?(): void;
}

interface SubscreenTabsState {
  activeScrollBarHandler?: ScrollBarHandler;
  currentTabIndex: number;
}

export class SubscreenTabs extends StatefulComponent<SubscreenTabsViewModel, SubscreenTabsState> {
  state: SubscreenTabsState = {
    currentTabIndex: this.viewModel.tabsItemsInitialIndex || 0,
  };

  // To simplify the API, we provide default handlers if the consumer code doesn't need any special behavior
  private tabsCoordinator = new TabsCoordinator();
  private scrollViewHandler = new ScrollViewHandler();

  private lastTabsCoordinator?: TabsCoordinator;
  private onUpdateTabIndexSubscription?: Subscription;
  private onUpdateTabNavSubscription?: Subscription;

  onCreate(): void {
    this.viewModel.onCreated?.();
  }

  onRender(): void {
    const viewModel = this.viewModel ?? {};
    const state = this.state;

    // The tabs items passed to the tab components
    const tabsItemsArray = viewModel.tabsItemsArray;
    const tabsItemsInitialIndex = viewModel.tabsItemsInitialIndex;
    const tabsColumnsFixed = viewModel.tabsColumnsFixed;
    const tabsUnderlineHeight = viewModel.tabsUnderlineHeight;
    const tabsUnderlineColor = viewModel.tabsUnderlineColor;
    const tabsBottomRulerHeight = viewModel.tabsBottomRulerHeight;
    const tabsBottomRulerColor = viewModel.tabsBottomRulerColor;
    const tabsUnfocusedOpacity = viewModel.tabsUnfocusedOpacity;
    const tabsUnfocusedScale = viewModel.tabsUnfocusedScale;
    const tabsContentLoading = viewModel.tabsContentLoading;

    // Check if we need to use any external handler
    const tabsCoordinator = this.getTabsCoordinator();
    const scrollViewHandler = viewModel.scrollViewHandler ?? this.scrollViewHandler;

    // Styling is different depending if we need sticky headers animations or not
    const packing = viewModel.headerPacking ?? 'cut';
    const styling = 'hovering';

    // Insets are optional and will impact rendering
    const headerInsets = viewModel.headerInsets ?? true;
    const headerSidePadding = viewModel.headerSidePadding;
    const headerTabsMargin = headerSidePadding ? -headerSidePadding : -Subscreen.GUTTER_SIZE;

    // Background setup
    const backgroundColor = viewModel.backgroundColor;
    const backgroundOpacity = viewModel.backgroundOpacity;
    const headerBackgroundColor = viewModel.headerBackgroundColor;

    // Some options can be passed to control the scrollview specifically
    const scrollViewDismissKeyboardOnDrag = viewModel.scrollViewDismissKeyboardOnDrag ?? true;
    const scrollViewShowsScrollIndicator = viewModel.scrollViewShowsScrollIndicator ?? false;
    const scrollViewBouncesFromDragAtStart = viewModel.scrollViewBouncesFromDragAtStart;
    const scrollViewBouncesFromDragAtEnd = viewModel.scrollViewBouncesFromDragAtEnd;
    const scrollViewAccessibilityId = viewModel.scrollViewAccessibilityId;
    const scrollBarEnabled = viewModel.scrollBarEnabled;
    const activeScrollBarHandler = state.activeScrollBarHandler;

    // Horizontal scrolling configuration
    const headerHorizontalScrollEnabled = viewModel.headerHorizontalScrollEnabled;
    const headerHorizontalScrollBouncesFromDragAtStart = viewModel.headerHorizontalScrollBouncesFromDragAtStart;
    const headerHorizontalScrollBouncesFromDragAtEnd = viewModel.headerHorizontalScrollBouncesFromDragAtEnd;
    const contentHorizontalScrollEnabled = viewModel.contentHorizontalScrollEnabled;
    const contentHorizontalScrollBouncesFromDragAtStart = viewModel.contentHorizontalScrollBouncesFromDragAtStart;
    const contentHorizontalScrollBouncesFromDragAtEnd = viewModel.contentHorizontalScrollBouncesFromDragAtEnd;

    // Display tabs header by default, unless hideTabsHeader is set to true
    const hideTabsHeader = viewModel.hideTabsHeader ?? false;

    // Optionally uses pull to refresh; disabled by default
    const onPullToRefresh = viewModel.onPullToRefresh;

    // Now instanciate all the necessary components with the parameters that makes them compatible with each other
    <Subscreen
      scrollViewHandler={scrollViewHandler}
      headerStyling={styling}
      scrollViewDismissKeyboardOnDrag={scrollViewDismissKeyboardOnDrag}
      scrollViewShowsScrollIndicator={scrollViewShowsScrollIndicator}
      scrollViewBouncesFromDragAtStart={scrollViewBouncesFromDragAtStart}
      scrollViewBouncesFromDragAtEnd={scrollViewBouncesFromDragAtEnd}
      scrollViewAccessibilityId={scrollViewAccessibilityId}
      backgroundColor={backgroundColor}
      backgroundOpacity={backgroundOpacity}
      headerBackgroundColor={headerBackgroundColor}
      scrollBarHandler={scrollBarEnabled ? activeScrollBarHandler : undefined}
    >
      <slotted slot='header'>
        <SubscreenHeader packing={packing} disableInsets={!headerInsets} sidePadding={headerSidePadding}>
          <slot name='header' />
          <layout marginRight={headerTabsMargin} marginLeft={headerTabsMargin}>
            <TabsHeader
              isHidden={hideTabsHeader}
              tabsItemsArray={tabsItemsArray}
              tabsItemsInitialIndex={tabsItemsInitialIndex}
              tabsCoordinator={tabsCoordinator}
              tabsColumnsFixed={tabsColumnsFixed}
              underlineHeight={tabsUnderlineHeight}
              underlineColor={tabsUnderlineColor}
              bottomRulerHeight={tabsBottomRulerHeight}
              bottomRulerColor={tabsBottomRulerColor}
              unfocusedOpacity={tabsUnfocusedOpacity}
              unfocusedScale={tabsUnfocusedScale}
              horizontalScrollEnabled={headerHorizontalScrollEnabled}
              horizontalScrollBouncesFromDragAtStart={headerHorizontalScrollBouncesFromDragAtStart}
              horizontalScrollBouncesFromDragAtEnd={headerHorizontalScrollBouncesFromDragAtEnd}
              onItemFocusChanged={this.onItemFocusChanged}
              onCurrentTabTapped={viewModel.onCurrentTabTapped}
            />
          </layout>
        </SubscreenHeader>
      </slotted>
      <slotted>
        <PullToRefresh scrollViewHandler={scrollViewHandler} onPullToRefresh={onPullToRefresh}>
          <SubscreenContent disableInsets={true} paddingTop={0} paddingBottom={0}>
            <TabsContent
              tabsCoordinator={tabsCoordinator}
              tabsContentLoading={tabsContentLoading}
              scrollViewHandler={scrollViewHandler}
              horizontalScrollEnabled={contentHorizontalScrollEnabled}
              horizontalScrollBouncesFromDragAtStart={contentHorizontalScrollBouncesFromDragAtStart}
              horizontalScrollBouncesFromDragAtEnd={contentHorizontalScrollBouncesFromDragAtEnd}
            />
          </SubscreenContent>
        </PullToRefresh>
      </slotted>
    </Subscreen>;
  }

  onItemFocusChanged = (index: number, focusRatio: number): void => {
    if (focusRatio === 1 && index !== this.state.currentTabIndex) {
      this.setState({ currentTabIndex: index });
      this.viewModel.onTabChanged?.(index);
    }
  };

  onViewModelUpdate(): void {
    const tabsCoordinator = this.getTabsCoordinator();
    if (this.lastTabsCoordinator !== tabsCoordinator) {
      this.lastTabsCoordinator = tabsCoordinator;
      this.unsubscribe();
      this.subscribe();
    }
  }

  onDestroy(): void {
    this.unsubscribe();
    this.lastTabsCoordinator = undefined;
  }

  private subscribe(): void {
    if (this.viewModel.scrollBarEnabled) {
      const tabsCoordinator = this.getTabsCoordinator();
      this.onUpdateTabIndexSubscription = tabsCoordinator.index.subscribe(this.onUpdateTabIndex.bind(this));
      this.onUpdateTabNavSubscription = tabsCoordinator.onNav.subscribe(this.onUpdateTabNav.bind(this));
    }
  }

  private unsubscribe(): void {
    this.onUpdateTabIndexSubscription?.unsubscribe();
    this.onUpdateTabNavSubscription?.unsubscribe();
    this.onUpdateTabIndexSubscription = undefined;
    this.onUpdateTabNavSubscription = undefined;
  }

  private getTabsCoordinator(): TabsCoordinator {
    return this.viewModel.tabsCoordinator ?? this.tabsCoordinator;
  }

  private readonly onUpdateTabIndex = (): void => {
    this.setState({
      activeScrollBarHandler: undefined,
    });
  };

  private readonly onUpdateTabNav = (index: number): void => {
    const tabsItemsArray = this.viewModel.tabsItemsArray;
    if (index < tabsItemsArray.length) {
      const item = tabsItemsArray[index];
      this.setState({
        activeScrollBarHandler: item.scrollBarHandler,
      });
    }
  };
}
