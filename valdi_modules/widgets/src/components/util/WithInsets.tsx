import { StatefulComponent } from 'valdi_core/src/Component';
import { Device } from 'valdi_core/src/Device';
import { DeviceCancelable } from 'valdi_core/src/DeviceBridge';
import { identity } from 'foundation/src/function';
import { Insets } from './Insets';

type InsetType = 'padding' | 'margin';
type InsetProperty = `${InsetType}${'Top' | 'Bottom' | 'Left' | 'Right'}`;
type InsetAttributes = {
  [k in InsetProperty]?: number;
};

export interface WithInsetsViewModel {
  ignoreTop?: boolean;
  ignoreBottom?: boolean;
  ignoreLeft?: boolean;
  ignoreRight?: boolean;
  flexShrink?: number;
  flexGrow?: number;
  resolveFn?: (insets: Insets) => Insets;
  insetType?: InsetType;
}

interface WithInsetsState {
  insets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export class WithInsets extends StatefulComponent<WithInsetsViewModel, WithInsetsState> {
  state = {
    insets: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
  };

  private deviceInsetObserver?: DeviceCancelable;

  onRender(): void {
    const insets = this.state.insets;
    const { insetType = 'padding' } = this.viewModel;
    const insetProperties: InsetAttributes = {
      [`${insetType}Top`]: this.viewModel?.ignoreTop ? 0 : insets.top,
      [`${insetType}Bottom`]: this.viewModel?.ignoreBottom ? 0 : insets.bottom,
      [`${insetType}Left`]: this.viewModel?.ignoreLeft ? 0 : insets.left,
      [`${insetType}Right`]: this.viewModel?.ignoreRight ? 0 : insets.right,
    };
    <layout flexShrink={this.viewModel?.flexShrink} flexGrow={this.viewModel?.flexGrow} {...insetProperties}>
      <slot />
    </layout>;
  }

  onCreate(): void {
    this.onInsetsChanged();
    this.deviceInsetObserver = Device.observeDisplayInsetChange(() => {
      this.onInsetsChanged();
    });
  }

  onDestroy(): void {
    if (this.deviceInsetObserver) {
      this.deviceInsetObserver.cancel();
    }
  }

  private onInsetsChanged(): void {
    const resolveFn = (this.viewModel && this.viewModel.resolveFn) || identity;
    this.setState({
      insets: resolveFn({
        top: Device.getDisplayTopInset(),
        bottom: Device.getDisplayBottomInset(),
        left: Device.getDisplayLeftInset(),
        right: Device.getDisplayRightInset(),
      }),
    });
  }
}
