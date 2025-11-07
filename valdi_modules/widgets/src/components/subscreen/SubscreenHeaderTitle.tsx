import { Asset } from 'valdi_core/src/Asset';
import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { when } from 'valdi_core/src/utils/When';
import { ImageView, Label } from 'valdi_tsx/src/NativeTemplateElements';
import { TextStyleFont } from 'widgets/src/styles/TextStyleFont';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { SubscreenHeaderBlueprint } from './SubscreenHeaderBlueprint';

export interface SubscreenHeaderTitleViewModel {
  title: string;
  subtitlePrefix?: Asset | undefined;
  subtitle?: string;
  subtitleSuffix?: Asset | undefined;
  subtitlePaddingTop?: number;
  subtitlePaddingBottom?: number;
  titleColor?: SemanticColor;
  subtitleColor?: SemanticColor;
  onTapTitle?: () => void;
  onTapSubtitle?: () => void;
  accessibilityId?: string;
}

/**
 * Subscreen header title
 *
 * Is designed to be used inside of a <SubscreenHeader>
 * Format and display a title label, also allow injection of action buttons through 2 slots (left/right)
 */
export class SubscreenHeaderTitle extends Component<SubscreenHeaderTitleViewModel> {
  onRender(): void {
    const viewModel = this.viewModel;
    <SubscreenHeaderBlueprint>
      <slotted slot={'left'}>
        <slot name={'left'} />
      </slotted>
      <slotted slot={'middle'}>
        <label
          style={styles.title}
          value={viewModel.title}
          color={this.viewModel.titleColor}
          onTap={viewModel.onTapTitle}
          accessibilityId={viewModel.accessibilityId}
        />
        {this.onRenderSubtitle()}
      </slotted>
      <slotted slot={'right'}>
        <slot name={'right'} />
      </slotted>
    </SubscreenHeaderBlueprint>;
  }

  private onRenderSubtitle(): void {
    const subtitle = this.viewModel.subtitle;
    if (subtitle !== undefined && subtitle !== '') {
      <view
        flexDirection='row'
        onTap={this.viewModel.onTapSubtitle}
        touchAreaExtension={4}
        paddingTop={this.viewModel.subtitlePaddingTop}
        paddingBottom={this.viewModel.subtitlePaddingBottom}
      >
        {when(this.viewModel.subtitlePrefix, subtitlePrefix => {
          <image src={subtitlePrefix} style={styles.subtitleImage} />;
        })}
        <label style={styles.subtitleText} value={this.viewModel.subtitle} color={this.viewModel.subtitleColor} />
        {when(this.viewModel.subtitleSuffix, subtitleSuffix => {
          <image src={subtitleSuffix} style={styles.subtitleImage} />;
        })}
      </view>;
    }
  }
}

const styles = {
  title: new Style<Label>({
    font: TextStyleFont.TITLE_4,
    color: SemanticColor.Text.PRIMARY,
    textAlign: 'center',
    accessibilityCategory: 'header',
  }),
  subtitleImage: new Style<ImageView>({
    width: 12,
    height: 12,
    margin: 2,
  }),
  subtitleText: new Style<Label>({
    font: TextStyleFont.CAPTION,
    color: SemanticColor.Text.SECONDARY,
    textAlign: 'center',
    accessibilityCategory: 'header',
    numberOfLines: 0,
  }),
};
