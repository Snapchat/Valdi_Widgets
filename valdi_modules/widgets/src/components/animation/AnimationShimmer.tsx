import { AnimationCurve } from 'valdi_core/src/AnimationOptions';
import { Component } from 'valdi_core/src/Component';
import { Device } from 'valdi_core/src/Device';
import { ElementRef } from 'valdi_core/src/ElementRef';
import { Style } from 'valdi_core/src/Style';
import { View } from 'valdi_tsx/src/NativeTemplateElements';
import { GradientDirection, linearGradient } from 'widgets/src/styles/gradients';
import { SemanticColor } from 'widgets/src/styles/semanticColors';

export interface AnimationShimmerViewModel {
  margin?: number;
  width: number;
  height: number;
  borderRadius?: number | string;
  backgroundColor?: SemanticColor;
  shimmerOpacity?: number;
}

enum AnimationShimmerStage {
  RightBefore,
  FadeIn,
  FadeOut,
  TakeBreak,
}

/**
 * Re-useable component to display a shimmering simple square view, used in loading states
 * This component will behave like a regular view
 * that can have a hardcoded size, rounded corner and background color
 */
export class AnimationShimmer extends Component<AnimationShimmerViewModel> {
  private static stageDurationMs = 600;
  private static stageDurationSec = AnimationShimmer.stageDurationMs / 1000;

  private containerRef = new ElementRef<View>();
  private gradientRef = new ElementRef<View>();

  private animationTimeout?: number;
  private animationDestroyed?: boolean;
  private animationStarted?: boolean;

  onCreate(): void {
    void this.runAnimationStage(AnimationShimmerStage.RightBefore);
  }
  onDestroy(): void {
    clearTimeout(this.animationTimeout);
    this.animationDestroyed = true;
  }

  onRender(): void {
    const viewModel = this.viewModel;
    const size = Math.max(viewModel.width, viewModel.height);
    <view
      ref={this.containerRef}
      margin={viewModel.margin}
      width={viewModel.width}
      height={viewModel.height}
      borderRadius={viewModel.borderRadius}
      backgroundColor={viewModel.backgroundColor ?? SemanticColor.Background.DISABLED}
      style={styles.container}
      onLayoutComplete={this.onLayoutComplete}
    >
      <view
        ref={this.gradientRef}
        style={Device.isDarkMode() ? styles.gradientDark : styles.gradientLight}
        height={size * 2}
        width={size * 2}
      />
    </view>;
  }

  private onLayoutComplete = (): void => {
    if (this.animationStarted) {
      return;
    }
    this.scheduleAnimationStage(AnimationShimmerStage.RightBefore);
    this.animationStarted = true;
  };

  private scheduleAnimationStage(stage: AnimationShimmerStage): void {
    // Run the animation block
    void this.runAnimationStage(stage).then(() => {
      // After the animatin is finished, check if we are done
      if (this.animationDestroyed) {
        return;
      }
      // If we want to continue, just schedule the next stage again and loop
      switch (stage) {
        case AnimationShimmerStage.RightBefore:
          return this.scheduleAnimationStage(AnimationShimmerStage.FadeIn);
        case AnimationShimmerStage.FadeIn:
          return this.scheduleAnimationStage(AnimationShimmerStage.FadeOut);
        case AnimationShimmerStage.FadeOut:
          return this.scheduleAnimationStage(AnimationShimmerStage.TakeBreak);
        case AnimationShimmerStage.TakeBreak:
          return this.scheduleAnimationStage(AnimationShimmerStage.RightBefore);
      }
    });
  }

  private runAnimationStage(stage: AnimationShimmerStage): Promise<void> {
    // Check if all the frame information is available
    const elementContainer = this.containerRef.single();
    const elementGradient = this.gradientRef.single();
    const frameContainer = elementContainer?.frame;
    const frameGradient = elementGradient?.frame;
    if (!elementContainer || !elementGradient || !frameContainer || !frameGradient) {
      this.gradientRef.setAttribute('opacity', 0);
      return this.stageTimeout();
    }
    // Compute the ideal translations to achieve the visual effect
    const translationX = (frameContainer.width - frameGradient.width) / 2;
    const translationYStart = -frameGradient.height;
    const translationYEnd = +frameContainer.height;
    // For each stage, we want a different set of visuals
    switch (stage) {
      // Before the animation, immediately set the gradient to the above the container
      case AnimationShimmerStage.RightBefore: {
        this.renderer.batchUpdates(() => {
          this.gradientRef.setAttribute('opacity', 0);
          this.gradientRef.setAttribute('translationX', translationX);
          this.gradientRef.setAttribute('translationY', translationYStart);
        });
        return this.stageTimeout();
      }
      // First stage of the animation, animate to the middle
      case AnimationShimmerStage.FadeIn: {
        return this.stageAnimated(() => {
          this.gradientRef.setAttribute('opacity', this.viewModel.shimmerOpacity ?? 1);
          this.gradientRef.setAttribute('translationX', translationX);
          this.gradientRef.setAttribute('translationY', (translationYStart + translationYEnd) / 2);
        });
      }
      // End stage of the animation, animate to under the container
      case AnimationShimmerStage.FadeOut: {
        return this.stageAnimated(() => {
          this.gradientRef.setAttribute('opacity', 0);
          this.gradientRef.setAttribute('translationX', translationX);
          this.gradientRef.setAttribute('translationY', translationYEnd);
        });
      }
      // After the animation, we take a small break
      case AnimationShimmerStage.TakeBreak: {
        return this.stageTimeout();
      }
    }
  }

  private stageAnimated(block: () => void): Promise<void> {
    return this.animatePromise(
      {
        duration: AnimationShimmer.stageDurationSec,
        curve: AnimationCurve.Linear,
      },
      block,
    );
  }

  private stageTimeout(): Promise<void> {
    return new Promise(resolve => {
      clearTimeout(this.animationTimeout);
      this.animationTimeout = setTimeout(() => {
        resolve();
      }, AnimationShimmer.stageDurationMs);
    });
  }
}

const gradientLightTransparent = 'rgba(255, 255, 255, 0.0)';
const gradientLightOpaque = 'rgba(255, 255, 255, 1)';

const gradientDarkTransparent = 'rgba(0, 0, 0, 0.0)';
const gradientDarkOpaque = SemanticColor.Flat.PURE_BLACK;

const styles = {
  container: new Style<View>({
    slowClipping: true,
    backgroundColor: SemanticColor.Background.DISABLED,
  }),
  gradientLight: new Style<View>({
    background: linearGradient(
      [
        [gradientLightTransparent, 0.0], // the stop values are ignored on android
        [gradientLightTransparent, 0.1], // so we create evenly spaced transparent stops
        [gradientLightTransparent, 0.2], // so that the gradient is properly sized
        [gradientLightTransparent, 0.3],
        [gradientLightTransparent, 0.4],
        [gradientLightOpaque, 0.5],
        [gradientLightTransparent, 0.6],
        [gradientLightTransparent, 0.7],
        [gradientLightTransparent, 0.8],
        [gradientLightTransparent, 0.9],
        [gradientLightTransparent, 1.0],
      ],
      GradientDirection.TopLeftToBottomRight,
    ),
  }),
  gradientDark: new Style<View>({
    background: linearGradient(
      [
        [gradientDarkTransparent, 0.0], // the stop values are ignored on android
        [gradientDarkTransparent, 0.1], // so we create evenly spaced transparent stops
        [gradientDarkTransparent, 0.2], // so that the gradient is properly sized
        [gradientDarkTransparent, 0.3],
        [gradientDarkTransparent, 0.4],
        [gradientDarkOpaque, 0.5],
        [gradientDarkTransparent, 0.6],
        [gradientDarkTransparent, 0.7],
        [gradientDarkTransparent, 0.8],
        [gradientDarkTransparent, 0.9],
        [gradientDarkTransparent, 1.0],
      ],
      GradientDirection.TopLeftToBottomRight,
    ),
  }),
};
