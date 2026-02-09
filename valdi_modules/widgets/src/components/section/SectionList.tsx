import { Component, StatefulComponent } from 'valdi_core/src/Component';
import { ComponentRef } from 'valdi_core/src/ComponentRef';
import { ElementRef } from 'valdi_core/src/ElementRef';
import { IRenderedElement } from 'valdi_core/src/IRenderedElement';
import { Style } from 'valdi_core/src/Style';
import { AccessibilityPriority } from 'valdi_tsx/src/Accessibility';
import { CSSValue, View } from 'valdi_tsx/src/NativeTemplateElements';
import { ScrollViewHandler } from 'widgets/src/components/scroll/ScrollViewHandler';
import { ScrollViewListener } from 'widgets/src/components/scroll/ScrollViewListener';
import { DeferredItemsRenderer, DeferredItemsRendererListener } from 'widgets/src/components/util/DeferredItemsRenderer';
import { linearGradient } from 'widgets/src/styles/gradients';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { binarySearch } from 'coreutils/src/ArrayUtils';
import { clamp } from 'foundation/src/number';
import { ScrollViewSubscription } from '../scroll/ScrollViewSubscription';
import { SectionHandler } from './SectionHandler';
import { SectionModel } from './SectionModel';
import { SectionSeparator } from './SectionSeparator';

export interface SectionListViewModel {
  /**
   * The list of models to render
   */
  sections: SectionModel[];
  /**
   * The handler for the parent ScrollView
   */
  scrollViewHandler: ScrollViewHandler;
  /**
   * Whether the headers should be "sticky", meaning
   * they will stay at the top of the scrollview while the
   * section content is being displayed.
   *
   * If your stickyHeaders are janky, you can set callOnScrollOnMainThread=true
   * but it may lead to ANRs on Android.
   */
  stickyHeaders?: boolean;
  stickyHeadersBackgroundColor?: SemanticColor;
  /**
   * When headers are sticky, they sometimes need to render over some gutter on the top
   * Specify the extra gutter size to be covered by sticky headers here
   */
  stickyCover?: number; // Sticky header rendering overflowing vertically to cover content insets
  stickySides?: number; // Sticky header rendering overflowing horizontaly to cover content insets
  stickyFade?: number; // Sticky header fading distance
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
   * Whether scroll events should be called on the main thread. The default value is false.
   * For sticky headers and other ui updates that need such synchronization, set this to true.
   *
   * WARNING: Enabling this may lead to ANRs on Android.
   */
  callOnScrollOnMainThread?: boolean;

  /**
   * Spacing to apply between sections. If undefined, defaults to Spacing.MD.
   */
  spacing?: CSSValue;
}

// We use a separate component to represent a section so that we let
// the framework figure out when a section was added/removed
interface SectionListItemViewModel extends SectionModel {
  cover: number;
  sides: number;
  fade?: number;
  animated?: boolean;
  deferredRenderer?: DeferredItemsRenderer;
  stickyHeadersBackgroundColor?: SemanticColor;
  /**
   * Spacing to apply between sections. If undefined, defaults to Spacing.MD.
   */
  spacing?: CSSValue;
}

const enum SectionListItemVisibility {
  Collapsed,
  Expanding,
  Expanded,
}
interface SectionListItemState {
  visibility: SectionListItemVisibility;
}

export interface ISectionListItem {
  index: number;
  y: number;
  height: number;
}

class SectionListItem
  extends StatefulComponent<SectionListItemViewModel, SectionListItemState>
  implements SectionHandler
{
  state = {
    visibility: SectionListItemVisibility.Collapsed,
  };

  refs = {
    root: new ElementRef<View>(),
    header: new ElementRef<View>(),
    bar: new ElementRef<View>(),
  };

  getRootY(): number {
    return this.refs.root.single()?.frame.y ?? 0;
  }
  getRootHeight(): number {
    return this.refs.root.single()?.frame.height ?? 0;
  }
  getHeaderHeight(): number {
    return this.refs.header.single()?.frame.height ?? 0;
  }

  getRootBottom(): number {
    return this.getRootY() + this.getRootHeight();
  }

  onCreate(): void {
    if (!this.viewModel.animated) {
      this.setState({
        visibility: SectionListItemVisibility.Expanded,
      });
    }
    this.refs.bar.setAttribute('opacity', 0);
  }

  onRender(): void {
    const visibility = this.state.visibility;
    const isCollapsed = visibility === SectionListItemVisibility.Collapsed;
    const isExpanding = visibility === SectionListItemVisibility.Expanding;
    const opacity = isCollapsed ? 0 : 1;
    const height = isCollapsed ? 0 : undefined;
    const position = isCollapsed ? 'absolute' : 'relative';
    const cover = -this.viewModel.cover;
    const sides = -this.viewModel.sides;
    <view
      ref={this.refs.root}
      slowClipping={isCollapsed || isExpanding}
      opacity={opacity}
      height={height}
      onLayout={this.onRootLayout}
    >
      <layout flexDirection='column-reverse' position={position} width='100%'>
        <SectionSeparator spacing={this.viewModel.spacing} />
        {this.renderBody()}
        <view ref={this.refs.header} style={style.header}>
          <view
            ref={this.refs.bar}
            style={style.bar}
            backgroundColor={this.viewModel.stickyHeadersBackgroundColor}
            top={cover}
            left={sides}
            right={sides}
          >
            <view style={style.gradient} />
          </view>
          {this.renderHeader()}
        </view>
        {this.renderAnchor()}
      </layout>
    </view>;
  }

  renderItems<T>(items: T[], renderItem: (item: T, index: number, isFirst: boolean, isLast: boolean) => void): void {
    const deferredRenderer = this.viewModel.deferredRenderer;

    let index = 0;
    const last = items.length - 1;

    for (const item of items) {
      if (deferredRenderer && !deferredRenderer.shouldRenderNextItem()) {
        return;
      }

      renderItem(item, index, index === 0, index === last);
      index++;
    }
  }

  updateSection(index: number, previous: number, scroll: number): void {
    // Arbitrary animation value
    const fadeDistance = 150;
    // Useful values
    const coverHeight = this.viewModel.cover;
    const headerHeight = this.getHeaderHeight() + coverHeight;
    const contentHeight = this.getRootHeight() - headerHeight;
    // If we are pulling
    if (scroll < 0) {
      const pull = clamp(-scroll / fadeDistance, 0, 1);
      const relax = 1.5;
      const parallax = (pull * index * headerHeight) / relax;
      this.refs.root.setAttribute('translationY', -parallax);
      this.refs.header.setAttribute('translationY', 0);
      this.refs.header.setAttribute('opacity', 1 - clamp((pull * 2) / relax, 0, 1));
      this.refs.bar.setAttribute('opacity', 0);
    }
    // If we are pushing
    else {
      const distance = scroll - this.getRootY();
      const progress = distance + previous;
      const fade = this.viewModel.fade ?? headerHeight;
      const opacity = clamp(progress / fade, 0, 1);
      const displacement = clamp(distance, 0, contentHeight);
      this.refs.root.setAttribute('translationY', 0);
      this.refs.header.setAttribute('translationY', displacement);
      this.refs.header.setAttribute('opacity', 1);
      this.refs.bar.setAttribute('opacity', opacity);
    }
  }

  private onRootLayout = (): void => {
    if (this.state.visibility !== SectionListItemVisibility.Collapsed) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.setStateAnimatedPromise({ visibility: SectionListItemVisibility.Expanding }, { duration: 0.5 }).then(() => {
      this.setState({
        visibility: SectionListItemVisibility.Expanded,
      });
    });
  };

  private renderAnchor(): void {
    if (this.viewModel.onRenderAnchor) {
      this.viewModel.onRenderAnchor();
    }
  }

  private renderHeader(): void {
    if (this.viewModel.onRenderHeader) {
      this.viewModel.onRenderHeader();
    }
  }

  private renderBody(): void {
    this.viewModel.onRenderBody(this);
  }
}

/**
 * A Component which displays a list of sections.
 * It is meant to be used as a child of a scroll element.
 */
export class SectionList extends Component<SectionListViewModel> implements DeferredItemsRendererListener {
  private items = new ComponentRef<SectionListItem>();
  private deferredRenderer?: DeferredItemsRenderer;
  private sectionElements?: IRenderedElement<View>[];
  private scrollSubscription?: ScrollViewSubscription;

  private scrollViewListener: ScrollViewListener = {
    onLayout: (): void => {
      this.updateSections();
    },
    onScroll: (): void => {
      this.updateSections();
    },
  };

  onCreate(): void {
    this.scrollSubscription = this.viewModel.scrollViewHandler.subscribeListener(this.scrollViewListener, {
      // If callOnScrollOnMainThread is null, this will default to false.
      callOnScrollOnMainThread: this.viewModel.callOnScrollOnMainThread === true,
    });
  }

  onDestroy(): void {
    this.scrollSubscription?.unsubscribe();
    this.deferredRenderer = undefined;
  }

  onViewModelUpdate(): void {
    const viewModel = this.viewModel ?? {};

    const initialMaxItemsCount = viewModel.initialMaxItemsCount;
    if (initialMaxItemsCount === undefined) {
      this.deferredRenderer = undefined;
    } else {
      const maxItemsCountIncrement = viewModel.maxItemsCountIncrement ?? Number.MAX_SAFE_INTEGER;

      if (
        !this.deferredRenderer ||
        this.deferredRenderer.initialItemsCount !== initialMaxItemsCount ||
        this.deferredRenderer.itemsCountIncrement !== maxItemsCountIncrement
      ) {
        this.deferredRenderer = new DeferredItemsRenderer(initialMaxItemsCount, maxItemsCountIncrement, this);
      }
    }
  }

  onRender(): void {
    if (this.sectionElements) {
      this.sectionElements = undefined;
    }

    const deferredRenderer = this.deferredRenderer;
    if (deferredRenderer) {
      deferredRenderer.prepareForRender();
    }

    const viewModel = this.viewModel ?? {};
    <layout onLayout={this.onLayout}>
      {viewModel.sections.forEach((section: SectionModel) => {
        <SectionListItem
          animated={section.animated}
          ref={this.items}
          key={section.key}
          onRenderAnchor={section.onRenderAnchor}
          onRenderHeader={section.onRenderHeader}
          onRenderBody={section.onRenderBody}
          cover={viewModel.stickyCover ?? 0}
          sides={viewModel.stickySides ?? 0}
          fade={viewModel.stickyFade}
          deferredRenderer={deferredRenderer}
          stickyHeadersBackgroundColor={viewModel.stickyHeadersBackgroundColor}
          spacing={viewModel.spacing}
        />;
      })}
    </layout>;
  }

  onReadyToRenderNewItems(deferredItemsRenderer: DeferredItemsRenderer): void {
    if (this.deferredRenderer !== deferredItemsRenderer) {
      return;
    }

    // scheduleRender() used for batch deferred-item refresh; prefer viewModel-driven update when feasible (see AGENTS.md).
    this.renderer.batchUpdates(() => {
      for (const section of this.items.all()) {
        section.scheduleRender();
      }
    });
  }

  /**
   * Returns an array containing the elements for all the sections.
   */
  getSectionElements(): IRenderedElement<View>[] {
    let sectionElements = this.sectionElements;
    if (!sectionElements) {
      sectionElements = [];
      this.sectionElements = sectionElements;
      for (const item of this.items.all()) {
        for (const root of item.refs.root.all()) {
          sectionElements.push(root);
        }
      }
    }
    return sectionElements;
  }

  private onLayout = (): void => {
    this.updateSections();
  };

  private updateSections(): void {
    // List of rendered section items
    const items = this.items.all();
    if (items.length <= 0) {
      return;
    }
    // Useful values
    const scroll = this.viewModel.scrollViewHandler?.scrollY ?? 0;
    const height = this.viewModel.scrollViewHandler?.scrollViewFrame?.height ?? 0;
    const offset = this.viewModel.stickyHeaders ? scroll : 0;
    // Update only visible sections
    const startHeight = scroll;
    const endHeight = startHeight + height;
    const startIndex = this.findSectionIndexAt(items, startHeight) ?? 0;
    const endIndex = this.findSectionIndexAt(items, endHeight) ?? items.length - 1;
    // Update sections that needs updating
    this.renderer.batchUpdates(() => {
      const cover = this.viewModel?.stickyCover ?? 0;
      for (let i = startIndex; i <= endIndex; i++) {
        const item = items[i];
        if (i > 0) {
          const prev = items[i - 1];
          item.updateSection(i, prev.getHeaderHeight() + cover, offset);
        } else {
          item.updateSection(i, 0, offset);
        }
      }
    });
  }

  private findSectionIndexAt(items: SectionListItem[], height: number): number | undefined {
    const index = binarySearch(items, item => {
      if (height < item.getRootY()) {
        return 1;
      } else if (height > item.getRootY() + item.getRootHeight()) {
        return -1;
      } else {
        return 0;
      }
    });
    if (index < 0) {
      return undefined;
    }
    return index;
  }
}

const headerBottomShadowHeight = 9;
const style = {
  header: new Style<View>({
    minHeight: 1,
    accessibilityPriority: AccessibilityPriority.High,
  }),
  bar: new Style<View>({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: SemanticColor.Background.SUBSCREEN,
  }),
  gradient: new Style<View>({
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -headerBottomShadowHeight,
    height: headerBottomShadowHeight,
    background: linearGradient([
      [SemanticColor.Elevation.HEADER_SHADOW, 0],
      [SemanticColor.Flat.CLEAR, 1],
    ]),
    ignoreParentViewport: true, // TODO - maybe a slightly more efficient flag would be better?
  }),
};
