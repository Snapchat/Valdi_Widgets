import { StatefulComponent } from 'valdi_core/src/Component';
import { Device } from 'valdi_core/src/Device';
import { DeviceHapticFeedbackType } from 'valdi_core/src/DeviceBridge';
import { ElementRef } from 'valdi_core/src/ElementRef';
import { Style } from 'valdi_core/src/Style';
import { ScrollEvent, ScrollDragEndEvent } from 'valdi_tsx/src/GestureEvents';
import { View } from 'valdi_tsx/src/NativeTemplateElements';
import { ScrollViewHandler } from 'widgets/src/components/scroll/ScrollViewHandler';
import { ScrollViewSubscription } from 'widgets/src/components/scroll/ScrollViewSubscription';
import { linearGradient } from 'widgets/src/styles/gradients';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { clamp } from 'foundation/src/number';
import { Ids } from '../../../ids';
import { EasingFunctions } from '../animation/EasingFunctions';
import { ScrollViewListener } from '../scroll/ScrollViewListener';
import { DataSyncingBar } from './DataSyncingBar';

/**
 * Best effort computations for all platforms to look the same, the thresholds are based on ratio of display height
 * This is because the "strength of the pull" can be construed to be:
 * The distance pulled, relative to the screen height.
 * This is also true for the strength of the bounce on iOS/skia.
 */

const PULL_MAXIMUM = Device.getDisplayHeight();
const PULL_MINIMUM = 10; // Leave some inert space on the top for tiny pulls
const DATA_SYNCING_BAR_HEIGHT = 2; // The height of the bar showing that data syncing is still in progress

const PULL_READY = PULL_MAXIMUM * 0.125; // Threshold for the ghost to appear "ready" (will trigger launch)
const PULL_CONVERGE = PULL_MAXIMUM * 0.25; // Maximum overscroll pulling distance, overscroll strength converge to this

export interface PullToRefreshViewModel {
  /**
   * ScrollViewHandler for the vertical scroll view in which the PullToRefresh should live
   */
  scrollViewHandler: ScrollViewHandler;
  /**
   * This callback will be triggered when the user successfully perform a pull-to-refresh gesture
   * NOTE: IF NOT SET, the component will be a NO-OP nothing will happen, as if this component did not exist
   */
  onPullToRefresh?: (event: PullToRefreshEvent) => void;

  /**
   * Whether scroll events should be called on the main thread. The default value is false,
   * and so the scrolling callback is called without synchronization with the main thread.
   *
   * WARNING: Enabling this can lead to ANRs on Android.
   */
  callOnScrollOnMainThread?: boolean;

  /**
   * Enables and controls the display of a loading indicator
   */
  isLoading?: boolean;

  /**
   * Disables the haptic feedback on state transition
   */
  disableHapticFeedback?: boolean;
}

export enum PullToRefreshEvent {
  Triggered = 'triggered', // This event typically starts any network/data requests
  Completed = 'completed', // This event typically starts updating the UI's state
}

enum PullToRefreshStage {
    Idle = 'idle',
    Ready = 'ready',
    Loading = 'loading', // data refresh is in progress
}

interface PullToRefreshState {
  stage: PullToRefreshStage;
}

/**
 * This component is a standard implementation for the PullToRefresh gesture effect.
 *
 * NOTE: For convenience: The component becomes a NO-OP component if the onPullToRefresh callback is undefined!
 *
 * This component can be placed as the root component inside of a vertical scroll view such as:
 *
 * <scroll ref={this.scrollViewHandler}>
 *   <PullToRefresh scrollViewHandler={this.scrollViewHandler} onPullToRefresh={this.onPullToRefresh}>
 *      {this.myScrollableContent()}
 *   </PullToRefresh>
 * </scroll>
 */
export class PullToRefresh extends StatefulComponent<PullToRefreshViewModel, PullToRefreshState> {
  state: PullToRefreshState = {
    stage: PullToRefreshStage.Idle,
  };

  private readonly refContainer = new ElementRef<View>();
  private readonly refFadeTop = new ElementRef<View>();

  private scrollViewSubscription?: ScrollViewSubscription;

  private accessibilityID?: string;

  private scrollViewListener: ScrollViewListener = {
    onDragStart: (): void => {
      this.setState({ stage: PullToRefreshStage.Idle });
    },
    onScroll: (event: ScrollEvent): void => {
      // Compute displacement amount (based on overscroll and bounce)
      const displacementOverscrollTension = this.computeDisplacementOverscrollTension(event.overscrollTensionY);
      const displacementBounce = this.computeDisplacementBounce(event.y);
      const displacementPull = this.computeDisplacementPull(displacementOverscrollTension, displacementBounce);

      // Compute the displacement translation for the container and fade effect
      const displacementContainer = displacementOverscrollTension - PULL_MAXIMUM;
      const displacementFadeGradient = -displacementPull;

      // Batch changes to the translations
      this.renderer.batchUpdates(() => {
        // Apply all changes at once
        this.refContainer.setAttribute('translationY', displacementContainer);
        this.refFadeTop.setAttribute('translationY', displacementFadeGradient);
        // Select the stage when displacement is big enough for each category
      });
    },
    onDragEnd: (event: ScrollDragEndEvent) => {
      // When user release finger, start the launch animation if we're far enough
      const stage = this.state.stage;
      if (stage === PullToRefreshStage.Ready) {
        this.changeStageTo(PullToRefreshStage.Loading);
        this.viewModel.onPullToRefresh?.(PullToRefreshEvent.Triggered);
      }
      return undefined;
    },
    onScrollEnd: (): void => {
      const stage = this.state.stage;
      if (stage === PullToRefreshStage.Ready) {
        // if loading state is controlled by ViewModel.isLoading, we reflect the changes in PullToRefreshStage as well
        if (this.viewModel.isLoading !== undefined) {
          this.changeStageTo(PullToRefreshStage.Loading);
        } else {
          this.changeStageTo(PullToRefreshStage.Idle);
          this.viewModel.onPullToRefresh?.(PullToRefreshEvent.Completed);
        }
      } else {
        this.setState({ stage: PullToRefreshStage.Idle });
      }
    },
  };

  onCreate(): void {
    // Until any onScroll event is applied, we hide the visual pull effect
    this.refContainer.setAttribute('translationY', -PULL_MAXIMUM);

    //Workaround for cross platform automation tests having 2 different IDs.
    //In iOS, the pull to refresh container id is hard-coded in several places.
    if (Device.isIOS()) {
      this.accessibilityID = 'stories_content_collection_view';
    } else {
      this.accessibilityID = Ids.ptrContainer();
    }
  }

  onViewModelUpdate(previousViewModel: PullToRefreshViewModel): void {
    this.unsubscribe();
    this.subscribe();

    if (previousViewModel?.isLoading !== this.viewModel.isLoading) {
      if (!this.viewModel.isLoading && this.state.stage === PullToRefreshStage.Loading) {
        this.changeStageTo(PullToRefreshStage.Idle);
        this.viewModel.onPullToRefresh?.(PullToRefreshEvent.Completed);
      }
    }
  }

  onRender(): void {
    if (this.viewModel.onPullToRefresh) {
      <view accessibilityId={this.accessibilityID} ref={this.refContainer} marginBottom={-PULL_MAXIMUM}>
        {this.onRenderPullZone()}
        <slot />
        {this.onMaybeRenderDataSyncer()}
      </view>;
    } else {
      <slot />;
    }
  }

  onRenderPullZone(): void {
    const stage = this.state.stage;
    <view style={styles.pullZone}>
      <view style={styles.fadeTop} ref={this.refFadeTop} />
      <view style={styles.fadeBottom} />
    </view>;
  }

  onMaybeRenderDataSyncer(): void {
    if (this.state.stage !== PullToRefreshStage.Loading) {
      return;
    }

    <view style={styles.dataSyncingBar}>
      <DataSyncingBar />
    </view>;
  }

  onDestroy(): void {
    this.unsubscribe();
  }

  private subscribe(): void {
    if (this.viewModel.onPullToRefresh) {
      const callOnScrollOnMainThread = this.viewModel.callOnScrollOnMainThread === true;
      this.scrollViewSubscription = this.viewModel.scrollViewHandler.subscribeListener(this.scrollViewListener, {
        callOnScrollOnMainThread: callOnScrollOnMainThread,
        callOnDragEndOnMainThread: callOnScrollOnMainThread,
      });
    }
  }
  private unsubscribe(): void {
    this.scrollViewSubscription?.unsubscribe();
    this.scrollViewSubscription = undefined;
  }

  private computeDisplacementOverscrollTension(overscrollTension?: number): number {
    const overscrollTensionRatio = -(overscrollTension ?? 0) / PULL_MAXIMUM;
    return EasingFunctions.easeOutQuad(overscrollTensionRatio) * PULL_CONVERGE;
  }

  private computeDisplacementBounce(y: number): number {
    return Math.max(0, -y);
  }

  private computeDisplacementPull(displacementOverscrollTension: number, displacementBounce: number): number {
    return clamp(displacementOverscrollTension + displacementBounce, 0, PULL_MAXIMUM) - PULL_MINIMUM;
  }

  private changeStageTo(newStage: PullToRefreshStage): void {
    const oldStage = this.state.stage;
    if (oldStage !== newStage) {
      if (!this.viewModel.disableHapticFeedback) {
        Device.performHapticFeedback(DeviceHapticFeedbackType.SELECTION);
      }
      this.setState({ stage: newStage });
    }
  }
}

const fadeBase = new Style<View>({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 11,
});

const styles = {
  pullZone: new Style<View>({
    height: PULL_MAXIMUM,
    flexDirection: 'row',
    slowClipping: true,
    background: linearGradient([
      [SemanticColor.Base.APP_YELLOW, 0],
      [SemanticColor.Brand.PRIMARY, 0.1],
      [SemanticColor.Brand.PRIMARY, 0.9],
      [SemanticColor.Base.APP_YELLOW, 1],
    ]),
  }),
  fadeTop: fadeBase.extend({
    background: linearGradient([
      [SemanticColor.Elevation.HEADER_SHADOW, 0],
      [SemanticColor.Flat.CLEAR, 1],
    ]),
  }),
  fadeBottom: fadeBase.extend({
    background: linearGradient([
      [SemanticColor.Flat.CLEAR, 0],
      [SemanticColor.Elevation.HEADER_SHADOW, 1],
    ]),
  }),
  dataSyncingBar: new Style<View>({
    height: DATA_SYNCING_BAR_HEIGHT,
    position: 'absolute',
    top: PULL_MAXIMUM,
    left: 0,
    right: 0,
  }),
};