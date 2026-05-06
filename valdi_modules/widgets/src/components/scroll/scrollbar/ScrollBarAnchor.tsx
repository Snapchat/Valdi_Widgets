import { Component } from 'valdi_core/src/Component';
import { ScrollBarHandler } from './ScrollBarHandler';

export interface ScrollBarAnchorViewModel {
  readonly handler: ScrollBarHandler;
  readonly label: string;
}

/**
 * Invisible zero-size layout registered to a ScrollBarHandler under a given label.
 * Place this adjacent to content sections to enable scroll-bar position tracking.
 */
export class ScrollBarAnchor extends Component<ScrollBarAnchorViewModel> {
  onRender(): void {
    const { handler, label } = this.viewModel;
    <layout ref={handler.getOrCreateRef(label)} />;
  }
}
