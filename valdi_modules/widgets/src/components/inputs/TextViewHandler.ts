import { TextViewInteractive } from 'valdi_tsx/src/NativeTemplateElements';
import { TextInputHandler } from './TextInputHandler';

/**
 * TextInputHandler specialized for TextView elements; adds a deprecated setValue helper for imperative value updates.
 */
export class TextViewHandler extends TextInputHandler<TextViewInteractive> {
  /**
   * @deprecated
   * Consider using the declarative API instead to set the value of the text view
   */
  setValue(value: string | undefined): void {
    return this.elementRef.setAttribute('value', value);
  }
}
