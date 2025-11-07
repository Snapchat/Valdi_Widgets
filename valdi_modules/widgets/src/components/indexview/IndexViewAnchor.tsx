import { Component } from 'valdi_core/src/Component';
import { IndexViewHandler } from './IndexViewHandler';
import { IndexViewSymbol } from './IndexViewSymbol';

export interface IndexViewAnchorViewModel {
  handler: IndexViewHandler;
  symbol: IndexViewSymbol;
}

export class IndexViewAnchor extends Component<IndexViewAnchorViewModel> {
  onRender(): void {
    const viewModel = this.viewModel;
    <layout ref={viewModel.handler.getOrCreateRef(viewModel.symbol)} />;
  }
}
