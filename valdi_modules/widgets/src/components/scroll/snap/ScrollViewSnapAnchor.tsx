import { Component } from 'valdi_core/src/Component';
import { ScrollViewSnapController } from './ScrollViewSnapController';

export interface ScrollViewSnapAnchorViewModel {
  enabled?: boolean;
  controller: ScrollViewSnapController;
}

export class ScrollViewSnapAnchor extends Component<ScrollViewSnapAnchorViewModel> {
  onRender(): void {
    const viewModel = this.viewModel;
    const enabled = viewModel.enabled ?? true;
    <layout ref={enabled ? viewModel.controller : undefined}>
      <slot />
    </layout>;
  }
}
