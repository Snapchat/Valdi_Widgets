import { Component } from 'valdi_core/src/Component';

export interface FilePickerOnSelectEvent {
  fileName: string;
  /** Absolute path on desktop native builds. */
  path?: string;
  /** Text payload from web or decoded native text files. */
  text?: string;
  /** Image data URL from web file input. */
  dataUrl?: string;
  /** Raw bytes from native binary reads. */
  bytes?: Uint8Array;
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
