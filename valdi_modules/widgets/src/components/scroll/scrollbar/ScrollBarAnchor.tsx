import { Component } from 'valdi_core/src/Component';
import { ScrollBarHandler } from './ScrollBarHandler';

export interface ScrollBarAnchorViewModel {
  readonly handler: ScrollBarHandler;
  readonly label: string;
}

export class ScrollBarAnchor extends Component<ScrollBarAnchorViewModel> {
  onRender(): void {
    const { handler, label } = this.viewModel;
    <layout ref={handler.getOrCreateRef(label)} />;
  }
}
