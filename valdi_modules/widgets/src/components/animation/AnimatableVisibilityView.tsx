import { StatefulComponent } from 'valdi_core/src/Component';
import { ComponentConstructor, IComponent } from 'valdi_core/src/IComponent';

export interface Hideable {
  hidden: boolean;
}

interface AnimatableVisibilityViewModel<ViewModel> {
  viewModel: ViewModel | undefined;
  animationDuration: number;
  componentClass: ComponentConstructor<IComponent<ViewModel & Hideable>>;
}

interface AnimatableVisibilityViewState<ViewModel> {
  hidden: boolean;
  viewModel: Readonly<ViewModel> | undefined;
}
export const DEFAULT_MODAL_ANIMATION_DURATION = 0.3;

/**
 * Renders the component specified by {@link AnimatableVisibilityViewModel["componentClass"]} using
 * the supplied view model only if defined. When transitioning between a undefined & defined view model,
 * this Component will animate to the visible state for specified duration. The supplied Component should
 * handle entry & exit animations by defining styles for when {@link Hideable["hidden"]} is true.
 *
 * @example
 * class MyComponent extends Component<MyComponentViewModel & Hideable> {
 *   onRender(): void {
 *     // Renders a label that fades in when shown
 *     <label value={this.viewModel.text} opacity={this.viewModel.hidden ? 0 : 1} />
 *   }
 * }
 */
export class AnimatableVisibilityView<ViewModel> extends StatefulComponent<
  AnimatableVisibilityViewModel<ViewModel>,
  AnimatableVisibilityViewState<ViewModel>
> {
  state = {
    hidden: !this.viewModel.viewModel,
    viewModel: this.viewModel.viewModel,
  };

  onRender(): void {
    if (this.state.viewModel) {
      <this.viewModel.componentClass {...this.state.viewModel} hidden={this.state.hidden} />;
    }
  }
  onViewModelUpdate(previousViewModel?: AnimatableVisibilityViewModel<ViewModel>): void {
    if (!previousViewModel) {
      return;
    }
    const shouldHide = this.viewModel.viewModel === undefined;
    if (this.state.hidden !== shouldHide) {
      if (shouldHide) {
        this.setTimeoutDisposable(
          () =>
            this.setStateAnimated(
              { hidden: true },
              {
                duration: this.viewModel.animationDuration,
                completion: () => this.setState({ viewModel: undefined }),
              },
            ),
          0,
        );
      } else {
        this.setState({ viewModel: this.viewModel.viewModel });
        this.setTimeoutDisposable(
          () => this.setStateAnimated({ hidden: false }, { duration: this.viewModel.animationDuration }),
          0,
        );
      }
    } else {
      this.setState({ viewModel: this.viewModel.viewModel });
    }
  }
}
