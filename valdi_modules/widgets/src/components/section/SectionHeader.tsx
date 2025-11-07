import { Asset } from 'valdi_core/src/Asset';
import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { Label, Layout } from 'valdi_tsx/src/NativeTemplateElements';
import { Theme } from 'widgets/src/Theme';
import { Subscreen } from 'widgets/src/components/subscreen/Subscreen';
import { TextStyleFont } from 'widgets/src/styles/TextStyleFont';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { Spacing } from 'widgets/src/styles/spacing';
import { RenderFunction } from '../RenderFunction';
import { SectionHeaderActionButton } from './header/SectionHeaderActionButton';

export interface ISectionActionButton {
  label: string;
  onTap: () => void;
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
  icon?: Asset;
}

export interface SectionHeaderContext {
  themeType?: Theme.Type;
}

export interface SectionHeaderViewModel {
  title: string;
  subtitle?: string;
  // Subtext that extends to 100% width of the section header. 'Action Button' will be above.
  description?: string;
  // Provides default actionButton UI. To customize the action button, use the RenderFunction instead.
  actionButton?: ISectionActionButton;
  actionButtonRenderFn?: RenderFunction;
  titleColor?: SemanticColor;
  titleMaxLines?: number;
}

export class SectionHeader extends Component<SectionHeaderViewModel, SectionHeaderContext> {
  private readonly theme = Theme.from(this.context.themeType);
  private readonly style = {
    container: new Style<Layout>({
      padding: `0 ${Subscreen.GUTTER_SIZE}`,
      marginBottom: Spacing.SM,
      marginLeft: 2,
    }),

    row: new Style<Layout>({
      flexDirection: 'row',
      alignItems: 'center',
    }),
    labels: new Style<Layout>({
      flexDirection: 'column',
      flexGrow: 1,
      flexShrink: 1,
    }),

    title: new Style<Layout>({
      flexDirection: 'row',
    }),
    titleLabel: new Style<Label>({
      font: TextStyleFont.BODY_EMPHASIS,
      color: this.theme.applyTo(SemanticColor.Text.PRIMARY),
      flexShrink: 1,
      accessibilityId: 'section-title',
      accessibilityCategory: 'header',
    }),
    titleSlot: new Style<Layout>({
      flexGrow: 1,
      flexShrink: 1,
      flexDirection: 'row',
    }),

    subtitle: new Style<Label>({
      font: TextStyleFont.CAPTION,
      color: this.theme.applyTo(SemanticColor.Text.TERTIARY),
      marginTop: 2,
      numberOfLines: 1,
      accessibilityId: 'section-subtitle',
    }),

    description: new Style<Label>({
      font: TextStyleFont.CAPTION,
      color: this.theme.applyTo(SemanticColor.Text.TERTIARY),
      marginTop: 2,
      width: '100%',
      numberOfLines: 3,
      accessibilityId: 'section-description',
    }),
  };

  onRender(): void {
    const viewModel = this.viewModel;
    <layout style={this.style.container}>
      {/* Top row, contains title+subtitle+actionbutton */}
      <layout style={this.style.row}>
        {/* Top row left side, contains title+subtitle */}
        <layout style={this.style.labels}>
          {/* Title */}
          {this.onRenderTitle(viewModel.title, viewModel.titleColor)}
          {/* Subtitle */}
          {this.onRenderSubtitle(viewModel.subtitle)}
        </layout>
        {/* Top row right side, contains the actionbutton */}
        {this.onRenderActionButton()}
      </layout>
      {/* Bottom row, contains description */}
      <layout style={this.style.row}>
        {/* Description */}
        {this.onRenderDescription(viewModel.description)}
      </layout>
    </layout>;
  }

  private onRenderTitle(title: string, titleColor?: SemanticColor): void {
    <layout style={this.style.title}>
      {/* Title label */}
      <label
        style={this.style.titleLabel}
        value={title}
        color={titleColor}
        numberOfLines={this.viewModel.titleMaxLines}
      />
      {/* Title slot container */}
      <layout style={this.style.titleSlot}>
        <slot />
      </layout>
    </layout>;
  }

  private onRenderSubtitle(subtitle?: string): void {
    if (subtitle) {
      <label style={this.style.subtitle} value={subtitle} />;
    } else {
      <slot name='subtitle' />;
    }
  }

  private onRenderDescription(description?: string): void {
    if (description) {
      <label style={this.style.description} value={description} />;
    } else {
      <slot name='description' />;
    }
  }

  private onRenderActionButton(): void {
    const { actionButton, actionButtonRenderFn } = this.viewModel;
    if (actionButton) {
      if (actionButton.type === 'pill_button') {
        <SectionHeaderActionButton
          label={actionButton.label}
          onTap={actionButton.onTap}
          type={actionButton.type}
          icon={actionButton.icon}
        />;
      } else {
        <SectionHeaderActionButton label={actionButton.label} onTap={actionButton.onTap} type={actionButton.type} />;
      }
    } else if (actionButtonRenderFn) {
      actionButtonRenderFn();
    }
  }
}
