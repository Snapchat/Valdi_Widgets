import { StatefulComponent } from 'valdi_core/src/Component';
import { Device } from 'valdi_core/src/Device';
import { Style } from 'valdi_core/src/Style';
import {
  EditTextEvent,
  View,
  Layout,
  TextField,
  EditTextBeginEvent,
  EditTextEndEvent,
} from 'valdi_tsx/src/NativeTemplateElements';
import res from 'widgets/res';
import { TextStyleFont } from 'widgets/src/styles/TextStyleFont';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { Spacing } from 'widgets/src/styles/spacing';
import { FocusableComponentRef } from '../util/FocusableComponentRef';
import { ScrollWithKeyboard } from './ScrollWithKeyboard';
import { TextFieldWrapper } from './TextFieldWrapper';

const BOX_MINHEIGHT = 38;

type TextFieldPassthroughAttributes =
  | 'accessibilityId'
  | 'color'
  | 'enabled'
  | 'placeholder'
  | 'placeholderColor'
  | 'onChange'
  | 'onWillChange'
  | 'onEditBegin'
  | 'onEditEnd'
  | 'returnKeyText'
  | 'autocapitalization'
  | 'autocorrection'
  | 'characterLimit'
  | 'contentType'
  | 'closesWhenReturnKeyPressed'
  | 'onReturn'
  | 'keyboardAppearance';

export type CoreTextFieldViewModel = CoreTextFieldSpecificViewModel & Pick<TextField, TextFieldPassthroughAttributes>;

interface CoreTextFieldSpecificViewModel {
  /**
   * Text contents of the text field
   */
  text?: string;

  /**
   * Use these to switch between the different preset styles and decorations,
   * based on the field being inactive, form validation state, etc.
   *
   * Additionally, you must set this to CoreTextFieldSpecialState.CustomAccessory
   * and use the 'custom-accessory' if you'd like to render custom contents in the
   * accessory slot on the trailing end of the textfield.
   */
  specialState?: CoreTextFieldSpecialState;

  /**
   * Override the background color of the textfield when unfocused
   */
  unfocusedBackgroundColorOverride?: SemanticColor;
  /**
   * Override the background color of the textfield when focused
   */
  focusedBackgroundColorOverride?: SemanticColor;

  /*
   * Override the font of the textfield
   */
  fontOverride?: string;

  /*
   * If true, the field will have no border
   */
  noBorder?: boolean;

  /**
   * Configures the auto-scrolling behaviour when the textfield becomes focused
   */
  scrollWithKeyboard?: ScrollWithKeyboard;

  /**
   * Shows clear button in right accessory container while editing and text is not empty
   */
  clearButtonEditing?: boolean;
}

export enum CoreTextFieldSpecialState {
  /** Default textfield */
  Default,
  /** Use CustomAccessory when you'd like to use the 'custom-accessory' slot */
  CustomAccessory,
  /** Textfield that cannot be interacted with. These cases should really be avoided 🙏 */
  Inactive,
  /** Textfield data is currently going through validation, displays a spinner */
  Validating,
  /** Textfield data has been validated, display a tick */
  Validated,
  /** Textfield data is invalid, display an exclamation mark */
  Errored,
}

interface InternalState {
  focused: boolean;
  text: string;
}

/**
 * CoreTextField is used for rendering user-interactable text fields
 * styled using Snapchat's standard guidelines.
 *
 * By default, it's a text field with rounded corners and a border. Based on the
 * specialState, this component may also render an accessory view near the trailing end
 * of the textfield (e.g. an exclamation mark when the textfield data is invalid).
 */
export class CoreTextField extends StatefulComponent<CoreTextFieldViewModel, InternalState> {
  state: InternalState = {
    focused: false,
    text: '',
  };

  private readonly textFieldWrapperRef = new FocusableComponentRef<TextFieldWrapper>();

  setFocused(value: boolean): void {
    this.textFieldWrapperRef.setFocused(value);
  }

  onViewModelUpdate(): void {
    if (this.viewModel?.text !== undefined) {
      this.setState({
        text: this.viewModel.text,
      });
    }
  }

  onRender(): void {
    const viewModel = this.viewModel ?? {};
    const state = this.state;
    const baseFont = TextStyleFont.BODY_EMPHASIS;
    <view
      style={styles.container}
      backgroundColor={this.getBackgroundColor()}
      borderWidth={this.getBorderWidth()}
      borderColor={this.getBorderColor()}
    >
      <TextFieldWrapper
        ref={this.textFieldWrapperRef}
        accessibilityId={viewModel.accessibilityId}
        value={state.text}
        enabled={!this.getIsInactive()}
        font={viewModel.fontOverride ?? baseFont}
        placeholder={viewModel.placeholder}
        color={viewModel.color ?? SemanticColor.Text.PRIMARY}
        placeholderColor={viewModel.placeholderColor ?? SemanticColor.Text.TERTIARY}
        flexGrow={1}
        tintColor={SemanticColor.Brand.SECONDARY}
        onEditBegin={this.onEditBegin}
        onEditEnd={this.onEditEnd}
        onChange={this.onChange}
        onWillChange={this.onWillChange}
        onReturn={viewModel.onReturn}
        returnKeyText={viewModel.returnKeyText}
        autocapitalization={viewModel.autocapitalization}
        autocorrection={viewModel.autocorrection}
        characterLimit={viewModel.characterLimit}
        contentType={viewModel.contentType}
        closesWhenReturnKeyPressed={viewModel.closesWhenReturnKeyPressed}
        scrollWithKeyboard={viewModel.scrollWithKeyboard}
        touchAreaExtension={Spacing.MD}
        keyboardAppearance={viewModel.keyboardAppearance}
      />
      <layout style={styles.rightContainer}>{this.renderAccessoryContents()}</layout>;
    </view>;
  }

  private renderAccessoryContents = (): void => {
    // clear button
    if (this.viewModel.clearButtonEditing && this.state.text && this.state.focused) {
      <layout style={styles.rightContainerItem}>
        <image src={res.iconClear} onTap={this.clearText} />;
      </layout>;
    }

    // accessory
    <layout style={styles.rightContainerItem}>{this.renderSpecialStateAccessory()}</layout>;
  };

  private renderSpecialStateAccessory = (): void => {
    switch (this.viewModel.specialState) {
      case CoreTextFieldSpecialState.Default:
      case CoreTextFieldSpecialState.Inactive:
        return;
      case CoreTextFieldSpecialState.Errored:
        <image src={res.iconError} />;
        break;
      case CoreTextFieldSpecialState.Validating:
        <spinner width={20} height={20} color={SemanticColor.Text.TERTIARY} />;
        break;
      case CoreTextFieldSpecialState.Validated:
        <image src={res.iconValidated} />;
        break;
      case CoreTextFieldSpecialState.CustomAccessory:
        <slot name='custom-accessory' />;
        break;
    }
  };

  private clearText = (): void => {
    this.setState({ text: '' });
    this.viewModel.onChange?.({
      text: '',
      selectionStart: 0,
      selectionEnd: 0,
    });
  };

  private getIsInactive(): boolean {
    return this.viewModel.specialState === CoreTextFieldSpecialState.Inactive || !(this.viewModel.enabled ?? true);
  }

  private getBackgroundColor(): SemanticColor {
    if (this.viewModel.focusedBackgroundColorOverride && this.state.focused) {
      return this.viewModel.focusedBackgroundColorOverride;
    }
    if (this.viewModel.unfocusedBackgroundColorOverride && !this.state.focused) {
      return this.viewModel.unfocusedBackgroundColorOverride;
    }

    if (this.getIsInactive()) {
      return SemanticColor.Background.DISABLED;
    }
    return SemanticColor.Background.SURFACE;
  }

  private getBorderWidth(): number {
    if (this.getIsInactive() || this.viewModel.noBorder) {
      return 0.0;
    }
    return 1.0 / Device.getDisplayScale();
  }

  private getBorderColor(): SemanticColor {
    if (this.viewModel.specialState === CoreTextFieldSpecialState.Errored) {
      return SemanticColor.Icon.ERROR;
    }

    return this.state.focused ? SemanticColor.Layout.INPUT_BORDER_FOCUSED : SemanticColor.Layout.INPUT_BORDER;
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
    this.setState({ text: e.text });
    this.viewModel.onChange?.(e);
  };

  private onWillChange = (e: EditTextEvent): EditTextEvent | undefined => {
    return this.viewModel?.onWillChange?.(e);
  };
}

const styles = {
  container: new Style<View>({
    minHeight: BOX_MINHEIGHT,
    paddingTop: 7,
    paddingBottom: 6,
    paddingLeft: Spacing.MD,
    paddingRight: Spacing.MD,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  }),
  rightContainer: new Style<Layout>({
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  }),
  rightContainerItem: new Style<Layout>({
    marginLeft: 8,
  }),
};
