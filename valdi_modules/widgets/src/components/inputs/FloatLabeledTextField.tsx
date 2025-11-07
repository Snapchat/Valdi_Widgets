import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import {
  EditTextEvent,
  Label,
  Layout,
  TextField,
  EditTextBeginEvent,
  EditTextEndEvent,
} from 'valdi_tsx/src/NativeTemplateElements';
import { TextStyleFont } from 'widgets/src/styles/TextStyleFont';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { Spacing } from 'widgets/src/styles/spacing';
import { FocusableComponentRef } from '../util/FocusableComponentRef';
import { ScrollWithKeyboard } from './ScrollWithKeyboard';
import { TextFieldWrapper } from './TextFieldWrapper';

type TextFieldPassthroughAttributes =
  | 'accessibilityId'
  | 'accessibilityLabel'
  | 'returnKeyText'
  | 'autocapitalization'
  | 'autocorrection'
  | 'characterLimit'
  | 'contentType'
  | 'enabled'
  | 'placeholder';

export interface FloatLabeledTextFieldSpecificViewModel {
  title: string;
  text?: string;
  error?: string;
  onEditBegin?: (e: EditTextBeginEvent) => void;
  onEditEnd?: (e: EditTextEndEvent) => void;
  onChange?: (e: EditTextEvent) => void;
  onWillChange?: (e: EditTextEvent) => EditTextEvent | undefined;
  scrollWithKeyboard?: ScrollWithKeyboard;
}

export type FloatLabeledTextFieldViewModel = FloatLabeledTextFieldSpecificViewModel &
  Pick<TextField, TextFieldPassthroughAttributes>;

interface FloatLabeledTextFieldState {
  focused: boolean;
  text: string;
}

export class FloatLabeledTextField extends StatefulComponent<
  FloatLabeledTextFieldViewModel,
  FloatLabeledTextFieldState
> {
  state: FloatLabeledTextFieldState = {
    focused: false,
    text: '',
  };

  private readonly textFieldWrapperRef = new FocusableComponentRef<TextFieldWrapper>();

  setFocused(value: boolean): void {
    this.textFieldWrapperRef.setFocused(value);
  }

  onViewModelUpdate(): void {
    const { text } = this.viewModel;
    if (text !== undefined) {
      this.setState({ text });
    }
  }

  onRender(): void {
    const viewModel = this.viewModel;
    const state = this.state;
    const active = state.focused || state.text.length > 0;
    const error = viewModel.error;
    const titleText = error ? error : viewModel.title;
    const titleColor = this.computeTitleColor();
    const activeFadeIn = active ? 1 : 0;
    const activeFadeOut = active ? 0 : 1;
    <layout style={styles.rootContainer}>
      <layout style={styles.rootPaddedZone}>
        <view style={styles.overlayContainer} onTap={this.onTapSetFocus}>
          <label opacity={activeFadeOut} style={styles.overlayLabel} value={titleText} color={titleColor} />
        </view>
        <layout style={styles.fieldsContainer}>
          <label
            opacity={activeFadeIn}
            style={styles.fieldsTitle}
            value={titleText}
            color={titleColor}
            onTap={this.onTapSetFocus}
          />
          <layout height={1} />
          <layout style={styles.container}>
            <TextFieldWrapper
              flexGrow={1}
              opacity={activeFadeIn}
              ref={this.textFieldWrapperRef}
              value={state.text}
              style={styles.fieldsInput}
              onEditBegin={this.onEditBegin}
              onChange={this.onChange}
              onWillChange={this.onWillChange}
              onEditEnd={this.onEditEnd}
              accessibilityId={viewModel.accessibilityId}
              accessibilityLabel={viewModel.accessibilityLabel}
              returnKeyText={viewModel.returnKeyText}
              autocapitalization={viewModel.autocapitalization}
              autocorrection={viewModel.autocorrection}
              characterLimit={viewModel.characterLimit}
              contentType={viewModel.contentType}
              enabled={viewModel.enabled}
              scrollWithKeyboard={viewModel.scrollWithKeyboard}
            />
            <slot name='custom-accessory' />
          </layout>
        </layout>
      </layout>
    </layout>;
  }

  private onEditBegin = (e: EditTextBeginEvent): void => {
    this.setStateAnimated({ focused: true }, { duration: 0.2 });
    this.viewModel.onEditBegin?.(e);
  };

  private onEditEnd = (e: EditTextEndEvent): void => {
    this.setStateAnimated({ focused: false }, { duration: 0.2 });
    this.viewModel.onEditEnd?.(e);
  };

  private onChange = (e: EditTextEvent): void => {
    this.setState({ text: e.text });
    this.viewModel.onChange?.(e);
  };

  private onWillChange = (e: EditTextEvent): EditTextEvent | undefined => {
    return this.viewModel?.onWillChange?.(e);
  };

  private computeTitleColor(): SemanticColor | undefined {
    if (this.state.focused) {
      return SemanticColor.Text.SELECTED;
    }
    if (this.viewModel.error) {
      return SemanticColor.Text.NEGATIVE;
    }
    return SemanticColor.Text.TERTIARY;
  }

  private onTapSetFocus = (): void => {
    this.setFocused(true);
  };
}

/*
 * Typography and design is not standard for this usecase.
 * Since different designs for different page have slightly different values,
 * Here we will hardcode fonts and sizes to match designs on a best-effort basis
 */

const TITLE_FONT = TextStyleFont.CAPTION_EMPHASIS;
const INPUT_FONT = TextStyleFont.BODY_EMPHASIS;

const styles = {
  rootContainer: new Style<Layout>({
    flexGrow: 1,
    flexShrink: 1,
  }),
  rootPaddedZone: new Style<Layout>({
    marginTop: Spacing.XS,
    marginBottom: Spacing.XS,
    marginLeft: Spacing.MD,
    marginRight: Spacing.MD,
  }),
  overlayContainer: new Style<Layout>({
    position: 'absolute',
    width: '100%',
    height: '100%',
  }),
  overlayLabel: new Style<Label>({
    font: INPUT_FONT,
    flexGrow: 1,
  }),
  fieldsContainer: new Style<Layout>({
    paddingTop: Spacing.XXS,
    paddingBottom: Spacing.XXS,
  }),
  fieldsTitle: new Style<Label>({
    font: TITLE_FONT,
  }),
  fieldsInput: new Style<TextField>({
    font: INPUT_FONT,
    color: SemanticColor.Text.PRIMARY,
  }),
  container: new Style<Layout>({
    flexDirection: 'row',
    justifyContent: 'space-between',
  }),
};
