import { Component } from 'valdi_core/src/Component';
import { when } from 'valdi_core/src/utils/When';
import { IndexView } from 'widgets/src/components/indexview/IndexView';
import { IndexViewHandler } from 'widgets/src/components/indexview/IndexViewHandler';
import { IndexViewSymbols } from 'widgets/src/components/indexview/IndexViewSymbols';
import { ScrollViewHandler } from 'widgets/src/components/scroll/ScrollViewHandler';
import { SectionList } from 'widgets/src/components/section/SectionList';
import { SectionModel } from 'widgets/src/components/section/SectionModel';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { RenderFunction } from '../RenderFunction';
import { IndexViewAnchor } from '../indexview/IndexViewAnchor';
import { IndexViewSymbol } from '../indexview/IndexViewSymbol';
import { lookupSymbolForString } from '../indexview/utils/lookupSymbolForString';
import { PullToRefresh, PullToRefreshEvent } from '../refresh/PullToRefresh';
import { ScrollBarHandler } from '../scroll/scrollbar/ScrollBarHandler';
import { Subscreen } from './Subscreen';
import { SubscreenContent } from './SubscreenContent';
import { SubscreenHeader } from './SubscreenHeader';

const INDEXVIEW_RIGHT_OFFSET = 9;
const INDEXVIEW_SIDE_PADDING = 20;

export interface SubscreenSectionViewModel {
  /**
   * Sections themselves
   */
  sections: SectionModel[];
  /**
   * Rendering options
   *
   * If your stickyHeaders are janky, you can set callOnScrollOnMainThread=true
   * but it may lead to ANRs on Android.
   */
  headerStyling?: 'hovering' | 'sticky' | 'alwaysHovering';
  headerBackgroundColor?: SemanticColor;
  /**
   * Index view options
   */
  indexViewEnabled?: boolean;
  indexViewSymbols?: IndexViewSymbol[];
  indexViewUsingSectionKeys?: boolean;
  /**
   * Insets and padding setup
   */
  headerInsets?: boolean;
  contentInsets?: boolean;
  contentPaddingTop?: number;
  contentPaddingBottom?: number;
  /**
   * Screen background setup
   */
  backgroundColor?: SemanticColor;
  backgroundOpacity?: number;
  /**
   * Scroll view behavior tweaks
   */
  scrollViewDismissKeyboardOnDrag?: boolean;
  scrollViewShowsScrollIndicator?: boolean;
  scrollViewBouncesFromDragAtStart?: boolean;
  scrollViewBouncesFromDragAtEnd?: boolean;
  scrollViewBottomOverscroll?: number;
  scrollViewAccessibilityId?: string;
  /**
   * Can be used to extend the visible viewport of the scroll element.
   * When scrolling, this will cause child elements to be rendered
   * potentially earlier, if the value is positive, or later, if the
   * value is negative.
   *
   * @default: 0
   */
  scrollViewViewportExtension?: number;

  /**
   * Optionally interact with the scroll view handler if needed
   */
  scrollViewHandler?: ScrollViewHandler;
  /**
   * Optionally interact with the IndexView for scrolling if needed
   */
  indexViewHandler?: IndexViewHandler;
  /**
   * Optionally allows the page to drop anchors to interact with the scroll bar
   */
  scrollBarHandler?: ScrollBarHandler;
  /**
   * Scrollbar focused item position can be controlled by changing the center of focus within the scrollview
   */
  scrollBarCenterOffset?: number;
  /**
   * Set a limit to how many items combined from all the sections
   * can be rendered in the first render pass. This can be used
   * to reduce first render latency, by first rendering the visible
   * items on the page, and then rendering the rest.
   *
   * If not set, the SectionList will render all the items at once.
   */
  initialMaxItemsCount?: number;
  /**
   * If initialMaxItemsCount is set, this will be used to define how many more
   * elements should be rendered once the max items count threshold has been reached.
   *
   * If not set but initialMaxItemsCount is set, the SectionList will render all the items
   * on the second render pass.
   */
  maxItemsCountIncrement?: number;
  /**
   * Optionally specify a pull-to-request behavior
   */
  onPullToRefresh?: (event: PullToRefreshEvent) => void;
  /**
   * Optionally specify a pull-to-request loading state
   */
  isLoading?: boolean;
  /**
   * If subscreenBodyOverrideRenderFunction is set, override the subscreen's body component (SectionList)
   * with the defined renderFunction.
   *
   * If not set, render SectionList
   */
  subscreenBodyOverrideRenderFunction?: RenderFunction;

  /**
   * Whether scroll events should be called on the main thread. The default value is false.
   * For sticky headers and other ui updates that need such synchronization, set this to true.
   *
   * WARNING: Enabling this may lead to ANRs on Android.
   */
  callOnScrollOnMainThread?: boolean;

  /**
   * default YES, allow the user to scroll up & down the ScrollView under the hood
   */
  scrollEnabled?: boolean;

  /**
   * Whether theming support is enabled.
   */
  themingEnabled?: boolean;
}

export class SubscreenSections extends Component<SubscreenSectionViewModel> {
  // To simplify the API, we provide default handlers if the consumer code doesn't need any special behavior
  private indexViewHandler = new IndexViewHandler();
  private scrollViewHandler = new ScrollViewHandler();

  onRender(): void {
    const viewModel = this.viewModel ?? {};

    // The section array to be passed to the section list
    let sections = viewModel.sections;

    // Check if we need to use any external handler
    const scrollViewHandler = viewModel.scrollViewHandler ?? this.scrollViewHandler;
    const indexViewHandler = viewModel.indexViewHandler ?? this.indexViewHandler;

    // Index view options
    const indexViewEnabled = viewModel.indexViewEnabled ?? false;
    const indexViewSymbols = viewModel.indexViewSymbols ?? [IndexViewSymbols.error];
    const indexViewUsingSectionKeys = viewModel.indexViewUsingSectionKeys ?? false;

    // Styling is different depending if we need sticky headers animations or not
    const headerStyling = viewModel.headerStyling ?? 'sticky';
    const headerSticky = headerStyling === 'sticky';
    const headerPacking = headerSticky ? 'cut' : 'condensed';
    const headerBackgroundColor = viewModel.headerBackgroundColor;

    // Insets are optional and will impact rendering
    const headerInsets = viewModel.headerInsets ?? true;
    const contentInsets = viewModel.contentInsets ?? true;
    const contentPaddingTop = viewModel.contentPaddingTop;
    const contentPaddingBottom = viewModel.contentPaddingBottom;

    // Background setup
    const backgroundColor = viewModel.backgroundColor;
    const backgroundOpacity = viewModel.backgroundOpacity;

    // Some padding and extra spacing is necessary depending if we have insets or section IndexView enabled
    const stickyFade = Subscreen.fadeDistance;
    const stickyCover = contentInsets ? Subscreen.GUTTER_SIZE : undefined;
    const indexViewOffset = contentInsets ? -Subscreen.GUTTER_SIZE : undefined;
    const indexViewPadding = indexViewEnabled ? INDEXVIEW_SIDE_PADDING : 0;

    // Some options can be passed to control the scrollview specifically
    const scrollViewDismissKeyboardOnDrag = viewModel.scrollViewDismissKeyboardOnDrag ?? true;
    const scrollViewShowsScrollIndicator = viewModel.scrollViewShowsScrollIndicator ?? false;
    const scrollViewBouncesFromDragAtStart = viewModel.scrollViewBouncesFromDragAtStart;
    const scrollViewBouncesFromDragAtEnd = viewModel.scrollViewBouncesFromDragAtEnd;
    const scrollViewBottomOverscroll = viewModel.scrollViewBottomOverscroll ?? 0;
    const scrollViewAccessibilityId = viewModel.scrollViewAccessibilityId;
    const scrollViewViewportExtension = viewModel.scrollViewViewportExtension;

    // Scroll bar setup
    const scrollBarHandler = viewModel.scrollBarHandler;
    const scrollBarCenterOffset = viewModel.scrollBarCenterOffset;

    // Lazy rendering parameters
    const initialMaxItemsCount = viewModel.initialMaxItemsCount;
    const maxItemsCountIncrement = viewModel.maxItemsCountIncrement;

    // Optionally uses pull to refresh; disabled by default
    const onPullToRefresh = viewModel.onPullToRefresh;
    const isLoading = viewModel.isLoading;
    const scrollEnabled = viewModel.scrollEnabled ?? true;

    // We can provide a default section header anchor point using section key and lattin character when wanted
    if (indexViewEnabled && indexViewUsingSectionKeys) {
      sections = sections.map(section => {
        return {
          key: section.key,
          onRenderAnchor: () => {
            const symbol = lookupSymbolForString(section.key);
            <IndexViewAnchor handler={indexViewHandler} symbol={symbol} />;
          },
          onRenderHeader: () => {
            if (section.onRenderHeader) {
              section.onRenderHeader();
            }
          },
          onRenderBody: section.onRenderBody,
        };
      });
    }

    // Now instanciate all the necessary components with the parameters that makes them compatible with each other
    <Subscreen
      scrollViewHandler={scrollViewHandler}
      headerStyling={headerStyling}
      headerBackgroundColor={headerBackgroundColor}
      scrollViewDismissKeyboardOnDrag={scrollViewDismissKeyboardOnDrag}
      scrollViewShowsScrollIndicator={scrollViewShowsScrollIndicator}
      scrollViewBouncesFromDragAtStart={scrollViewBouncesFromDragAtStart}
      scrollViewBouncesFromDragAtEnd={scrollViewBouncesFromDragAtEnd}
      scrollViewAccessibilityId={scrollViewAccessibilityId}
      scrollViewViewportExtension={scrollViewViewportExtension}
      backgroundColor={backgroundColor}
      backgroundOpacity={backgroundOpacity}
      scrollBarHandler={scrollBarHandler}
      scrollBarCenterOffset={scrollBarCenterOffset}
      scrollEnabled={scrollEnabled}
      themingEnabled={this.viewModel.themingEnabled}
    >
      <slotted slot='header'>
        <SubscreenHeader packing={headerPacking} disableInsets={!headerInsets}>
          <slot name='header' />
        </SubscreenHeader>
      </slotted>
      <slotted slot='floating'>
        {when(indexViewEnabled, () => {
          <layout
            position='absolute'
            top={Subscreen.floatingGutter}
            bottom={Subscreen.floatingGutter}
            right={INDEXVIEW_RIGHT_OFFSET}
          >
            <IndexView
              symbols={indexViewSymbols}
              indexViewHandler={indexViewHandler}
              scrollViewHandler={scrollViewHandler}
              extraOffsetY={indexViewOffset}
            />
          </layout>;
        })}
        <slot name='floating' />
      </slotted>
      <slotted>
        <PullToRefresh scrollViewHandler={scrollViewHandler} onPullToRefresh={onPullToRefresh} isLoading={isLoading}>
          <SubscreenContent
            disableInsets={!contentInsets}
            paddingTop={contentPaddingTop}
            paddingBottom={contentPaddingBottom}
          >
            <layout paddingRight={indexViewPadding}>
              {this.viewModel.subscreenBodyOverrideRenderFunction === undefined ? (
                <SectionList
                  sections={sections}
                  scrollViewHandler={scrollViewHandler}
                  stickyHeaders={headerSticky}
                  stickyHeadersBackgroundColor={headerBackgroundColor}
                  stickyCover={stickyCover}
                  stickySides={indexViewPadding}
                  stickyFade={stickyFade}
                  initialMaxItemsCount={initialMaxItemsCount}
                  maxItemsCountIncrement={maxItemsCountIncrement}
                  callOnScrollOnMainThread={viewModel.callOnScrollOnMainThread === true}
                />
              ) : (
                this.viewModel.subscreenBodyOverrideRenderFunction()
              )}
            </layout>
            <layout height={scrollViewBottomOverscroll} />
          </SubscreenContent>
        </PullToRefresh>
      </slotted>
    </Subscreen>;
  }
}
