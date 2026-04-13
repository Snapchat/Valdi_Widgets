import { Component } from 'valdi_core/src/Component';
import { ScrollViewSnapController } from './ScrollViewSnapController';

export interface ScrollViewSnapAnchorViewModel {
  enabled?: boolean;
  controller: ScrollViewSnapController;
}

/**
 * Wraps its slot content in a layout registered to a ScrollViewSnapController so the scroll view can snap to it.
 * Set enabled=false to temporarily opt out of snapping without removing the anchor.
 */
export class ScrollViewSnapAnchor extends Component<ScrollViewSnapAnchorViewModel> {
  onRender(): void {
    const viewModel = this.viewModel;
    const enabled = viewModel.enabled ?? true;
    <layout ref={enabled ? viewModel.controller : undefined}>
      <slot />
    </layout>;
  }
}
