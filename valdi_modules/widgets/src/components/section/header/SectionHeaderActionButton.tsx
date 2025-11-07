import { Asset } from 'valdi_core/src/Asset';
import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { when } from 'valdi_core/src/utils/When';
import { Label, View, ImageView } from 'valdi_tsx/src/NativeTemplateElements';
import res from 'widgets/res';
import { CoreButton, CoreButtonColoring, CoreButtonSizing } from 'widgets/src/components/button/CoreButton';
import { TextStyleFont } from 'widgets/src/styles/TextStyleFont';
import { SemanticColor } from '../../../styles/semanticColors';

export interface SectionHeaderActionButtonViewModel {
  /**
   * Type of button
   *
   * Can either be:
   *  - 'navigation' (show a chevron next to the text)
   *  - 'action' (just show text)
   *  - 'pill_button' (show icon and text inside a pill button)
   *
   * Section will default to type 'action' if this is not set.
   */
  type?: 'navigation' | 'action' | 'pill_button';
  label: string;
  onTap: () => void;
  icon?: Asset;
}

/**
 * The default 'Action Button' view for SectionHeader
 */
export class SectionHeaderActionButton extends Component<SectionHeaderActionButtonViewModel> {
  onRender(): void {
    const { label, onTap, type, icon } = this.viewModel;
    if (type === 'pill_button') {
      <CoreButton
        sizing={CoreButtonSizing.TINY}
        coloring={CoreButtonColoring.SECONDARY}
        icon={icon}
        text={label}
        onTap={onTap}
      />;
    } else {
      <view style={style.actionButton} onTap={onTap} accessibilityLabel={label}>
        <label style={style.actionButtonLabel} value={label} />
        {when(type === 'navigation', () => {
          <image style={style.actionButtonImage} src={res.iconSectionButton} />;
        })}
      </view>;
    }
  }
}

const style = {
  actionButton: new Style<View>({
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 0,
    touchAreaExtension: 12,
    accessibilityId: 'action-button',
    accessibilityCategory: 'button',
  }),

  actionButtonImage: new Style<ImageView>({
    width: 16,
    height: 16,
    flipOnRtl: true,
    tint: SemanticColor.Text.SECONDARY,
  }),

  actionButtonLabel: new Style<Label>({
    font: TextStyleFont.SUBHEADLINE,
    color: SemanticColor.Text.SECONDARY,
    accessibilityId: 'section_header_action_button',
  }),
};
