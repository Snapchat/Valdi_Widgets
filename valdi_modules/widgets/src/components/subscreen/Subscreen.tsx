import { StatefulComponent } from 'valdi_core/src/Component';
import { ElementRef } from 'valdi_core/src/ElementRef';
import { jsx } from 'valdi_core/src/JSXBootstrap';
import { NodePrototype } from 'valdi_core/src/NodePrototype';
import { Style } from 'valdi_core/src/Style';
import { when } from 'valdi_core/src/utils/When';
import { AccessibilityPriority } from 'valdi_tsx/src/Accessibility';
import { ScrollEvent } from 'valdi_tsx/src/GestureEvents';
import { Layout } from 'valdi_tsx/src/NativeTemplateElements';
import { colorWithThemedOverride, isCustomTheme, themeBackgroundImage } from 'widgets/src/InitSemanticColors';
import { Theme } from 'widgets/src/Theme';
import { ScrollViewHandler } from 'widgets/src/components/scroll/ScrollViewHandler';
import { ScrollViewListener, ScrollViewRegionEvent } from 'widgets/src/components/scroll/ScrollViewListener';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { clamp } from 'foundation/src/number';
import { FadeImage } from '../image/FadeImage';
import { ScrollViewSubscription } from '../scroll/ScrollViewSubscription';
import { ScrollBar } from '../scroll/scrollbar/ScrollBar';
import { ScrollBarHandler } from '../scroll/scrollbar/ScrollBarHandler';

const SCROLLBAR_SIDE_OFFSET = 9;

export interface SubscreenContext {
  themeType?: Theme.Type;
}

export interface SubscreenViewModel {
  /**
   * The header styling controls the general styling of the top header:
   * - 'hovering' has white background and appears to 'hover' over the scrollview content when scrolling
   * - 'sticky' is designed to be used in conjonction with a <SectionList> with sticky header's
   * - 'alwaysHovering' has a white background and always appear elevated compared to the content
   */
  headerStyling?: 'hovering' | 'sticky' | 'alwaysHovering';
  headerBackgroundColor?: SemanticColor;
  /**
   * Control overall background (color/opacity may be animated separately)
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
  /** Default: true */
  scrollViewBouncesVerticalWithSmallContent?: boolean;
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
   * The ScrollViewHandler which will receive the scroll view
   * ref.
   */
  scrollViewHandler?: ScrollViewHandler;
  /**
   * Allows the page to drop anchors to interact with the scroll bar
   */
  scrollBarHandler?: ScrollBarHandler;
  /**
   * Set the scrollbar label's content focus center position
   * This helps to show the label of anchors that are in the center of the screen
   * rather than the top of the scrollview
   */
  scrollBarCenterOffset?: number;
  /**
   * Allows user to pass in a custom scroll object from the native code.
   * If this is not used, then the built-in scroll will be used
   */
  customScrollConfig?: CustomScrollConfig;
  /**
   * Allows user to change the border radius of the subscreen background
   */
  backgroundBorderRadius?: string | number;
  /**
   * Allows user to change the border radius of the header background
   */
  headerBackgroundBorderRadius?: string | number;
  /**
   * Allows user to scoll the ScrollView under the hood
   */
  scrollEnabled?: boolean;

  /**
   * [iOS-Only]
   * Defines the rate at which the scroll view decelerates after
   * a fling gesture.
   * @default: 'normal'
   */
  decelerationRate?: 'normal' | 'fast';

  /**
   * Whether to enable support for theming.
   */
  themingEnabled?: boolean;
}

export interface CustomScrollConfig {
  iosClass: string;
  androidClass: string;
}

interface SubscreenState {
  fading: number;
}

/**
 * Represents a screen with a header and scrollable content area.
 */
export class Subscreen extends StatefulComponent<SubscreenViewModel, SubscreenState, SubscreenContext> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  public static readonly GUTTER_SIZE = 14;

  public static readonly fadeDistance = 20;
  public static readonly floatingGutter = 55;

  scrollTopElement = new ElementRef();
  scrollBottomElement = new ElementRef();

  state = {
    fading: 0,
  };

  private readonly theme = Theme.from(this.context.themeType);
  private scrollViewHandler?: ScrollViewHandler;
  private scrollSubscription?: ScrollViewSubscription;
  private customViewPrototype?: NodePrototype;
  private scrollViewListener: ScrollViewListener = {
    onScroll: (evt: ScrollEvent) => {
      this.setState({
        fading: clamp(evt.y / Subscreen.fadeDistance, 0, 1),
      });
    },
    onScrollRegionWillChange: (event: ScrollViewRegionEvent) => {
      this.scrollRegionWillChange(event.regionY, event.regionHeight, event.newRegionHeight);
    },
    onScrollRegionDidChange: () => {
      this.scrollRegionDidChange();
    },
  };

  onCreate(): void {
    this.scrollViewHandler = this.viewModel?.scrollViewHandler;
    if (this.scrollViewHandler) {
      this.scrollSubscription = this.scrollViewHandler.subscribeListener(this.scrollViewListener);
      this.scrollViewHandler.setAttribute('id', 'scrollView');
    }
  }
  onDestroy(): void {
    this.scrollSubscription?.unsubscribe();
  }

  onRender(): void {
    const viewModel = this.viewModel ?? {};
    const backgroundColor = this.theme.applyTo(viewModel.backgroundColor ?? SemanticColor.Background.SUBSCREEN);
    const backgroundOpacity = viewModel.backgroundOpacity;
    const headerOpacity = this.headerOpacity();
    const headerBoxShadow = this.headerBoxShadow();
    const headerBackgroundColor = this.headerBackgroundColor();
    const backgroundBorderRadius = viewModel.backgroundBorderRadius;
    const headerBackgroundBorderRadius = viewModel.headerBackgroundBorderRadius;
    {
      /* Root */
    }
    <layout id='subscreen' style={style.root}>
      {/* Background */}
      <view
        id='background'
        style={floatingStyle}
        opacity={backgroundOpacity}
        backgroundColor={backgroundColor}
        borderRadius={backgroundBorderRadius}
      />
      {when(this.viewModel.themingEnabled && isCustomTheme(), () => {
        <layout style={floatingStyle}>
          <FadeImage src={themeBackgroundImage()} height={'100%'} width={'100%'} />
        </layout>;
      })}
      {/* Footer */}
      <layout style={style.header}>
        {/* Footer background */}
        <view
          id='footerBackground'
          style={floatingStyle}
          opacity={headerOpacity}
          boxShadow={headerBoxShadow}
          backgroundColor={headerBackgroundColor}
          borderRadius={headerBackgroundBorderRadius}
        />
        {/* Footer contents */}
        <slot name='footer' />
      </layout>
      {/* Body */}
      <view style={style.body}>
        {/* Scroll View */}
        {this.renderScrollView()}
        {/* Floating */}
        <layout style={floatingStyle} lazyLayout>
          {this.renderScrollBar()}
          <slot name='floating' />
        </layout>
      </view>
      {/* Header */}
      <layout style={style.header}>
        {/* Header background */}
        <view
          id='headerBackground'
          style={floatingStyle}
          opacity={headerOpacity}
          boxShadow={headerBoxShadow}
          backgroundColor={headerBackgroundColor}
          borderRadius={headerBackgroundBorderRadius}
        />
        {/* Header contents */}
        <slot name='header' />
      </layout>
    </layout>;
  }

  private renderScrollView(): void {
    const viewModel = this.viewModel ?? {};
    const scrollViewDismissKeyboardOnDrag = viewModel.scrollViewDismissKeyboardOnDrag;
    const scrollViewShowsScrollIndicator = viewModel.scrollViewShowsScrollIndicator;
    const scrollViewBouncesFromDragAtStart = viewModel.scrollViewBouncesFromDragAtStart;
    const scrollViewBouncesFromDragAtEnd = viewModel.scrollViewBouncesFromDragAtEnd;
    const scrollViewBouncesVerticalWithSmallContent = viewModel.scrollViewBouncesVerticalWithSmallContent ?? true;
    const scrollViewAccessibilityId = viewModel.scrollViewAccessibilityId ?? 'scroll-view';
    const scrollViewViewportExtension = viewModel.scrollViewViewportExtension;
    const scrollEnabled = viewModel.scrollEnabled ?? true;
    const scrollViewDecelerationRate = viewModel.decelerationRate;
    if (viewModel.customScrollConfig !== undefined) {
      /* Work around to use <custom-view> with dynamic androidClass and iosClass variable */
      this.customViewPrototype = jsx.beginRenderCustomView(
        this.customViewPrototype,
        viewModel.customScrollConfig.iosClass,
        viewModel.customScrollConfig.androidClass,
      );
      jsx.setAttributeBool('bouncesVerticalWithSmallContent', scrollViewBouncesVerticalWithSmallContent);
      jsx.setAttributeBool('dismissKeyboardOnDrag', scrollViewDismissKeyboardOnDrag);
      jsx.setAttributeBool('showsVerticalScrollIndicator', scrollViewShowsScrollIndicator);
      jsx.setAttributeBool('bouncesFromDragAtStart', scrollViewBouncesFromDragAtStart);
      jsx.setAttributeBool('bouncesFromDragAtEnd', scrollViewBouncesFromDragAtEnd);
      jsx.setAttributeNumber('viewportExtensionTop', scrollViewViewportExtension);
      jsx.setAttributeNumber('viewportExtensionBottom', scrollViewViewportExtension);
      jsx.setAttributeBool('scrollEnabled', scrollEnabled);
      jsx.setAttributeRef(viewModel.scrollViewHandler);
      jsx.setAttributeString('decelerationRate', scrollViewDecelerationRate);
      {
        /* Main content */
      }
      <slot />;

      jsx.endRender();
    } else {
      <scroll
        accessibilityId={scrollViewAccessibilityId}
        height='100%'
        width='100%'
        bouncesVerticalWithSmallContent={scrollViewBouncesVerticalWithSmallContent}
        dismissKeyboardOnDrag={scrollViewDismissKeyboardOnDrag}
        showsVerticalScrollIndicator={scrollViewShowsScrollIndicator}
        bouncesFromDragAtStart={scrollViewBouncesFromDragAtStart}
        bouncesFromDragAtEnd={scrollViewBouncesFromDragAtEnd}
        viewportExtensionTop={scrollViewViewportExtension}
        viewportExtensionBottom={scrollViewViewportExtension}
        ref={viewModel.scrollViewHandler}
        scrollEnabled={scrollEnabled}
        decelerationRate={scrollViewDecelerationRate}
      >
        {/* Top content */}
        <layout ref={this.scrollTopElement} />
        {/* Main content */}
        <slot />
        {/* Bottom content */}
        <layout ref={this.scrollBottomElement} />
      </scroll>;
    }
  }

  private renderScrollBar(): void {
    const scrollViewHandler = this.scrollViewHandler;
    const scrollBarHandler = this.viewModel.scrollBarHandler;
    if (scrollViewHandler && scrollBarHandler) {
      <layout
        position='absolute'
        top={Subscreen.floatingGutter}
        bottom={Subscreen.floatingGutter}
        left={SCROLLBAR_SIDE_OFFSET}
        right={SCROLLBAR_SIDE_OFFSET}
      >
        <ScrollBar
          scrollViewHandler={scrollViewHandler}
          scrollBarHandler={scrollBarHandler}
          scrollBarCenterOffset={this.viewModel.scrollBarCenterOffset}
        />
      </layout>;
    }
  }

  private scrollRegionDidChange(): void {
    this.renderer.batchUpdates(() => {
      const oldHeight = this.scrollTopElement.getAppliedAttribute('height') as number | undefined;
      if (!oldHeight || oldHeight === 0) {
        return;
      }

      const scrollTop = this.scrollViewHandler?.scrollY || 0;

      this.scrollTopElement.setAttribute('height', 0);
      this.scrollBottomElement.setAttribute('height', 0);
      if (this.scrollViewHandler) {
        this.scrollViewHandler.scrollTo(0, Math.max(scrollTop - oldHeight, 0), false);
      }
    });
  }

  private scrollRegionWillChange(regionY: number, regionHeight: number, newRegionHeight: number): void {
    if (newRegionHeight > regionHeight) {
      // Nothing to do, it will just expand from the bottom
      return;
    }

    const scrollTop = this.scrollViewHandler?.scrollY || 0;

    if (regionY > scrollTop) {
      // Region is above the scroll view top, we can expand from the bottom
      return;
    }

    if (regionY + newRegionHeight > scrollTop) {
      // New region bottom is after the scroll view top, we can also expand from the bottom
      return;
    }

    let scrollOffset = regionHeight - newRegionHeight;
    const newScrollY = scrollTop - scrollOffset;
    if (newScrollY < 0) {
      scrollOffset += newScrollY;
      this.scrollBottomElement.setAttribute('height', -newScrollY);
    }

    this.scrollTopElement.setAttribute('height', scrollOffset);
  }

  private headerStyling(): string {
    return this.viewModel?.headerStyling ?? 'hovering';
  }
  private headerOpacity(): number {
    return this.headerStyling() === 'alwaysHovering' ? 1 : this.state.fading;
  }
  private headerBoxShadow(): string | undefined {
    const headerStyling = this.headerStyling();
    if (headerStyling === 'sticky') {
      return undefined;
    }
    const shadowOpacity = this.headerOpacity() / 10;
    if (shadowOpacity) {
      return `0px 2px 11px rgba(0, 0, 0, ${shadowOpacity})`;
    } else {
      return undefined;
    }
  }

  private headerBackgroundColor(): SemanticColor | undefined {
    if (this.viewModel.headerBackgroundColor) {
      return colorWithThemedOverride(
        this.theme.applyTo(this.viewModel.headerBackgroundColor),
        SemanticColor.Flat.CLEAR,
      );
    }

    if (this.headerStyling() === 'sticky') {
      return colorWithThemedOverride(this.theme.applyTo(SemanticColor.Background.SUBSCREEN), SemanticColor.Flat.CLEAR);
    } else {
      return colorWithThemedOverride(this.theme.applyTo(SemanticColor.Background.MAIN), SemanticColor.Flat.CLEAR);
    }
  }
}

const floatingStyle = new Style<Layout>({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  top: 0,
});
const style = {
  root: floatingStyle.extend({
    flexDirection: 'column-reverse',
  }),
  body: new Style<Layout>({
    flexGrow: 1,
    flexShrink: 1,
    accessibilityPriority: AccessibilityPriority.High,
  }),
  header: new Style<Layout>({
    accessibilityPriority: AccessibilityPriority.Highest,
  }),
};
