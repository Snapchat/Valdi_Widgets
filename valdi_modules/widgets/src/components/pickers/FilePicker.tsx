import { Component } from 'valdi_core/src/Component';

export interface FilePickerOnSelectEvent {
  fileName: string;
}

export interface FilePickerViewModel {
  onSelect?: (event: FilePickerOnSelectEvent) => void;
  allowMultiple?: boolean;
  accept?: string;
}

export class FilePicker extends Component<FilePickerViewModel, {}> {
  onRender(): void {
    <custom-view
      iosClass='SCWidgetsFilePicker'
      macosClass='SCWidgetsMacOSFilePicker'
      androidClass='com.snap.widgets.pickers.ValdiFilePicker'
      webClass='SCWidgetsFilePickerWeb'
      onSelect={this.viewModel.onSelect}
      allowMultiple={this.viewModel.allowMultiple ?? false}
      accept={this.viewModel.accept}
      width='100%'
      height={56}
    />;
  }
}
