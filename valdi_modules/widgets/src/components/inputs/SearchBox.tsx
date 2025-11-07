import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { ImageView, Layout, TextField, View } from 'valdi_tsx/src/NativeTemplateElements';
import res from 'widgets/res';
import { Theme } from 'widgets/src/Theme';
import { FocusableComponentRef } from 'widgets/src/components/util/FocusableComponentRef';
import { TextStyleFont } from 'widgets/src/styles/TextStyleFont';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { Spacing } from 'widgets/src/styles/spacing';
import { ScrollWithKeyboard } from './ScrollWithKeyboard';
import { TextFieldWrapper } from './TextFieldWrapper';

export const SEARCH_BOX_HEIGHT = 38;

type Status = 'filled' | 'focused' | 'disabled' | 'default';

interface StyleObject {
  container: Style<View>;
  textfield: Style<TextField>;
  iconClear: Style<ImageView>;
  iconMagnifyingGlass: Style<ImageView>;
}

interface SearchBoxContext {
  themeType?: Theme.Type;
}

export interface SearchBoxViewModel {
  placeholder?: string;
  inputValue?: string;

  selectTextOnFocus?: boolean;

  onChange?: (event: { value: string }) => void;
  onResetQuery?: () => void;

  onEditBegin?: () => void;
  onEditEnd?: () => void;
  onTextFieldChange?: (text: string) => void;
  onReturn?: () => void;

  enabled?: boolean;
  formContainsError?: boolean;

  textfieldAccessibilityId?: string;

  backgroundColor?: SemanticColor;
  iconColor?: SemanticColor;
  textColor?: SemanticColor;
  placeholderColor?: SemanticColor;
  clearButtonColor?: SemanticColor;
  keyboardAppearance?: TextField['keyboardAppearance'];

  scrollWithKeyboard?: ScrollWithKeyboard;
}

interface SearchBoxState {
  inputValue: string;
  status: string;
}

export class SearchBox extends StatefulComponent<SearchBoxViewModel, SearchBoxState, SearchBoxContext> {
  state: SearchBoxState = {
    inputValue: '',
    status: 'default',
  };

  private readonly textFieldHandler = new FocusableComponentRef<TextFieldWrapper>();
  private readonly theme = Theme.from(this.context.themeType);

  private readonly errorStyle = {
    container: baseStyles.container.extend<View>({
      backgroundColor: this.applyThemeToColor(SemanticColor.Form.BACKGROUND_ERROR),
      borderColor: this.applyThemeToColor(SemanticColor.Form.BORDER_ERROR),
    }),
  };

  private readonly uiSpecs = {
    container: baseStyles.container.extend<View>({
      backgroundColor: this.applyThemeToColor(SemanticColor.Background.OBJECT),
      borderWidth: 0,
    }),

    textfield: baseStyles.textfield.extend<TextField>({
      font: TextStyleFont.BODY_EMPHASIS,
      color: this.applyThemeToColor(SemanticColor.Text.PRIMARY),
      placeholderColor: this.applyThemeToColor(SemanticColor.Text.SECONDARY),
    }),

    iconClear: baseStyles.iconClear.extend<ImageView>({
      tint: this.applyThemeToColor(SemanticColor.Text.SECONDARY),
    }),

    iconMagnifyingGlass: baseStyles.iconMagnifyingGlass.extend<ImageView>({
      tint: this.applyThemeToColor(SemanticColor.Text.PRIMARY),
      height: 17.8,
      width: 17.8,
    }),
  };

  private readonly stateStyles: Record<Status, StyleObject> = {
    default: {
      container: baseStyles.container.extend<View>({
        backgroundColor: this.applyThemeToColor(SemanticColor.Form.BACKGROUND_DEFAULT),
        borderColor: this.applyThemeToColor(SemanticColor.Form.BORDER_DEFAULT),
      }),
      textfield: baseStyles.textfield.extend<TextField>({
        color: this.applyThemeToColor(SemanticColor.IconAndText.PRIMARY),
        placeholderColor: this.applyThemeToColor(SemanticColor.IconAndText.SECONDARY),
      }),
      iconClear: baseStyles.iconClear.extend<ImageView>({
        tint: this.applyThemeToColor(SemanticColor.IconAndText.SECONDARY),
      }),
      iconMagnifyingGlass: baseStyles.iconMagnifyingGlass.extend<ImageView>({
        tint: this.applyThemeToColor(SemanticColor.IconAndText.SECONDARY),
      }),
    },

    filled: {
      container: baseStyles.container.extend<View>({
        backgroundColor: this.applyThemeToColor(SemanticColor.Form.BACKGROUND_DEFAULT),
        borderColor: this.applyThemeToColor(SemanticColor.Form.BORDER_DEFAULT),
      }),
      textfield: baseStyles.textfield.extend<TextField>({
        color: this.applyThemeToColor(SemanticColor.IconAndText.PRIMARY),
      }),
      iconClear: baseStyles.iconClear.extend<ImageView>({
        tint: this.applyThemeToColor(SemanticColor.IconAndText.PRIMARY),
      }),
      iconMagnifyingGlass: baseStyles.iconMagnifyingGlass.extend<ImageView>({
        tint: this.applyThemeToColor(SemanticColor.IconAndText.PRIMARY),
      }),
    },
    focused: {
      container: baseStyles.container.extend<View>({
        backgroundColor: this.applyThemeToColor(SemanticColor.Form.BACKGROUND_FOCUSED),
        borderColor: this.applyThemeToColor(SemanticColor.Form.BORDER_FOCUSED),
      }),
      textfield: baseStyles.textfield.extend<TextField>({
        color: this.applyThemeToColor(SemanticColor.IconAndText.PRIMARY),
      }),
      iconClear: baseStyles.iconClear.extend<ImageView>({
        tint: this.applyThemeToColor(SemanticColor.IconAndText.PRIMARY),
      }),
      iconMagnifyingGlass: baseStyles.iconMagnifyingGlass.extend<ImageView>({
        tint: this.applyThemeToColor(SemanticColor.IconAndText.PRIMARY),
      }),
    },
    disabled: {
      container: baseStyles.container.extend<View>({
        backgroundColor: this.applyThemeToColor(SemanticColor.Form.BACKGROUND_DISABLED),
        borderColor: this.applyThemeToColor(SemanticColor.Form.BORDER_DISABLED),
      }),
      textfield: baseStyles.textfield.extend<TextField>({
        color: this.applyThemeToColor(SemanticColor.Form.INPUT_DISABLED),
        placeholderColor: this.applyThemeToColor(SemanticColor.Form.INPUT_DISABLED),
      }),
      iconClear: baseStyles.iconClear.extend<ImageView>({
        tint: this.applyThemeToColor(SemanticColor.Form.INPUT_DISABLED),
      }),
      iconMagnifyingGlass: baseStyles.iconMagnifyingGlass.extend<ImageView>({
        tint: this.applyThemeToColor(SemanticColor.Form.INPUT_DISABLED),
      }),
    },
  };

  applyThemeToColor(color: SemanticColor | undefined): SemanticColor | undefined {
    if (color === undefined) return undefined;
    return this.theme.applyTo(color);
  }

  setFocused(focused: boolean): void {
    this.textFieldHandler.setFocused(focused);
  }

  setText(value: string, focused: boolean): void {
    this.renderer.batchUpdates(() => {
      this.textFieldHandler.setFocused(focused);
      this.setState({ inputValue: value });
    });

    const { onChange } = this.viewModel;
    if (onChange) {
      onChange({ value });
    }
  }

  onViewModelUpdate(): void {
    const { inputValue } = this.viewModel;
    if (inputValue !== undefined) {
      this.setState({ inputValue });
    }
  }

  chooseStyle(status: string): StyleObject {
    const styleMap: Record<string, StyleObject> = {
      filled: this.stateStyles.filled,
      focused: this.stateStyles.focused,
      disabled: this.stateStyles.disabled,
      default: this.stateStyles.default,
    };
    return styleMap[status];
  }

  onCreate(): void {
    const inputValueLength = this.viewModel.inputValue?.length || 0;
    if (inputValueLength > 0 && this.state.status !== 'filled') {
      this.setState({
        status: 'filled',
      });
    }
  }

  onRender(): void {
    if (this.viewModel.enabled === false && this.state.status !== 'disabled') {
      this.setState({
        status: 'disabled',
      });
    }

    const selectTextOnFocus = this.viewModel?.selectTextOnFocus ?? true;
    const placeholder = this.viewModel?.placeholder;

    const currentStyle = this.chooseStyle(this.state.status);
    const magnifyingGlassIcon = res.iconMagnifyingGlass;
    let containerStyle = this.viewModel.formContainsError ? this.errorStyle.container : currentStyle.container;
    containerStyle = this.uiSpecs.container;

    <view
      accessibilityId='search-box'
      id='searchBox'
      style={containerStyle}
      backgroundColor={this.viewModel.backgroundColor}
    >
      <layout style={baseStyles.accessoryLeft}>
        <image
          style={currentStyle.iconMagnifyingGlass}
          src={magnifyingGlassIcon}
          tint={this.applyThemeToColor(this.viewModel.iconColor)}
        />
      </layout>
      <layout style={baseStyles.textfieldContainer}>
        <TextFieldWrapper
          ref={this.textFieldHandler}
          id='textField'
          style={currentStyle.textfield}
          closesWhenReturnKeyPressed={true}
          returnKeyText='search'
          selectTextOnFocus={selectTextOnFocus}
          onChange={this.onTextFieldChange}
          onReturn={this.viewModel.onReturn}
          placeholder={placeholder}
          autocapitalization='none'
          autocorrection='none'
          accessibilityId={this.viewModel.textfieldAccessibilityId ?? 'search-textfield'}
          onEditBegin={this.onEditBegin}
          onEditEnd={this.onEditEnd}
          color={this.applyThemeToColor(this.viewModel.textColor)}
          placeholderColor={this.applyThemeToColor(this.viewModel.placeholderColor)}
          keyboardAppearance={this.viewModel.keyboardAppearance}
          value={this.state.inputValue}
          tintColor={this.applyThemeToColor(SemanticColor.Brand.SECONDARY)}
          scrollWithKeyboard={this.viewModel.scrollWithKeyboard}
          enabled={this.viewModel.enabled}
        />
      </layout>
      {this.onRenderRightAccessory()}
    </view>;
  }

  private onRenderRightAccessory(): void {
    const currentStyle = this.chooseStyle(this.state.status);
    if (this.state.inputValue) {
      <view
        accessibilityId='clear-button'
        style={baseStyles.accessoryRight}
        onTap={this.onTapResetQuery}
        accessibilityCategory='image-button'
      >
        <image
          style={currentStyle.iconClear}
          src={res.iconClear}
          tint={this.applyThemeToColor(this.viewModel.clearButtonColor)}
        />
      </view>;
    } else {
      <layout style={baseStyles.accessoryRight}>
        <slot />
      </layout>;
    }
  }

  private onTapResetQuery = (): void => {
    this.setText('', true);

    const { onResetQuery } = this.viewModel;
    if (onResetQuery) {
      onResetQuery();
    }
  };

  private onTextFieldChange = ({ text }: { text: string }): void => {
    this.viewModel.onTextFieldChange?.(text);
    this.setState({ inputValue: text });

    const { onChange } = this.viewModel;
    if (onChange) {
      onChange({ value: text });
    }
  };

  private onEditBegin = (): void => {
    this.setState({
      status: 'focused',
    });
    if (this.viewModel?.onEditBegin) {
      this.viewModel.onEditBegin();
    }
  };

  private onEditEnd = (): void => {
    if (this.state.inputValue.length !== 0) {
      this.setState({
        status: 'filled',
      });
    } else {
      this.setState({
        status: 'default',
      });
    }
    if (this.viewModel?.onEditEnd) {
      this.viewModel.onEditEnd();
    }
  };
}

const accessory = new Style<Layout>({
  flexGrow: 0,
  alignItems: 'center',
  justifyContent: 'center',
  width: SEARCH_BOX_HEIGHT,
  height: SEARCH_BOX_HEIGHT,
});

const baseStyles = {
  container: new Style<View>({
    flexDirection: 'row',
    alignItems: 'center',
    height: SEARCH_BOX_HEIGHT,
    borderRadius: '50%',
    borderWidth: 1,
  }),

  textfieldContainer: new Style<Layout>({
    paddingTop: 1,
    flexGrow: 1,
    flexShrink: 1,
    height: '100%',
  }),

  textfield: new Style<TextField>({
    font: TextStyleFont.BODY,
    touchAreaExtension: Spacing.MD,
    flexGrow: 1,
    flexShrink: 1,
  }),

  accessoryLeft: accessory.extend(
    new Style<Layout>({
      marginLeft: Spacing.XS,
    }),
  ),
  accessoryRight: accessory.extend(
    new Style<Layout>({
      marginRight: Spacing.XS,
    }),
  ),

  iconClear: new Style<ImageView>({
    height: 20,
    width: 20,
  }),

  iconMagnifyingGlass: new Style<ImageView>({
    // NOTE: pixel values do not obey grid in an effort to conform with native search controls
    height: 20,
    width: 20,
  }),
};
