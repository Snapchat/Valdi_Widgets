import { Asset } from 'valdi_core/src/Asset';
import { ElementRef } from 'valdi_core/src/ElementRef';
import { Style } from 'valdi_core/src/Style';
import { ImageFilter } from 'valdi_core/src/utils/ImageFilter';
import { ImageObjectFit, Layout, ImageView } from 'valdi_tsx/src/NativeTemplateElements';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { FadeView, FadeViewViewModel } from './FadeView';

const styles = {
  content: new Style<Layout>({
    width: '100%',
    height: '100%',
  }),
};

type FadeImageSource = Asset | string;

export interface FadeImageViewModel extends FadeViewViewModel<FadeImageSource> {
  /**
   * Image rendering options
   */
  imageRef?: ElementRef<ImageView>;
  objectFit?: ImageObjectFit;
  tint?: SemanticColor;
  filter?: ImageFilter;
  /**
   * Image sizing options
   */
  contentScaleX?: number;
  contentScaleY?: number;
  contentTranslationY?: number;
  scaleX?: number;
  scaleY?: number;
}

/**
 * Image view replacement that automatically fades the image in when needed.
 */
export class FadeImage extends FadeView<FadeImageSource, FadeImageViewModel> {
  onRenderBody(opacity: number, src?: FadeImageSource, onLoad?: (success: boolean) => void): void {
    const viewModel = this.viewModel;
    if (!viewModel) {
      return;
    }

    const backgroundColor = viewModel.backgroundColor;
    const borderRadius = viewModel.borderRadius;
    const borderWidth = viewModel.borderWidth;
    const borderColor = viewModel.borderColor;
    const contentScaleX = viewModel.contentScaleX;
    const contentScaleY = viewModel.contentScaleY;
    const contentTranslationY = viewModel.contentTranslationY;
    const objectFit = viewModel.objectFit ?? 'cover';

    <image
      style={styles.content}
      contentScaleX={contentScaleX}
      contentScaleY={contentScaleY}
      translationY={contentTranslationY}
      ref={viewModel.imageRef}
      src={src}
      objectFit={objectFit}
      opacity={opacity}
      onAssetLoad={onLoad}
      borderRadius={borderRadius}
      borderWidth={borderWidth}
      borderColor={borderColor}
      backgroundColor={backgroundColor}
      tint={viewModel.tint}
      filter={viewModel.filter}
      scaleX={viewModel.scaleX}
      scaleY={viewModel.scaleY}
    />;
  }
}
