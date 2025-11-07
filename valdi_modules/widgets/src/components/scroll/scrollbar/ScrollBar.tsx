import { StatefulComponent } from 'valdi_core/src/Component';
import { ElementRef } from 'valdi_core/src/ElementRef';
import { setTimeoutInterruptible } from 'valdi_core/src/SetTimeout';
import { Style } from 'valdi_core/src/Style';
import {
  ScrollEvent,
  ScrollDragEndEvent,
  ScrollOffset,
  TouchEvent,
  TouchEventState,
} from 'valdi_tsx/src/GestureEvents';
import { View, Layout } from 'valdi_tsx/src/NativeTemplateElements';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { ScrollViewHandler } from '../ScrollViewHandler';
import { ScrollViewListener } from '../ScrollViewListener';
import { ScrollViewSubscription } from '../ScrollViewSubscription';
import { ScrollBarHandler } from './ScrollBarHandler';
import { systemFont } from 'valdi_core/src/SystemFont';

const FADE_ANIMATION_MS = 0.3;

const RESTING_TIMEOUT_MS = 1 * 1000;

const BAR_TRACK_WIDTH = 4;
const BAR_TOTAL_WIDTH = 6;
const BAR_TRACK_MARGIN = (BAR_TOTAL_WIDTH - BAR_TRACK_WIDTH) / 2;
const BAR_INDICATOR_HEIGHT = 40;

const CONTENT_ROOT_HEIGHT = 50;

const FLINGING_LABEL_HEIGHT = 30;
const FLINGING_DETECTION_VELOCITY = 1000;

const SCRUBBING_THUMB_HEIGHT = 40;

export interface ScrollBarViewModel {
  scrollViewHandler: ScrollViewHandler;
  scrollBarHandler?: ScrollBarHandler;
  scrollBarCenterOffset?: number;
}

const enum ScrollBarMode {
  Resting,
  Scrolling,
  Scrubbing,
  Flinging,
}

interface ScrollBarState {
  mode: ScrollBarMode;
  label?: string;
}

/**
 * A vertical scroll bar which interacts with a scroll view.
 */
export class ScrollBar extends StatefulComponent<ScrollBarViewModel, ScrollBarState> {
  state: ScrollBarState = {
    mode: ScrollBarMode.Resting,
  };

  private readonly barTrack = new ElementRef<View>();
  private readonly barIndicator = new ElementRef<View>();
  private readonly contentRoot = new ElementRef<View>();

  private scrollViewSubscription?: ScrollViewSubscription;
  private modeChangeTimeout?: number;

  private readonly scrollViewListener: ScrollViewListener = {
    onDragStart: (): void => {},
    onDragEnd: (event: ScrollDragEndEvent): ScrollOffset | undefined => {
      // Show the fling label when the fling reaches certain velocity.
      if (Math.abs(event.velocityY) > FLINGING_DETECTION_VELOCITY) {
        this.onChangeMode(ScrollBarMode.Flinging);
      }
      return undefined;
    },
    onScrollEnd: (): void => {
      // Hide the bar after a resting period
      if (this.state.mode !== ScrollBarMode.Scrubbing) {
        this.onChangeMode(ScrollBarMode.Resting, RESTING_TIMEOUT_MS);
      }
    },
    onScroll: (event: ScrollEvent): void => {
      // If we were previously resting, we may want to show the scroll
      if (this.state.mode === ScrollBarMode.Resting) {
        this.onChangeMode(ScrollBarMode.Scrolling);
      }
      // Update the scroll indicator and label
      this.renderer.batchUpdates(() => {
        this.onUpdateScrollPos(event.y);
        this.onUpdateScrollLabel(event.y);
      });
    },
  };

  onViewModelUpdate(): void {
    this.scrollViewSubscription?.unsubscribe();
    this.scrollViewSubscription = this.viewModel.scrollViewHandler.subscribeListener(this.scrollViewListener);
    this.setState({ mode: ScrollBarMode.Resting });
  }
  onDestroy(): void {
    this.scrollViewSubscription?.unsubscribe();
    clearInterval(this.modeChangeTimeout);
  }

  onRender(): void {
    const mode = this.state.mode;
    const label = this.state.label;

    const resting = mode === ScrollBarMode.Resting;
    const scrubbing = mode === ScrollBarMode.Scrubbing;
    const flinging = mode === ScrollBarMode.Flinging;

    const mostlyFadeOnRest = resting ? 0.01 : 1;
    const opaqueOnFlinging = flinging ? 1 : 0;
    const opaqueOnScrubbing = scrubbing ? 1 : 0;
    const opaqueOnLabel = label ? 1 : 0;

    <view ref={this.contentRoot} style={styles.contentRoot} touchEnabled={false} lazyLayout>
      <label style={styles.contentFlingingLabel} opacity={opaqueOnFlinging * opaqueOnLabel} value={label} />
      <label style={styles.contentScrubbingLabel} opacity={opaqueOnScrubbing * opaqueOnLabel} value={label} />
      <view style={styles.contentScrubbingThumb} opacity={opaqueOnScrubbing}>
        <view style={styles.contentScrubbingThumbBar} />
        <view style={styles.contentScrubbingThumbBar} />
      </view>
    </view>;
    <layout style={styles.barRoot} lazyLayout>
      <view opacity={mostlyFadeOnRest} ref={this.barTrack} style={styles.barTrack} onTouch={this.onTouchBarTrack} />
      <view opacity={mostlyFadeOnRest} ref={this.barIndicator} style={styles.barIndicator} />
    </layout>;
  }

  private readonly onTouchBarTrack = (event: TouchEvent): void => {
    switch (event.state) {
      case TouchEventState.Started:
        // Mark the current interaction as a scrub
        this.onChangeMode(ScrollBarMode.Scrubbing);
        break;
      case TouchEventState.Ended:
        // Hide the bar after a resting period
        this.onChangeMode(ScrollBarMode.Resting, RESTING_TIMEOUT_MS);
        return;
    }
    // Scroll to where we scrubbed
    this.onUpdateTouchPos(event.y);
  };

  private onUpdateTouchPos(trackBarOffsetY: number): void {
    const scrollViewHandler = this.viewModel.scrollViewHandler;
    if (!scrollViewHandler) {
      return;
    }
    const scrollViewHeight = scrollViewHandler.scrollViewFrame?.height;
    if (!scrollViewHeight) {
      return;
    }
    const barTrackHeight = this.barTrack.single()?.frame?.height;
    if (!barTrackHeight) {
      return;
    }
    const scrollViewScrollableHeight = scrollViewHandler.getContentHeight() - scrollViewHeight;
    const scrollViewOffsetY = (trackBarOffsetY / barTrackHeight) * scrollViewScrollableHeight;
    scrollViewHandler.scrollToClamped(0, scrollViewOffsetY, false);
  }

  private onUpdateScrollPos(scrollViewOffsetY: number): void {
    const scrollViewHandler = this.viewModel.scrollViewHandler;
    if (!scrollViewHandler) {
      return;
    }
    const scrollViewHeight = scrollViewHandler.scrollViewFrame?.height;
    if (!scrollViewHeight) {
      return;
    }
    const barTrackHeight = this.barTrack.single()?.frame?.height;
    if (!barTrackHeight) {
      return;
    }
    const scrollViewScrollableHeight = scrollViewHandler.getContentHeight() - scrollViewHeight;
    const scrollViewScrollRatioY = scrollViewOffsetY / scrollViewScrollableHeight;
    const barIndicatorTranslationY = scrollViewScrollRatioY * (barTrackHeight - BAR_INDICATOR_HEIGHT);
    const contentRootTranslationY = barIndicatorTranslationY + BAR_INDICATOR_HEIGHT / 2 - CONTENT_ROOT_HEIGHT / 2;
    this.barIndicator.setAttribute('translationY', barIndicatorTranslationY);
    this.contentRoot.setAttribute('translationY', contentRootTranslationY);
  }

  private onUpdateScrollLabel(scrollViewOffsetY: number): void {
    const scrollViewHandler = this.viewModel.scrollViewHandler;
    if (!scrollViewHandler) {
      return;
    }
    const scrollBarHandler = this.viewModel.scrollBarHandler;
    if (!scrollBarHandler) {
      return;
    }
    const scrollBarCenterOffset = this.viewModel.scrollBarCenterOffset ?? 0;
    const label = scrollBarHandler.getLabelAtPosition(scrollViewHandler, scrollViewOffsetY + scrollBarCenterOffset);
    this.setState({ label: label });
  }

  private onChangeMode(mode: ScrollBarMode, delay?: number): void {
    if (this.modeChangeTimeout) {
      clearTimeout(this.modeChangeTimeout);
      this.modeChangeTimeout = undefined;
    }
    if (mode !== this.state.mode) {
      if (delay === undefined) {
        this.setStateAnimated({ mode: mode }, { duration: FADE_ANIMATION_MS });
      } else {
        this.modeChangeTimeout = setTimeoutInterruptible(() => {
          this.setStateAnimated({ mode: mode }, { duration: FADE_ANIMATION_MS });
        }, delay);
      }
    }
  }
}

const floatingLayout = new Style<Layout>({
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
});

const floatingView = floatingLayout.extend({
  borderRadius: '50%',
  touchEnabled: false,
});

const regularView = new Style<View>({
  borderRadius: '50%',
  touchEnabled: false,
});

const styles = {
  barRoot: floatingLayout.extend({
    left: undefined,
    width: BAR_TOTAL_WIDTH,
  }),
  barTrack: floatingView.extend({
    backgroundColor: SemanticColor.Background.OBJECT,
    left: BAR_TRACK_MARGIN,
    right: BAR_TRACK_MARGIN,
    touchEnabled: true,
    touchAreaExtension: 20,
  }),
  barIndicator: floatingView.extend({
    backgroundColor: SemanticColor.Button.TERTIARY,
    height: BAR_INDICATOR_HEIGHT,
    bottom: undefined,
  }),
  contentRoot: floatingView.extend({
    position: 'absolute',
    height: CONTENT_ROOT_HEIGHT,
    bottom: undefined,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  contentFlingingLabel: floatingView.extend({
    backgroundColor: SemanticColor.Background.MAIN,
    boxShadow: '0 1 10 rgba(0, 0, 0, 0.1)',
    height: FLINGING_LABEL_HEIGHT,
    top: (CONTENT_ROOT_HEIGHT - FLINGING_LABEL_HEIGHT) / 2,
    right: 12,
    padding: '0 12',
    textAlign: 'center',
    left: undefined,
    font: systemFont(24),
    color: SemanticColor.Text.PRIMARY,
  }),
  contentScrubbingLabel: regularView.extend({
    boxShadow: '0 1 10 rgba(0, 0, 0, 0.1)',
    backgroundColor: SemanticColor.Button.TERTIARY,
    padding: '0 16',
    textAlign: 'center',
    height: 36,
    font: systemFont(20),
    color: SemanticColor.Text.ON_TERTIARY_BUTTON,
  }),
  contentScrubbingThumb: floatingView.extend({
    backgroundColor: SemanticColor.Button.TERTIARY,
    borderRadius: `${SCRUBBING_THUMB_HEIGHT / 2} 4 4 ${SCRUBBING_THUMB_HEIGHT / 2}`,
    top: (CONTENT_ROOT_HEIGHT - SCRUBBING_THUMB_HEIGHT) / 2,
    height: SCRUBBING_THUMB_HEIGHT,
    width: 72,
    padding: 10,
    justifyContent: 'space-around',
    left: undefined,
  }),
  contentScrubbingThumbBar: regularView.extend({
    backgroundColor: SemanticColor.Text.PLAYER,
    height: 2,
    width: 18,
    marginLeft: 5,
  }),
};
