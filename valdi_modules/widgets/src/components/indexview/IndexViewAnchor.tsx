import { Component } from 'valdi_core/src/Component';
import { IndexViewHandler } from './IndexViewHandler';
import { IndexViewSymbol } from './IndexViewSymbol';

export interface IndexViewAnchorViewModel {
  handler: IndexViewHandler;
  symbol: IndexViewSymbol;
}

/**
 * Invisible zero-size layout registered to an IndexViewHandler under a given symbol key.
 * Place this adjacent to the content section that should be reachable via IndexView.
 */
export class IndexViewAnchor extends Component<IndexViewAnchorViewModel> {
  onRender(): void {
    const viewModel = this.viewModel;
    <layout ref={viewModel.handler.getOrCreateRef(viewModel.symbol)} />;
  }
}
