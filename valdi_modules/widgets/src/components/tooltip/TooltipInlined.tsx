import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { Label, View, Layout, ImageView, Color } from 'valdi_tsx/src/NativeTemplateElements';
import res from 'widgets/res';
import { TextStyleFont } from 'widgets/src/styles/TextStyleFont';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { Spacing } from 'widgets/src/styles/spacing';
import { TooltipConstants } from './TooltipConstants';
import { TooltipPosition } from './TooltipPosition';

export interface TooltipInlinedViewModel {
  text: string;
  position: TooltipPosition;
  opacity?: number;
  onTap?: () => void;
  maxNumberOfLines?: number;
  overrideBackgroundColor?: Color;
}

/**
 * This component is used to render the visuals of a tooltip (float bubble of text with a tail)
 * Usually we would recommend using the "TooltipAnchor" instead of this directly
 * this is because the "TooltipInlined" will NOT automatically position itself correctly
 * and that responsibility will be left to the calling code
 */
export class TooltipInlined extends Component<TooltipInlinedViewModel> {
  onRender(): void {
    const { text, position, opacity, onTap } = this.viewModel;
    <layout style={rootStyles[position]}>
      <view style={baseStyles.container} backgroundColor={this.getBackgroundColor()} onTap={onTap} opacity={opacity}>
        <label value={text} style={baseStyles.label(this.viewModel.maxNumberOfLines)} />
      </view>
      <image style={tailStyles[position]} tint={this.getBackgroundColor()} opacity={opacity} />
    </layout>;
  }

  private getBackgroundColor = (): Color => {
    return this.viewModel.overrideBackgroundColor ?? SemanticColor.Background.SURFACE;
  };
}

const baseStyles = {
  root: new Style<Layout>({
    justifyContent: 'flex-end',
  }),
  container: new Style<View>({
    paddingTop: Spacing.XS,
    paddingBottom: Spacing.XS,
    paddingLeft: Spacing.SM,
    paddingRight: Spacing.SM,
    borderRadius: Spacing.XS,
    boxShadow: `0 0 6 rgba(0,0,0,0.15)`,
    backgroundColor: SemanticColor.Background.SURFACE,
    overflow: 'scroll',
  }),
  label: (maxNumberOfLines: number | undefined): Style<Label> =>
    new Style<Label>({
      textAlign: 'center',
      font: TextStyleFont.CAPTION,
      color: SemanticColor.Text.PRIMARY,
      numberOfLines: maxNumberOfLines ?? 3,
    }),
  tail: new Style<ImageView>({
    src: res.iconTooltipTail,
    width: TooltipConstants.tailImageSize,
    height: TooltipConstants.tailImageSize,
    tint: SemanticColor.Background.SURFACE,
  }),
};

const rootStyles = {
  [TooltipPosition.BottomLeft]: baseStyles.root.extend({
    flexDirection: 'column-reverse',
    alignItems: 'flex-end',
  }),
  [TooltipPosition.BottomRight]: baseStyles.root.extend({
    flexDirection: 'column-reverse',
    alignItems: 'flex-start',
  }),
  [TooltipPosition.BottomCenter]: baseStyles.root.extend({
    flexDirection: 'column-reverse',
    alignItems: 'center',
  }),
  [TooltipPosition.CenterLeft]: baseStyles.root.extend({
    flexDirection: 'row',
    alignItems: 'center',
  }),
  [TooltipPosition.CenterRight]: baseStyles.root.extend({
    flexDirection: 'row-reverse',
    alignItems: 'center',
  }),
  [TooltipPosition.TopLeft]: baseStyles.root.extend({
    flexDirection: 'column',
    alignItems: 'flex-end',
  }),
  [TooltipPosition.TopRight]: baseStyles.root.extend({
    flexDirection: 'column',
    alignItems: 'flex-start',
  }),
  [TooltipPosition.TopCenter]: baseStyles.root.extend({
    flexDirection: 'column',
    alignItems: 'center',
  }),
};

const tailStyles = {
  [TooltipPosition.BottomLeft]: baseStyles.tail.extend({
    rotation: Math.PI,
    marginRight: TooltipConstants.tailToCornerDistance,
    marginTop: TooltipConstants.tailToContentMargin,
  }),
  [TooltipPosition.BottomRight]: baseStyles.tail.extend({
    rotation: Math.PI,
    marginLeft: TooltipConstants.tailToCornerDistance,
    marginTop: TooltipConstants.tailToContentMargin,
  }),
  [TooltipPosition.BottomCenter]: baseStyles.tail.extend({
    rotation: Math.PI,
    marginTop: TooltipConstants.tailToContentMargin,
  }),
  [TooltipPosition.CenterLeft]: baseStyles.tail.extend({
    rotation: -Math.PI / 2,
    marginRight: TooltipConstants.tailToContentMargin,
  }),
  [TooltipPosition.CenterRight]: baseStyles.tail.extend({
    rotation: Math.PI / 2,
    marginLeft: TooltipConstants.tailToContentMargin,
  }),
  [TooltipPosition.TopLeft]: baseStyles.tail.extend({
    rotation: 0,
    marginRight: TooltipConstants.tailToCornerDistance,
    marginBottom: TooltipConstants.tailToContentMargin,
  }),
  [TooltipPosition.TopRight]: baseStyles.tail.extend({
    rotation: 0,
    marginLeft: TooltipConstants.tailToCornerDistance,
    marginBottom: TooltipConstants.tailToContentMargin,
  }),
  [TooltipPosition.TopCenter]: baseStyles.tail.extend({
    rotation: 0,
    marginBottom: TooltipConstants.tailToContentMargin,
  }),
};
