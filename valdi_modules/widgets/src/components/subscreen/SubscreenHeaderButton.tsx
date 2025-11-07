import { Asset } from 'valdi_core/src/Asset';
import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View, ImageView } from 'valdi_tsx/src/NativeTemplateElements';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { Spacing } from 'widgets/src/styles/spacing';
import { SubscreenHeaderBlueprint } from './SubscreenHeaderBlueprint';

export interface SubscreenHeaderButtonViewModel {
  image?: Asset;
  imageWidth?: string | number;
  imageHeight?: string | number;
  imageColor?: SemanticColor;
  imageRotation?: number;
  touchAreaExtension?: number;
  onTap?: () => void;
  accessibilityId?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  flipOnRtl?: boolean;
}

/**
 * Subscreen header buttons, typically added inside of a Subscreen title's left/right slot
 */
export class SubscreenHeaderButton extends Component<SubscreenHeaderButtonViewModel> {
  onRender(): void {
    const viewModel = this.viewModel ?? {};
    const image = viewModel.image;
    const imageWidth = viewModel.imageWidth ?? image?.width;
    const imageHeight = viewModel.imageHeight ?? image?.height;
    const imageColor = viewModel.imageColor ?? SemanticColor.Text.PRIMARY;
    const imageRotation = viewModel.imageRotation;
    const touchAreaExtension = viewModel.touchAreaExtension ?? Spacing.SM;
    const onTap = viewModel.onTap;
    const accessibilityId = viewModel.accessibilityId;
    const accessibilityLabel = viewModel.accessibilityLabel;
    const accessibilityHint = viewModel.accessibilityHint;
    const flipOnRtl = viewModel.flipOnRtl ?? true;
    <view
      style={styles.container}
      touchAreaExtension={touchAreaExtension}
      onTap={onTap}
      accessibilityId={accessibilityId}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
    >
      <image
        style={styles.image}
        src={image}
        width={imageWidth}
        height={imageHeight}
        tint={imageColor}
        rotation={imageRotation}
        flipOnRtl={flipOnRtl}
      />
    </view>;
  }
}

const styles = {
  container: new Style<View>({
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: SubscreenHeaderBlueprint.minHeight,
    minHeight: SubscreenHeaderBlueprint.minHeight,
    accessibilityCategory: 'image-button',
  }),
  image: new Style<ImageView>({
    objectFit: 'contain',
    maxHeight: '100%',
    maxWidth: '100%',
  }),
};
