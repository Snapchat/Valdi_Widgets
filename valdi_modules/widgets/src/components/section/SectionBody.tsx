import { Component } from 'valdi_core/src/Component';
import { Subscreen } from 'widgets/src/components/subscreen/Subscreen';

export interface SectionBodyViewModel {
  /**
   * By default, sections are padded horizontally.
   * `fullBleed` can be used to opt-out of padding on section content,
   * allowing the view below the section title to take up the full width of the parent view.
   */
  fullBleed?: boolean;
}

export class SectionBody extends Component<SectionBodyViewModel> {
  onRender(): void {
    const paddingHorizontal = this.viewModel.fullBleed ? 0 : Subscreen.GUTTER_SIZE;
    <layout paddingLeft={paddingHorizontal} paddingRight={paddingHorizontal}>
      <slot />
    </layout>;
  }
}
