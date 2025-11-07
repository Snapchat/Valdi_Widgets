import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { Label, View } from 'valdi_tsx/src/NativeTemplateElements';
import { AnimationSquishy } from 'widgets/src/components/animation/AnimationSquishy';
import { TextStyleFont } from 'widgets/src/styles/TextStyleFont';
import { SemanticColor } from 'widgets/src/styles/semanticColors';

export enum SectionBadgeTheme {
  Yellow, // Default
  Red,
}

export const DEFAULT_SECTION_BADGE_THEME = SectionBadgeTheme.Yellow;

interface SectionBadgeStyle {
  background: Style<View>;
  text: Style<Label>;
}

function getStyle(theme: SectionBadgeTheme): SectionBadgeStyle {
  // Style of default theme
  let backgroundColor = SemanticColor.Base.BRAND_YELLOW;
  let textColor = SemanticColor.Base.FADED_BLACK;

  if (theme === SectionBadgeTheme.Red) {
    backgroundColor = SemanticColor.Base.RED_REGULAR;
    textColor = SemanticColor.Flat.PURE_WHITE;
  }

  return {
    background: new Style<View>({
      flexDirection: 'row',
      backgroundColor: backgroundColor,
      borderRadius: '50%',
      boxShadow: '0 2 3 rgba(0, 0, 0, 0.1)',
      padding: '4 10',
      margin: '0 10',
      marginTop: -2,
      marginBottom: -1,
    }),

    text: new Style<Label>({
      font: TextStyleFont.CAPTION_EMPHASIS,
      color: textColor,
    }),
  };
}

export interface SectionBadgeViewModel {
  text: string;
  theme?: SectionBadgeTheme;
}

export class SectionBadge extends Component<SectionBadgeViewModel> {
  onRender(): void {
    const text = this.viewModel?.text.toLocaleUpperCase();
    const style = getStyle(this.viewModel?.theme ?? DEFAULT_SECTION_BADGE_THEME);

    <AnimationSquishy
      direction='shrink'
      delayMs={2400}
      tiltX={-35}
      style={style.background}
      animationOptions={{ duration: 0.4 }}
    >
      <label value={text} style={style.text} />
    </AnimationSquishy>;
  }
}
