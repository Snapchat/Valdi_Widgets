import { Component } from 'valdi_core/src/Component';
import { BLANK_INSETS, Insets } from '../util/Insets';
import { WithInsets } from '../util/WithInsets';
import { Subscreen } from './Subscreen';

export interface SubscreenContentViewModel {
  disableInsets?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
}

/**
 * Subscreen header contents; deals with insets and padding.
 */
export class SubscreenContent extends Component<SubscreenContentViewModel> {
  onRender(): void {
    <WithInsets resolveFn={this.insetResolveFn}>
      <layout
        paddingTop={this.viewModel.paddingTop ?? Subscreen.GUTTER_SIZE}
        paddingBottom={this.viewModel.paddingBottom ?? Subscreen.GUTTER_SIZE}
      >
        <slot />
      </layout>
    </WithInsets>;
  }
  insetResolveFn = (insets: Insets): Insets => {
    if (this.viewModel?.disableInsets) {
      return BLANK_INSETS;
    }
    return {
      ...insets,
      top: 0,
    };
  };
}
