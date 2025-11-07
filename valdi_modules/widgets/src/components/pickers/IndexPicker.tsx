import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { clamp } from 'foundation/src/number';
import { View } from 'valdi_tsx/src/NativeTemplateElements';

export interface IndexPickerViewModel {
  style?: Style<View>;
  index?: number;
  labels: string[];
  onChange: (index: number) => void;
}

export class IndexPicker extends Component<IndexPickerViewModel, {}> {
  onRender(): void {
    const viewModel = this.viewModel;
    const style = viewModel.style;
    const labels = viewModel.labels;
    const index = clamp(viewModel.index ?? 0, 0, labels.length - 1);
    <custom-view
      iosClass='SCValdiIndexPicker'
      androidClass='com.snap.valdi.views.ValdiIndexPicker'
      onChange={viewModel.onChange}
      index={index}
      labels={labels}
      style={style}
    />;
  }
}
