import { Asset } from 'valdi_core/src/Asset';
import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import {
  EditTextEvent,
  TextFieldContentType,
  TextFieldKeyboardAppearance,
  TextFieldReturnKeyText,
  Label,
  View,
  Layout,
  ImageView,
  ScrollView,
  TextField,
  EditTextBeginEvent,
  EditTextEndEvent,
} from 'valdi_tsx/src/NativeTemplateElements';
import res from 'widgets/res';
import { TextStyleFont } from 'widgets/src/styles/TextStyleFont';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { Spacing } from 'widgets/src/styles/spacing';
import { ScrollViewHandler } from '../scroll/ScrollViewHandler';
import { FocusableComponentRef } from '../util/FocusableComponentRef';
import { ScrollWithKeyboard } from './ScrollWithKeyboard';
import { TextFieldWrapper } from './TextFieldWrapper';

const INPUT_ROOT_HEIGHT = 38;

const INPUT_DECORATION_SPACING_FULL = 10;
const INPUT_DECORATION_SPACING_HALF = INPUT_DECORATION_SPACING_FULL / 2;
const INPUT_DECORATION_SIZE = INPUT_ROOT_HEIGHT - INPUT_DECORATION_SPACING_FULL * 2;

const INPUT_CLEAR_PADDING = Spacing.SM;
const INPUT_CLEAR_SIZE = INPUT_ROOT_HEIGHT - INPUT_CLEAR_PADDING * 2;

type Status = 'filled' | 'focused' | 'disabled' | 'default';

interface StyleObject {
  root: Style<View>;
  inputField: Style<TextField>;
  inputClear: Style<ImageView>;
  decorationIcon: Style<ImageView>;
  decorationText: Style<Label>;
  pillItem: Style<View>;
  pillLabel: Style<Label>;
}

export interface PillTextFieldItem {
  label: string;
  highlighted?: boolean;
  onTap?: () => void;
}

export interface PillTextFieldViewModel {
  decorationIcon?: Asset | string;
  decorationText?: string;
  pills: PillTextFieldItem[];
  inputValue?: string;
  inputPlaceholder?: string;
  inputContentType?: TextFieldContentType;
  inputReturnKeyText?: TextFieldReturnKeyText;
  inputClosesWhenReturnKeyPressed?: boolean;
  onInputChange?: (event: EditTextEvent) => void;
  onInputEditBegin?: (event: EditTextBeginEvent) => void;
  onInputEditEnd?: (event: EditTextEndEvent) => void;
  onInputReturn?: (event: EditTextEvent) => void;
  onInputClear?: () => void;
  onInputWillDelete?: (event: EditTextEvent) => void;
  onInputWillChange?: (event: EditTextEvent) => EditTextEvent | undefined;
  keyboardAppearance?: TextFieldKeyboardAppearance;
  scrollWithKeyboard?: ScrollWithKeyboard;
  scrollViewHandler?: ScrollViewHandler;
  enabled?: boolean;
  formContainsError?: boolean;
}

interface PillTextFieldState {
  inputValue: string;
  status: string;
}

export class PillTextField extends StatefulComponent<PillTextFieldViewModel, PillTextFieldState> {
  state: PillTextFieldState = {
    inputValue: '',
    status: 'default',
  };

  private scrollViewHandler = new ScrollViewHandler();

  private textFieldWrapperRef = new FocusableComponentRef<TextFieldWrapper>();

  private inputFocused: boolean = false;

  setFocused(value: boolean): void {
    this.textFieldWrapperRef.setFocused(value);
  }

  onViewModelUpdate(): void {
    const { inputValue } = this.viewModel;
    if (inputValue !== undefined) {
      this.setState({ inputValue });
    }
  }

  chooseStyle(status: string): StyleObject {
    const styleMap: Record<string, StyleObject> = {
      filled: stateStyles.filled,
      focused: stateStyles.focused,
      disabled: stateStyles.disabled,
      default: stateStyles.default,
    };
    return styleMap[status];
  }

  onCreate(): void {
    const inputValueLength = this.viewModel.inputValue?.length || 0;
    if (this.viewModel.enabled === false && this.state.status !== 'disabled') {
      this.setState({
        status: 'disabled',
      });
      //if the form is already preloaded with a pre-set text or pills, set the state to filled
    } else if ((this.viewModel.pills.length > 0 || inputValueLength > 0) && this.state.status !== 'filled') {
      this.setState({
        status: 'filled',
      });
    }
  }

  onRender(): void {
    //used to reset the state to default when pills are being removed when the form isnt focused
    if (
      this.viewModel.enabled !== false &&
      this.viewModel.pills.length === 0 &&
      this.state.inputValue.length === 0 &&
      this.state.status !== 'default' &&
      !this.inputFocused
    ) {
      this.setState({ status: 'default' });
    }
    const currentStyle = this.chooseStyle(this.state.status);
    let containerStyle = this.viewModel.formContainsError ? errorStyle : currentStyle;
    containerStyle = containerStyle;

    <view style={containerStyle.root} onTap={this.onRootTap}>
      <layout style={styles.decorationRoot}>{this.onRenderDecoration()}</layout>
      <scroll style={styles.scroll} ref={this.getCurrentScrollViewHandler()}>
        <layout style={styles.pillRoot} onLayout={this.scrollToEndWhenTyping}>
          {this.onRenderPills()}
        </layout>
        <layout style={styles.inputRoot} onLayout={this.scrollToEndWhenTyping}>
          {this.onRenderTextInput()}
        </layout>
      </scroll>
    </view>;
  }

  private onRenderDecoration(): void {
    const currentStyle = this.chooseStyle(this.state.status);
    const viewModel = this.viewModel;
    const icon = viewModel.decorationIcon;
    const text = viewModel.decorationText;
    if (icon) {
      <image style={currentStyle.decorationIcon} src={icon} />;
    }
    if (text) {
      <label style={currentStyle.decorationText} value={text} />;
    }
  }

  private onRenderPills(): void {
    const currentStyle = this.chooseStyle(this.state.status);
    for (const pill of this.viewModel.pills) {
      <view
        style={currentStyle.pillItem}
        backgroundColor={pill.highlighted ? SemanticColor.Button.PRIMARY : undefined}
        onTap={pill.onTap}
      >
        <label
          style={currentStyle.pillLabel}
          color={pill.highlighted ? SemanticColor.Text.ON_PRIMARY_BUTTON : undefined}
          value={pill.label}
        />
      </view>;
    }
  }

  private onRenderTextInput(): void {
    const currentStyle = this.chooseStyle(this.state.status);
    const {
      inputPlaceholder,
      inputContentType,
      inputReturnKeyText,
      inputClosesWhenReturnKeyPressed,
      onInputReturn,
      onInputWillChange,
      keyboardAppearance,
      scrollWithKeyboard,
    } = this.viewModel;
    <layout style={styles.inputWrapper}>
      <TextFieldWrapper
        ref={this.textFieldWrapperRef}
        value={this.state.inputValue}
        placeholder={inputPlaceholder}
        contentType={inputContentType}
        returnKeyText={inputReturnKeyText}
        closesWhenReturnKeyPressed={inputClosesWhenReturnKeyPressed}
        style={currentStyle.inputField}
        width='100%'
        height='100%'
        onChange={this.onInputChange}
        onEditBegin={this.onInputEditBegin}
        onEditEnd={this.onInputEditEnd}
        onReturn={onInputReturn}
        onWillDelete={this.onInputWillDelete}
        onWillChange={onInputWillChange}
        keyboardAppearance={keyboardAppearance}
        scrollWithKeyboard={scrollWithKeyboard}
        tintColor={SemanticColor.Brand.SECONDARY}
        autocapitalization='none'
        autocorrection='none'
        enabled={this.viewModel.enabled}
      />
    </layout>;
    if (this.state.inputValue) {
      <image style={currentStyle.inputClear} onTap={this.onInputClear} />;
    }
  }

  private onRootTap = (): void => {
    this.doScrollToEnd();
    this.doFocusInput();
  };

  private onInputEditBegin = (event: EditTextBeginEvent): void => {
    this.doScrollToEnd();
    this.inputFocused = true;
    this.setState({
      status: 'focused',
    });
    this.viewModel.onInputEditBegin?.(event);
  };

  private onInputChange = (event: EditTextEvent): void => {
    this.doScrollToEnd();
    this.setState({ inputValue: event.text });
    this.viewModel.onInputChange?.(event);
  };

  private inputChangeEnd = (): void => {
    if (this.state.inputValue.length > 0 || this.viewModel.pills.length > 0) {
      this.setState({
        status: 'filled',
      });
    } else {
      this.setState({
        status: 'default',
      });
    }
  };

  private onInputEditEnd = (event: EditTextEndEvent): void => {
    this.inputChangeEnd();
    this.inputFocused = false;
    this.viewModel.onInputEditEnd?.(event);
  };

  private onInputClear = (): void => {
    this.setState({ inputValue: '' });
    this.viewModel.onInputChange?.({
      text: '',
      selectionStart: 0,
      selectionEnd: 0,
    });
    if (this.inputFocused !== true) {
      this.inputChangeEnd();
    }
    this.viewModel.onInputClear?.();
  };

  private onInputWillDelete = (event: EditTextEvent): void => {
    this.doScrollToEnd();
    this.viewModel.onInputWillDelete?.(event);
  };

  private scrollToEndWhenTyping = (): void => {
    if (this.inputFocused) {
      this.doScrollToEnd();
    }
  };

  private doFocusInput(): void {
    this.setFocused(true);
  }

  private doScrollToEnd(): void {
    this.getCurrentScrollViewHandler().scrollToClamped(Infinity, 0, false);
  }

  private getCurrentScrollViewHandler(): ScrollViewHandler {
    return this.viewModel.scrollViewHandler ?? this.scrollViewHandler;
  }
}

const styles = {
  /**
   * Box
   */
  root: new Style<View>({
    height: INPUT_ROOT_HEIGHT,
    borderRadius: '50%',
    borderWidth: 1,
    flexDirection: 'row',
    paddingLeft: INPUT_DECORATION_SPACING_HALF,
    paddingRight: INPUT_DECORATION_SPACING_HALF,
  }),
  /**
   * Decoration
   */
  decorationRoot: new Style<Layout>({
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: INPUT_DECORATION_SPACING_HALF,
  }),
  decorationIcon: new Style<ImageView>({
    marginLeft: INPUT_DECORATION_SPACING_HALF,
    marginRight: INPUT_DECORATION_SPACING_HALF,
    height: INPUT_DECORATION_SIZE,
    width: INPUT_DECORATION_SIZE,
  }),
  decorationText: new Style<Label>({
    marginLeft: INPUT_DECORATION_SPACING_HALF,
    marginRight: INPUT_DECORATION_SPACING_HALF,
    font: TextStyleFont.CAPTION,
  }),
  /**
   * Scrollable content
   */
  scroll: new Style<ScrollView>({
    horizontal: true,
    bounces: false,
    flexShrink: 1,
    flexGrow: 1,
    fadingEdgeLength: 20,
    touchAreaExtension: 10,
  }),
  /**
   * Pills
   */
  pillRoot: new Style<Layout>({
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  pillItem: new Style<View>({
    margin: Spacing.XS,
    paddingLeft: 10,
    paddingRight: 10,
    height: 28,
    touchAreaExtension: Spacing.XS,
    borderRadius: '50%',
    //boxShadow: `0 1 3 ${SemanticColor.Elevation.CELL_SHADOW}`, // Disabled for performance concerns
    justifyContent: 'center',
    alignItems: 'center',
  }),
  pillLabel: new Style<Label>({
    font: TextStyleFont.BODY,
  }),
  /**
   * Input
   */
  inputRoot: new Style<Layout>({
    flexGrow: 1,
    maxWidth: '100%',
    minWidth: '33%',
    paddingLeft: Spacing.XS,
    paddingRight: Spacing.SM,
    flexDirection: 'row',
  }),
  inputWrapper: new Style<Layout>({
    limitToViewport: false,
    flexGrow: 1,
    flexShrink: 1,
    paddingTop: 1,
  }),
  inputField: new Style<TextField>({
    font: TextStyleFont.BODY,
  }),
  inputClear: new Style<ImageView>({
    marginTop: INPUT_CLEAR_PADDING,
    marginBottom: INPUT_CLEAR_PADDING,
    marginLeft: INPUT_CLEAR_PADDING,
    height: INPUT_CLEAR_SIZE,
    width: INPUT_CLEAR_SIZE,
    src: res.iconClear,
    touchAreaExtension: 10,
    touchEnabled: true,
  }),
};

const oldSpecs = {
  root: styles.root.extend<View>({
    backgroundColor: SemanticColor.Background.DISABLED,
    borderWidth: 0,
  }),
  inputField: styles.inputField.extend<TextField>({
    font: TextStyleFont.BODY_EMPHASIS,
    color: SemanticColor.Text.PRIMARY,
    placeholderColor: SemanticColor.Text.SECONDARY,
  }),
  inputClear: styles.inputClear.extend<ImageView>({
    tint: SemanticColor.Text.SECONDARY,
  }),
  decorationIcon: styles.decorationIcon.extend<ImageView>({
    tint: SemanticColor.Text.PRIMARY,
  }),
  decorationText: styles.decorationText.extend<Label>({
    font: TextStyleFont.BODY_EMPHASIS,
    color: SemanticColor.Text.SECONDARY,
  }),
  pillItem: styles.pillItem.extend<View>({
    backgroundColor: SemanticColor.Background.MAIN,
  }),
  pillLabel: styles.pillLabel.extend<Label>({
    font: TextStyleFont.CAPTION_EMPHASIS,
    color: SemanticColor.Text.PRIMARY,
  }),
};

const errorStyle = {
  root: styles.root.extend<View>({
    backgroundColor: SemanticColor.Form.BACKGROUND_ERROR,
    borderColor: SemanticColor.Form.BORDER_ERROR,
  }),
};

const stateStyles: Record<Status, StyleObject> = {
  default: {
    root: styles.root.extend<View>({
      backgroundColor: SemanticColor.Form.BACKGROUND_DEFAULT,
      borderColor: SemanticColor.Form.BORDER_DEFAULT,
    }),
    inputField: styles.inputField.extend<TextField>({
      color: SemanticColor.IconAndText.PRIMARY,
      placeholderColor: SemanticColor.IconAndText.SECONDARY,
    }),
    inputClear: styles.inputClear.extend<ImageView>({
      tint: SemanticColor.IconAndText.SECONDARY,
    }),
    decorationIcon: styles.decorationIcon.extend<ImageView>({
      tint: SemanticColor.IconAndText.SECONDARY,
    }),
    decorationText: styles.decorationText.extend<Label>({
      color: SemanticColor.IconAndText.PRIMARY,
    }),
    pillItem: styles.pillItem.extend<View>({
      backgroundColor: SemanticColor.Button.SECONDARY_FILL,
    }),
    pillLabel: styles.pillLabel.extend<Label>({
      color: SemanticColor.Text.PRIMARY,
    }),
  },

  filled: {
    root: styles.root.extend<View>({
      backgroundColor: SemanticColor.Form.BACKGROUND_DEFAULT,
      borderColor: SemanticColor.Form.BORDER_DEFAULT,
    }),
    inputField: styles.inputField.extend<TextField>({
      color: SemanticColor.IconAndText.PRIMARY,
    }),
    inputClear: styles.inputClear.extend<ImageView>({
      tint: SemanticColor.IconAndText.PRIMARY,
    }),
    decorationIcon: styles.decorationIcon.extend<ImageView>({
      tint: SemanticColor.IconAndText.PRIMARY,
    }),
    decorationText: styles.decorationText.extend<Label>({
      color: SemanticColor.IconAndText.PRIMARY,
    }),
    pillItem: styles.pillItem.extend<View>({
      backgroundColor: SemanticColor.Button.SECONDARY_FILL,
    }),
    pillLabel: styles.pillLabel.extend<Label>({
      color: SemanticColor.Text.PRIMARY,
    }),
  },
  focused: {
    root: styles.root.extend<View>({
      backgroundColor: SemanticColor.Form.BACKGROUND_FOCUSED,
      borderColor: SemanticColor.Form.BORDER_FOCUSED,
    }),
    inputField: styles.inputField.extend<TextField>({
      color: SemanticColor.IconAndText.PRIMARY,
    }),
    inputClear: styles.inputClear.extend<ImageView>({
      tint: SemanticColor.IconAndText.PRIMARY,
    }),
    decorationIcon: styles.decorationIcon.extend<ImageView>({
      tint: SemanticColor.IconAndText.PRIMARY,
    }),
    decorationText: styles.decorationText.extend<Label>({
      color: SemanticColor.IconAndText.PRIMARY,
    }),
    pillItem: styles.pillItem.extend<View>({
      backgroundColor: SemanticColor.Button.SECONDARY_FILL,
    }),
    pillLabel: styles.pillLabel.extend<Label>({
      color: SemanticColor.Text.PRIMARY,
    }),
  },
  disabled: {
    root: styles.root.extend<View>({
      backgroundColor: SemanticColor.Form.BACKGROUND_DISABLED,
      borderColor: SemanticColor.Form.BORDER_DISABLED,
    }),
    inputField: styles.inputField.extend<TextField>({
      color: SemanticColor.Form.INPUT_DISABLED,
      placeholderColor: SemanticColor.Form.INPUT_DISABLED,
    }),
    inputClear: styles.inputClear.extend<ImageView>({
      tint: SemanticColor.IconAndText.DISABLED,
    }),
    decorationIcon: styles.decorationIcon.extend<ImageView>({
      tint: SemanticColor.IconAndText.DISABLED,
    }),
    decorationText: styles.decorationText.extend<Label>({
      color: SemanticColor.Form.INPUT_DISABLED,
    }),
    pillItem: styles.pillItem.extend<View>({
      backgroundColor: SemanticColor.Button.SECONDARY_FILL,
    }),
    pillLabel: styles.pillLabel.extend<Label>({
      color: SemanticColor.IconAndText.DISABLED,
    }),
  },
};
