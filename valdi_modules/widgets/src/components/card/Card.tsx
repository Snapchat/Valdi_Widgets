import { Component } from 'valdi_core/src/Component';
import { TouchEvent } from 'valdi_tsx/src/GestureEvents';
import { SemanticColor } from 'widgets/src/styles/semanticColors';

export const CARD_RADIUS = 10;

export interface CardViewModel {
  height?: number | string;
  width?: number | string;
  shadow?: CardShadow;
  accessibilityId?: string;
  onTap?: () => void;
  onTouch?: (touchEvent: TouchEvent) => void;
  backgroundColor?: SemanticColor;
  margin?: number | string;
  padding?: number | string;
  cardRadius?: number | string;
  borderWidth?: number | string;
  borderColor?: string;
}

export enum CardShadow {
  DEFAULT,
  NONE,
}

export class Card extends Component<CardViewModel> {
  onRender(): void {
    const viewModel = this.viewModel ?? {};
    let boxShadow: string | undefined = `0 1 10 ${SemanticColor.Elevation.CELL_SHADOW}`;
    if (viewModel.shadow === CardShadow.NONE) {
      boxShadow = undefined;
    }
    <view
      borderRadius={viewModel.cardRadius ?? CARD_RADIUS}
      height={viewModel.height}
      width={viewModel.width}
      backgroundColor={this.viewModel.backgroundColor ?? SemanticColor.Background.SURFACE}
      boxShadow={boxShadow}
      accessibilityId={viewModel.accessibilityId}
      onTap={viewModel.onTap}
      onTouch={viewModel.onTouch}
      margin={viewModel.margin}
      padding={viewModel.padding}
      borderWidth={viewModel.borderWidth ?? (viewModel.borderColor ? 1 : undefined)}
      borderColor={viewModel.borderColor}
    >
      <slot />
    </view>;
  }
}
