import { TextFieldInteractive } from 'valdi_tsx/src/NativeTemplateElements';
import { TextInputHandler } from './TextInputHandler';

/**
 * TextInputHandler specialized for TextField elements; adds a deprecated setValue helper for imperative value updates.
 */
export class TextFieldHandler extends TextInputHandler<TextFieldInteractive> {
  /**
   * @deprecated
   * Consider using the declarative API instead to set the value of the text field
   */
  setValue(value: string | undefined): void {
    return this.elementRef.setAttribute('value', value);
  }
}
