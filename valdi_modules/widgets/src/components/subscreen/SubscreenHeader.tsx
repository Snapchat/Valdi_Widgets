import { Component } from 'valdi_core/src/Component';
import { Device } from 'valdi_core/src/Device';
import { BLANK_INSETS, Insets } from '../util/Insets';
import { WithInsets } from '../util/WithInsets';
import { Subscreen } from './Subscreen';

/**
 * Packing controls the general spacing in the header
 * - 'full' have medium padding on the top/bottom
 * - 'condensed' have small padding on the top/bottom
 * - 'cut' have low padding designed for being used in conjonction with <SectionList> sticky header
 * - 'none' have no padding on the top/bottom
 */
export type SubscreenHeaderPacking = 'full' | 'condensed' | 'cut' | 'none';

export interface SubscreenHeaderViewModel {
  packing?: SubscreenHeaderPacking;
  disableInsets?: boolean;
  sidePadding?: number;
}

// Defines how much we remove from the resolved Device top insets on iOS.
const IOS_TOP_INSETS_OFFSET = 15;
// Defines the minimum top insets on iOS after the offset has been applied
const IOS_TOP_INSETS = 13;

/**
 * Subscreen header container; deals with insets and padding.
 */
export class SubscreenHeader extends Component<SubscreenHeaderViewModel> {
  private static verticalPadding = {
    full: { top: 14, bottom: 14 },
    condensed: { top: 11, bottom: 7 },
    cut: { top: 11, bottom: 0 },
    none: { top: 0, bottom: 0 },
  };

  onRender(): void {
    const packing = this.viewModel?.packing ?? 'full';
    const verticalPadding = SubscreenHeader.verticalPadding[packing];
    const sidePadding = this.viewModel.sidePadding ?? Subscreen.GUTTER_SIZE;
    <WithInsets resolveFn={this.insetResolveFn}>
      <layout
        paddingLeft={sidePadding}
        paddingRight={sidePadding}
        paddingTop={verticalPadding.top}
        paddingBottom={verticalPadding.bottom}
      >
        <slot />
      </layout>
    </WithInsets>;
  }

  insetResolveFn = (insets: Insets): Insets => {
    if (this.viewModel?.disableInsets) {
      return BLANK_INSETS;
    }

    const top = Device.isIOS() ? Math.max(IOS_TOP_INSETS, insets.top - IOS_TOP_INSETS_OFFSET) : insets.top;

    return {
      ...insets,
      top,
      bottom: 0,
    };
  };
}
