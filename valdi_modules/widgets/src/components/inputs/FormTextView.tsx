import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import {
  EditTextEvent,
  TextViewTextGravity,
  Label,
  View,
  EditTextBeginEvent,
  EditTextEndEvent,
} from 'valdi_tsx/src/NativeTemplateElements';
import { TextStyleFont } from 'widgets/src/styles/TextStyleFont';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { FocusableComponentRef } from '../util/FocusableComponentRef';
import { ScrollWithKeyboard } from './ScrollWithKeyboard';
import { TextViewWrapper } from './TextViewWrapper';

const SPECS_BORDER_RADIUS = 8;
const SPECS_HEIGHT = 38;
const SPECS_VERTICAL_PADDING = 4;
const SPECS_HORIZONTAL_PADDING = 16;

export interface FormTextViewViewModel {
  // Placeholder to display in the text input when there are no typed text
  placeholder: string;
  // Specify the typed text value, can be updated dynamically on all user typing
  value?: string;
  // Specify the minimum height of the input textview, in case the typed text is too short
  minHeight?: number;
  // Specify the maximum height of the input textview, in case the typed text is too long
  maxHeight?: number;
  // Some features need a character limit, which will display a "remaining character" counter
  characterLimit?: number;
  // Called when the user focuses the text view
  onEditBegin?: (e: EditTextBeginEvent) => void;
  // Called when the user unfocuses the text view
  onEditEnd?: (e: EditTextEndEvent) => void;
  // Called when the user types something
  onChange?: (e: EditTextEvent) => void;
  // Called when the user typed something, and can be used to dynamically postprocess the typed value
  onWillChange?: (e: EditTextEvent) => EditTextEvent | undefined;
  // Specify if we want to scroll the parent scroll view when the keyboard opens
  scrollWithKeyboard?: ScrollWithKeyboard;
  accessibilityId?: string;

  textGravity?: TextViewTextGravity;

  // Override the background color of the textfield when unfocused
  unfocusedBackgroundColorOverride?: SemanticColor;
  // Override the background color of the textfield when focused
  focusedBackgroundColorOverride?: SemanticColor;
  // Override vertical padding
  verticalPaddingOverride?: number;
  // Override horizontal padding
  horizontalPaddingOverride?: number;
  // Set whether the text input is editable or not (default to true if undefined)
  enabled?: boolean;
}

interface FormTextViewState {
  value: string;
  focused: boolean;
}

/**
 * Standard multiline input used for forms and miscellaneous purposes.
 * note: some feature need a character counter, which is optionally specifiable through the "characterLimit"
 */
export class FormTextView extends StatefulComponent<FormTextViewViewModel, FormTextViewState> {
  state: FormTextViewState = {
    value: '',
    focused: false,
  };

  private readonly textViewWrapperRef = new FocusableComponentRef<TextViewWrapper>();

  setFocused(value: boolean): void {
    this.textViewWrapperRef.setFocused(value);
  }

  onViewModelUpdate(): void {
    const { value } = this.viewModel;
    if (value !== undefined) {
      this.setState({ value });
    }
  }

  onRender(): void {
    <view
      style={styles.background}
      backgroundColor={this.getBackgroundColor()}
      paddingLeft={this.getHorizontalPadding()}
      paddingRight={this.getHorizontalPadding()}
      onTap={this.onTapBackground}
    >
      {this.onRenderContent()}
    </view>;
  }

  private onRenderContent(): void {
    const viewModel = this.viewModel;
    const state = this.state;
    const minHeight = Math.max(viewModel.minHeight || 0, SPECS_HEIGHT);

    <layout
      minHeight={minHeight}
      maxHeight={viewModel.maxHeight}
      paddingTop={this.getVerticalPadding()}
      paddingBottom={this.getVerticalPadding()}
    >
      <TextViewWrapper
        ref={this.textViewWrapperRef}
        value={state.value}
        color={SemanticColor.Text.PRIMARY}
        font={TextStyleFont.BODY_EMPHASIS}
        placeholder={viewModel.placeholder}
        placeholderColor={SemanticColor.Text.TERTIARY}
        minHeight={minHeight - this.getVerticalPadding() * 2}
        characterLimit={viewModel.characterLimit}
        onEditBegin={this.onEditBegin}
        onChange={this.onChange}
        onWillChange={this.onWillChange}
        onEditEnd={this.onEditEnd}
        scrollWithKeyboard={viewModel.scrollWithKeyboard}
        accessibilityId={viewModel.accessibilityId}
        textGravity={viewModel.textGravity}
        enabled={viewModel.enabled ?? true}
      />
    </layout>;
    const characterLimit = viewModel.characterLimit;
    if (characterLimit !== undefined) {
      <label
        style={styles.counter}
        marginBottom={this.getVerticalPadding()}
        value={Math.max(0, characterLimit - state.value.length).toString()}
      />;
    }
  }

  private onEditBegin = (e: EditTextBeginEvent): void => {
    this.setStateAnimated({ focused: true }, { duration: 0.1 });
    this.viewModel.onEditBegin?.(e);
  };

  private onEditEnd = (e: EditTextEndEvent): void => {
    this.setStateAnimated({ focused: false }, { duration: 0.1 });
    this.viewModel.onEditEnd?.(e);
  };

  private onChange = (e: EditTextEvent): void => {
    this.setState({ value: e.text });
    this.viewModel.onChange?.(e);
  };

  private onWillChange = (e: EditTextEvent): EditTextEvent | undefined => {
    return this.viewModel?.onWillChange?.(e);
  };

  private onTapBackground = (): void => {
    this.setFocused(true);
  };

  private getBackgroundColor(): SemanticColor {
    if (this.viewModel.focusedBackgroundColorOverride && this.state.focused) {
      return this.viewModel.focusedBackgroundColorOverride;
    }
    if (this.viewModel.unfocusedBackgroundColorOverride && !this.state.focused) {
      return this.viewModel.unfocusedBackgroundColorOverride;
    }
    return SemanticColor.Background.DISABLED;
  }

  private getVerticalPadding(): number {
    return this.viewModel.verticalPaddingOverride ?? SPECS_VERTICAL_PADDING;
  }

  private getHorizontalPadding(): number {
    return this.viewModel.horizontalPaddingOverride ?? SPECS_HORIZONTAL_PADDING;
  }
}

const styles = {
  background: new Style<View>({
    borderRadius: SPECS_BORDER_RADIUS,
  }),
  counter: new Style<Label>({
    color: SemanticColor.Text.TERTIARY,
    font: TextStyleFont.CAPTION,
    textAlign: 'right',
  }),
};
