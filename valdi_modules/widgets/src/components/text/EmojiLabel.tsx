import { Component } from 'valdi_core/src/Component';
import { Label } from 'valdi_tsx/src/NativeTemplateElements';

export type EmojiLabelViewModel = Label;

/**
 * EmojiLabel supports rendering labels with emoji values
 *
 * It uses a custom view on Android to prevent showing missing emoji characters in the form of ☐
 * This custom view enables older Android OS versions to display newer emoji characters without OS updates
 * This comes with a performance cost so only use it when it's critical to render emoji correctly
 */
export class EmojiLabel extends Component<EmojiLabelViewModel> {
  onRender(): void {
    <custom-view
      androidClass='com.snap.valdi.views.ValdiEmojiTextView'
      iosClass='SCValdiLabel'
      {...this.viewModel}
    />;
  }
}
