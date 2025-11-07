import { Component } from 'valdi_core/src/Component';
import { Device } from 'valdi_core/src/Device';
import { Style } from 'valdi_core/src/Style';
import { when } from 'valdi_core/src/utils/When';
import { View, Layout, ScrollView } from 'valdi_tsx/src/NativeTemplateElements';
import { SemanticColor } from 'widgets/src/styles/semanticColors';

const grabberHeight = 4;

const styles = {
  scroll: new Style<ScrollView>({
    height: '100%',
    width: '100%',
  }),
  tapOutTarget: new Style<Layout>({
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }),
  sheet: new Style<View>({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 100,
    backgroundColor: SemanticColor.Background.SURFACE,
    borderRadius: 20,
  }),
  grabber: new Style<View>({
    position: 'absolute',
    alignSelf: 'center',
    top: 6,
    width: 44,
    opacity: 0.23,
    height: grabberHeight,
    borderRadius: grabberHeight / 2,
  }),
  iOSBlurBackground: new Style<View>({
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 14,
  }),
};

export interface SheetViewModel {
  height?: string | number;
  onTapOut?: () => void;
  accessibilityId?: string;
  accessibilityLabel?: string;
  scrollViewBouncesFromDragAtStart?: boolean;
  scrollViewBouncesFromDragAtEnd?: boolean;
  backgroundColor?: string;
  isBlurredBackground?: boolean; // work for IOS only
  shouldShowGrabber?: boolean;
  grabberColor?: string;
}

export class Sheet extends Component<SheetViewModel> {
  onRender(): void {
    const {
      accessibilityId,
      accessibilityLabel,
      scrollViewBouncesFromDragAtStart,
      scrollViewBouncesFromDragAtEnd,
      height,
      onTapOut,
      backgroundColor,
      isBlurredBackground,
      shouldShowGrabber,
    } = this.viewModel;
    const grabberColor = this.viewModel.grabberColor ?? SemanticColor.Button.TERTIARY;
    <scroll
      accessibilityId={accessibilityId}
      accessibilityLabel={accessibilityLabel}
      bouncesFromDragAtStart={scrollViewBouncesFromDragAtStart}
      bouncesFromDragAtEnd={scrollViewBouncesFromDragAtEnd}
      style={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* Dismiss target */}
      <view style={styles.tapOutTarget} onTap={onTapOut} />
      {/* Actual Sheet */}
      <view style={styles.sheet} backgroundColor={backgroundColor} height={height}>
        {when(Device.isIOS() && isBlurredBackground, () => {
          <blur style={styles.iOSBlurBackground} />;
        })}
        {/* Grabber */}
        {when(shouldShowGrabber, () => {
          <view style={styles.grabber} backgroundColor={grabberColor} />;
        })}
        {/* Contents */}
        <slot />
      </view>
    </scroll>;
  }
}
