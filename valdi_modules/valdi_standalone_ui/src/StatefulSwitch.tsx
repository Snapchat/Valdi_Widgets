import { StatefulComponent } from 'valdi_core/src/Component';
import { CoreToggle } from 'widgets/src/components/toggle/CoreToggle';
import { Spacing } from 'widgets/src/styles/spacing';

interface ViewModel {
  initialValue: boolean;
  onChange: (value: boolean) => void;
}

interface State {
  value: boolean;
}

const WIDTH = 40;

export class StatefulSwitch extends StatefulComponent<ViewModel, State> {
  state: State = {
    value: this.viewModel.initialValue,
  };

  onRender() {
    <view width={WIDTH} onTap={this.onTap} paddingTop={Spacing.XS} paddingBottom={Spacing.XS}>
      <CoreToggle on={this.state.value} />
    </view>;
  }

  private onTap = () => {
    this.setState({ value: !this.state.value });
    this.viewModel.onChange(this.state.value);
  };
}
