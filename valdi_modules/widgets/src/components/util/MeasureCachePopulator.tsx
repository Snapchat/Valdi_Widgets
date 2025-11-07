import { $slot } from 'valdi_core/src/CompilerIntrinsics';
import { StatefulComponent } from 'valdi_core/src/Component';
import { Subscription } from 'valdi_rxjs/src/Subscription';
import { RenderFunction } from '../RenderFunction';
import { ComponentMeasurer } from './ComponentMeasurer';
import { MeasureCache, MeasuredComponentSize } from './MeasureCache';

export interface MeasureCachePopulatorViewModel {
  measureCache: MeasureCache;

  children: {
    /**
     * Will be evaluated to measure the component size initially.
     * Once the size is resolved, the render function on the render
     * property will be called.
     */
    measure: RenderFunction;
    /**
     * Will be evaluated once the component size has been measured and
     * be provided the component size
     */
    render: RenderFunction<MeasuredComponentSize>;
  };
}

interface State {
  componentSize?: MeasuredComponentSize;
}

/**
 * Component that measures a component initially, and then renders
 * children with that measured size.
 */
export class MeasureCachePopulator extends StatefulComponent<MeasureCachePopulatorViewModel, State> {
  state: State = {};

  private subscription?: Subscription;

  onViewModelUpdate(previousViewModel?: Readonly<MeasureCachePopulatorViewModel> | undefined): void {
    if (previousViewModel?.measureCache !== this.viewModel.measureCache) {
      this.setState({
        componentSize: undefined,
      });
      this.subscription?.unsubscribe();
      this.subscription = this.viewModel.measureCache.observable$.subscribe(size => {
        this.setState({ componentSize: size });
      });
    }
  }

  onRender(): void {
    if (!this.state.componentSize) {
      <ComponentMeasurer roundToPoints={this.viewModel.measureCache.roundToPoints} onMeasured={this.onMeasured}>
        {$slot(this.viewModel.children.measure)}
      </ComponentMeasurer>;
    } else {
      this.viewModel.children.render(this.state.componentSize);
    }
  }

  private onMeasured = (size: MeasuredComponentSize): void => {
    this.viewModel.measureCache.populate(size);
  };
}
