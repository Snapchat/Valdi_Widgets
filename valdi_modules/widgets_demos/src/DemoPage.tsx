import { Component } from 'valdi_core/src/Component';
import { TextStyleFont } from 'widgets/src/styles/TextStyleFont';
import { SemanticColor } from 'widgets/src/styles/semanticColors';

export interface DemoPageViewModel {
  title: string;
  subtitle?: string;
}

/**
 * Shared chrome for a demo: page title, optional subtitle, and a vertical scroll for the content slot.
 */
export class DemoPage extends Component<DemoPageViewModel> {
  onRender(): void {
    const { title, subtitle } = this.viewModel;
    <view backgroundColor={SemanticColor.Background.SUBSCREEN} height='100%'>
      <scroll flexGrow={1}>
        <layout padding='16 0 32 0'>
          <label value={title} font={TextStyleFont.TITLE_2} margin='0 16 4 16' />
          {subtitle && (
            <label
              value={subtitle}
              font={TextStyleFont.BODY}
              color={SemanticColor.Text.SECONDARY}
              numberOfLines={0}
              margin='0 16 8 16'
            />
          )}
          <slot />
        </layout>
      </scroll>
    </view>;
  }
}
