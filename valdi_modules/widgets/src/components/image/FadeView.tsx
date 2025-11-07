import { StatefulComponent } from 'valdi_core/src/Component';
import { Device } from 'valdi_core/src/Device';
import { ElementRef } from 'valdi_core/src/ElementRef';
import { Style } from 'valdi_core/src/Style';
import { when } from 'valdi_core/src/utils/When';
import { BlurStyle, View, Layout } from 'valdi_tsx/src/NativeTemplateElements';
import { SemanticColor } from 'widgets/src/styles/semanticColors';

const styles = {
  overlay: new Style<Layout>({
    position: 'absolute',
    height: '100%',
    width: '100%',
  }),
};

export interface FadeViewViewModel<V> {
  /**
   * View source
   */
  src?: V;
  srcOnFail?: V;
  /**
   * Content rendering options
   */
  opacity?: number;
  backgroundColor?: SemanticColor;
  borderRadius?: string | number;
  borderWidth?: string | number;
  borderColor?: SemanticColor;
  /**
   * Sizing options
   */
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  height?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;
  aspectRatio?: number;
  /**
   * Optionally specify an element ref to be attached to the container's view
   */
  containerRef?: ElementRef<View>;
  /**
   * Gesture events
   */
  onTap?: () => void;
  onLongPress?: () => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
  /**
   * View events
   */
  onLoad?: (success: boolean, latencyMs: number, latencySinceVisibleMS: number) => void;
  /**
   * Loading spinner is optional
   */
  spinnerSize?: number | string;
  spinnerColor?: SemanticColor;
  /**
   * Transition options
   */
  transitionThresholdMs?: number; // No transition if loading was faster than this
  transitionDurationMs?: number;
  transitionBlurStyle?: BlurStyle;
  /**
   * We have the ability to include a custom placeholder before loading has occured
   */
  placeholderEnabled?: boolean;
  /**
   * Accessibility
   */
  accessibilityId?: string;
  accessibilityLabel?: string;
}

export enum FadeViewStatus {
  Loading,
  Transitioning,
  Finished,
  Failed,
}

interface FadeViewState {
  status: FadeViewStatus;
}

/**
 * Component which automatically fades a view in when ready.
 */
export abstract class FadeView<T, U extends FadeViewViewModel<T>> extends StatefulComponent<U, FadeViewState> {
  state: FadeViewState = {
    status: FadeViewStatus.Loading,
  };

  private lastVisible: number = 0;
  private lastUpdate: number = 0;

  onViewModelUpdate(oldViewModel?: U): void {
    if (!oldViewModel || oldViewModel.src !== this.viewModel.src) {
      this.lastUpdate = Date.now();
      this.setState({ status: FadeViewStatus.Loading });
    }
  }

  onRender(): void {
    const viewModel = this.viewModel;
    if (!viewModel) {
      return;
    }

    <view
      ref={viewModel.containerRef}
      width={viewModel.width}
      minWidth={viewModel.minWidth}
      maxWidth={viewModel.maxWidth}
      height={viewModel.height}
      minHeight={viewModel.minHeight}
      maxHeight={viewModel.maxHeight}
      aspectRatio={viewModel.aspectRatio}
      onTap={viewModel.onTap}
      onLongPress={viewModel.onLongPress}
      onTouchStart={viewModel.onTouchStart}
      onTouchEnd={viewModel.onTouchEnd}
      onVisibilityChanged={this.onVisibilityChanged}
      accessibilityId={viewModel.accessibilityId}
      accessibilityLabel={viewModel.accessibilityLabel}
      lazyLayout
    >
      {this.onRenderContent()}
    </view>;
  }

  private onRenderContent(): void {
    const viewModel = this.viewModel;

    const transitionBlurStyle = Device.isIOS() ? viewModel.transitionBlurStyle : undefined;

    const spinnerSize = viewModel.spinnerSize ?? '50%';
    const spinnerColor = viewModel.spinnerColor;

    const status = this.state.status;

    const failed = status === FadeViewStatus.Failed;
    const finished = status === FadeViewStatus.Finished;
    const loading = status === FadeViewStatus.Loading;

    const settled = failed || finished;

    const opacity = viewModel.opacity ?? 1;
    const progress = loading ? 0 : 1;
    const fadeIn = progress * opacity;
    const fadeOut = (1 - progress) * opacity;

    const backgroundColor = viewModel.backgroundColor;
    const borderRadius = viewModel.borderRadius;
    const borderWidth = viewModel.borderWidth;
    const borderColor = viewModel.borderColor;

    const src = failed ? viewModel.srcOnFail : viewModel.src;
    const onLoad = src ? this.onLoad : undefined;

    if (!settled && (viewModel.placeholderEnabled || backgroundColor)) {
      <view
        style={styles.overlay}
        opacity={fadeOut}
        borderRadius={borderWidth || backgroundColor ? borderRadius : undefined}
        borderWidth={borderWidth}
        borderColor={borderColor}
        backgroundColor={backgroundColor}
      >
        {when(viewModel.placeholderEnabled, () => {
          <slot name='placeholder' />;
        })}
      </view>;
    }
    <layout style={styles.overlay}>{this.onRenderBody(fadeIn, src, onLoad)}</layout>;
    if (!settled && transitionBlurStyle) {
      <blur
        style={styles.overlay}
        blurStyle={transitionBlurStyle}
        opacity={fadeOut}
        borderRadius={borderRadius}
        borderWidth={borderWidth}
        borderColor={borderColor}
      />;
    }
    if (!settled && spinnerColor) {
      <layout style={styles.overlay} alignItems='center' justifyContent='center'>
        <spinner
          width={spinnerSize}
          height={spinnerSize}
          maxWidth={spinnerSize}
          maxHeight={spinnerSize}
          aspectRatio={1}
          color={spinnerColor}
          opacity={fadeOut}
        />
      </layout>;
    }
  }

  private onVisibilityChanged = (visible: boolean): void => {
    if (visible) {
      this.lastVisible = Date.now();
    }
  };

  private onLoad = (loaded: boolean): void => {
    if (this.isDestroyed()) {
      return;
    }

    const viewModel = this.viewModel;
    if (!viewModel) {
      return;
    }

    if (this.state.status !== FadeViewStatus.Loading) {
      return;
    }

    const now = Date.now();
    const delaySinceVisible = now - this.lastVisible;
    const delaySinceUpdate = now - this.lastUpdate;
    const minDelay = Math.min(delaySinceVisible, delaySinceUpdate);

    viewModel.onLoad?.(loaded, minDelay, delaySinceVisible);

    const src = viewModel.src;
    if (!loaded && src) {
      console.warn(`Error loading view with source ${src}`);
      if (viewModel.srcOnFail) {
        this.setState({ status: FadeViewStatus.Failed });
      }
      return;
    }

    const transitionThresholdMs = viewModel.transitionThresholdMs ?? 50;
    const transitionDurationMs = viewModel.transitionDurationMs ?? 500;

    if (minDelay >= transitionThresholdMs) {
      const duration = transitionDurationMs / 1000;
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.setStateAnimatedPromise({ status: FadeViewStatus.Transitioning }, { duration: duration }).then(() => {
        if (viewModel.src === src) {
          this.setState({ status: FadeViewStatus.Finished });
        }
      });
    } else {
      this.setState({
        status: FadeViewStatus.Finished,
      });
    }
  };

  abstract onRenderBody(opacity: number, src?: T, onLoad?: (success: boolean) => void): void;
}
