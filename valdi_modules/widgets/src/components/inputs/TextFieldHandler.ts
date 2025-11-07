import { TextFieldInteractive } from 'valdi_tsx/src/NativeTemplateElements';
import { TextInputHandler } from './TextInputHandler';

export class TextFieldHandler extends TextInputHandler<TextFieldInteractive> {
  /**
   * @deprecated
   * Consider using the declarative API instead to set the value of the text field
   */
  setValue(value: string | undefined): void {
    return this.elementRef.setAttribute('value', value);
  }
}
