import { Component } from 'valdi_core/src/Component';

export interface FilePickerOnSelectEvent {
  fileName: string;
  /** Absolute path on desktop native builds. */
  path?: string;
  /** Text payload from web, populated only when readContent is set. */
  text?: string;
  /** Image data URL from web file input, populated only when readContent is set. */
  dataUrl?: string;
}

export interface FilePickerViewModel {
  onSelect?: (event: FilePickerOnSelectEvent) => void;
  allowMultiple?: boolean;
  accept?: string;
  /**
   * Web only: eagerly read the selected file's content and include it as
   * `text` or `dataUrl` in the onSelect event. Off by default since it can
   * be wasteful for large files; native platforms never read content and
   * only provide `path`.
   */
  readContent?: boolean;
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
      readContent={this.viewModel.readContent ?? false}
      width='100%'
      height={56}
    />;
  }
}
