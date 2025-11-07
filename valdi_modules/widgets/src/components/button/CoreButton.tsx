import { Asset } from 'valdi_core/src/Asset';
import { StatefulComponent } from 'valdi_core/src/Component';
import { Device } from 'valdi_core/src/Device';
import { ElementRef } from 'valdi_core/src/ElementRef';
import { Style } from 'valdi_core/src/Style';
import { View } from 'valdi_tsx/src/NativeTemplateElements';
import { isCustomTheme } from 'widgets/src/InitSemanticColors';
import { TextStyleFont, TextStyleFontNonDynamic } from 'widgets/src/styles/TextStyleFont';
import { SemanticColor } from 'widgets/src/styles/semanticColors';

/**
 * Button layout standard types
 */
export enum CoreButtonSizing {
  // Used for call to actions, primary buttons
  XL = 'XL',
  // Used for alert buttons
  LARGE = 'large',
  // Used for chat buttons
  MEDIUM = 'medium',
  // Used as pill in cells like for adding friends
  SMALL = 'small',
  // Used in section headers
  TINY = 'tiny',
}

/**
 * Button width standard values
 */
export enum CoreButtonWidths {
  // Extra large fixed button width
  FIXED_XL_212 = '212',
  // Large fixed button width
  FIXED_LARGE_184 = '184',
  // Medium fixed button taking all row space
  FIXED_MEDIUM_EXTENDED = '100%',
  // Small fixed button taking all row space
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  FIXED_SMALL_EXTENDED = '100%',
  // Small dynamic button have a min-size
  DYNAMIC_SMALL_MINIMUM = '64',
}

/**
 * Standard button color schemas
 * can be overriden manually by dev when needed
 * should be responsible for all coloring of the button
 */
export enum CoreButtonColoring {
  // No background, black text (for backward compatibility)
  DEFAULT = 'default',
  // Blue background, white text
  PRIMARY = 'primary',
  // Light gray background, black text
  SECONDARY = 'secondary',
  // Dark gray background, white text
  TERTIARY = 'tertiary',
  // Medium gray background, white text
  INACTIVE = 'inactive',
  // Yellow background, black text
  BRANDED = 'branded',
}

export interface CoreButtonViewModel {
  /**
   * Button layout
   */
  sizing?: CoreButtonSizing;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  borderWidth?: string | number;
  opacity?: number;
  scaleX?: number;
  scaleY?: number;
  /**
   * Button contents
   */
  icon?: Asset | string;
  text?: string;
  loading?: boolean;
  disabled?: boolean;
  /**
   * Button tints
   */
  coloring?: CoreButtonColoring; // Prefer using this when possible
  foregroundColor?: SemanticColor; // override when needed
  backgroundColor?: SemanticColor; // override when needed
  iconColor?: SemanticColor;
  background?: string; // optional
  borderColor?: SemanticColor; // override when needed
  disableShadow?: boolean; // optionally disable shadow
  /**
   * Button interactions
   */
  onTap?: () => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
  /**
   * Should the icon automatically flip in RTL?
   */
  iconFlipRtl?: boolean;
  /**
   * Icon Rotation
   */
  iconRotation?: number;
  /**
   * Use icon asset width and height rather than from button sizing
   */
  iconRespectSize?: boolean;
  /**
   * Use icon asset color rather than from button style
   */
  iconRespectColoring?: boolean;
  /**
   * Override rendering width / height of inner icon
   */
  iconOverrideWidth?: number;
  iconOverrideHeight?: number;
  /**
   * Configure if we allow the text to span multiple line when content is too big
   */
  textNumberOfLines?: number;
  /**
   * Optionally configure whether or not to allow the font size to be adjusted based on the
   * width of the button.
   */
  textAdjustsFontSizeToFitWidth?: boolean;
  /**
   * Optionally configure the minimum scale factor when automatically adjusting the font size
   * to fit the width of the button
   */
  textMinimumScaleFactor?: number;
  /**
   * Make the button easier to tap
   */
  touchAreaExtension?: number;
  /**
   * Optionally remove side padding for circular buttons
   */
  circular?: boolean;
  /**
   * Optionally render the text before the icon
   */
  reverse?: boolean;
  /**
   * Optionally we can enable/disable the standard touch animation (ON by default)
   */
  touchAnimated?: boolean;
  /**
   * Accessibility tags
   */
  accessibilityId?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /**
   * On iOS we automatically add a background to the label and icon to optimize layer blending
   * This can be disabled in some cases like when the background color is partially transparent to avoid visual glitches
   */
  disableBlendingBackground?: boolean;

  /**
   * Optional config. If true, the size of the button will stretch to be the size of the super view.
   */
  flexGrowEnabled?: boolean;

  /**
   * Optionally set filterTouchesWhenObscured for payment sensitive button on Android.
   * It's not used for iOS.
   *
   * https://developer.android.com/reference/android/view/View#setFilterTouchesWhenObscured(boolean)
   */
  filterTouchesWhenObscured?: boolean;

  /*
   * Optional. If true, disables accessibility font scaling
   */
  disableAccessibilityFontScaling?: boolean;
}

interface CoreButtonStateField {
}

/**
 *  - Handle different sizing and coloring cases
 *  - Handle cases with and without icon/text
 *  - Handle cases when displaying a loading indicator (depending of icon/text state)
 */
export class CoreButton extends StatefulComponent<CoreButtonViewModel, CoreButtonStateField> {
  state: CoreButtonStateField = {};
  readonly root = new ElementRef<View>();

  // Used to keep track of transient state between `onTouchStart` and `onTouchEnd`
  private touched: boolean = false;

  onRender(): void {
    const viewModel = this.viewModel ?? {};

    const icon = viewModel.icon;
    const text = viewModel.text;
    const loading = viewModel.loading;
    const disabled = viewModel.disabled;
    const onTap = viewModel.onTap;

    let coloring = colorings[viewModel.coloring ?? CoreButtonColoring.DEFAULT];

    const foregroundColor = viewModel.foregroundColor ?? coloring.foreground;
    const iconColor = viewModel.iconColor;
    const backgroundColor = viewModel.backgroundColor ?? coloring.background;
    const background = viewModel.background;
    const borderColor = viewModel.borderColor ?? coloring.border;
    const disableShadow = this.viewModel.disableShadow ?? false;

    const width = viewModel.width;
    const minWidth = viewModel.minWidth;
    const maxWidth = viewModel.maxWidth;

    const opacity = viewModel.opacity;
    const scaleX = viewModel.scaleX;
    const scaleY = viewModel.scaleY;

    const flipOnRtl = viewModel.iconFlipRtl ?? true;
    const iconRotation = viewModel.iconRotation ?? undefined;
    const iconRespectSize = viewModel.iconRespectSize ?? false;
    const iconRespectColoring = viewModel.iconRespectColoring ?? false;
    const textNumberOfLines = viewModel.textNumberOfLines ?? 2;
    const adjustsFontSizeToFitWidth = viewModel.textAdjustsFontSizeToFitWidth;
    const minimumScaleFactor = viewModel.textMinimumScaleFactor;
    const touchAreaExtension = viewModel.touchAreaExtension;
    const circular = viewModel.circular ?? false;
    const flexDirection = viewModel.reverse ? 'row-reverse' : 'row';
    const accessibilityId = viewModel.accessibilityId;
    const accessibilityLabel = viewModel.accessibilityLabel;
    const accessibilityHint = viewModel.accessibilityHint;
    const iconOverrideHeight = viewModel.iconOverrideHeight;
    const iconOverrideWidth = viewModel.iconOverrideWidth;

    const sizing = viewModel.sizing ?? CoreButtonSizing.SMALL;
    const sizingOption = sizingOptions[sizing];
    const minHeight = sizingOption.minHeight;
    const iconSize = sizingOption.icon;
    const iconHeightAsset = icon && typeof icon !== 'string' && iconRespectSize ? icon.height : iconOverrideHeight;
    const iconWidthAsset = icon && typeof icon !== 'string' && iconRespectSize ? icon.width : iconOverrideWidth;
    const iconHeight = iconHeightAsset ?? iconSize;
    const iconWidth = iconWidthAsset ?? iconSize;
    const spinnerSize = sizingOption.spinner;
    const sidesSize = sizingOption.sides;
    const separatorSize = sizingOption.separator;
    const verticalPad = sizingOption.verticalPad;
    const textFont = viewModel.disableAccessibilityFontScaling ? sizingOption.nonDynamicFont : sizingOption.font;
    const borderWidth = viewModel.borderWidth ?? sizingOption.border;

    const rootRadius = minHeight / 2;
    const rootPadding = minHeight / 2 - iconSize / 2;

    const blendingColor = this.shouldUseBlendingColor() ? backgroundColor : undefined;
    const flexGrowEnabled = this.viewModel.flexGrowEnabled ?? false;
    const filterTouchesWhenObscured = this.viewModel.filterTouchesWhenObscured ?? false;
    <view
      ref={this.root}
      onTap={disabled ? undefined : onTap}
      onTouchStart={disabled ? undefined : this.onTouchStart}
      onTouchEnd={this.onTouchEnd}
      onTouchDelayDuration={0.05}
      touchAreaExtension={touchAreaExtension}
      backgroundColor={backgroundColor}
      background={background}
      minHeight={minHeight}
      width={width}
      minWidth={minWidth}
      maxWidth={maxWidth}
      paddingLeft={rootPadding}
      paddingRight={rootPadding}
      opacity={opacity}
      scaleX={scaleX}
      scaleY={scaleY}
      borderRadius={rootRadius}
      style={flexGrowEnabled ? styleFlexGrow : styleRootBase}
      border={borderColor ? `${borderWidth} solid ${borderColor}` : undefined}
      boxShadow={backgroundColor && !disableShadow ? sizingOption.shadow : undefined}
      accessibilityId={accessibilityId}
      accessibilityLabel={accessibilityLabel ?? text}
      accessibilityHint={accessibilityHint}
      accessibilityStateDisabled={disabled}
      flexDirection={flexDirection}
      filterTouchesWhenObscured={filterTouchesWhenObscured}
    >
      {(() => {
        if (!circular) {
          if (icon && text) {
            <layout width={sidesSize - separatorSize} />;
          } else {
            <layout width={sidesSize} />;
          }
        }
        if (icon) {
          if (loading) {
            const spinnerPadding = (iconWidth - spinnerSize) / 2;
            <layout paddingLeft={spinnerPadding} paddingRight={spinnerPadding}>
              <spinner
                color={foregroundColor}
                height={spinnerSize}
                width={spinnerSize}
                backgroundColor={blendingColor}
              />
            </layout>;
          } else {
            const marginHorizontal = (iconSize - iconWidth) / 2;
            const marginVertical = (iconSize - iconHeight) / 2;
            <image
              src={icon}
              tint={iconRespectColoring ? undefined : iconColor ?? foregroundColor}
              height={iconHeight}
              width={iconWidth}
              marginLeft={marginHorizontal}
              marginRight={marginHorizontal}
              marginTop={marginVertical}
              marginBottom={marginVertical}
              flipOnRtl={flipOnRtl}
              backgroundColor={blendingColor}
              rotation={iconRotation}
            />;
          }
        }
        if (!icon) {
          if (loading) {
            <layout
              position='absolute'
              top={0}
              left={0}
              bottom={0}
              right={0}
              alignItems='center'
              alignContent='center'
              justifyContent='center'
            >
              <spinner
                color={foregroundColor}
                height={spinnerSize}
                width={spinnerSize}
                backgroundColor={blendingColor}
              />
            </layout>;
          }
        }
        if (text) {
          <slot name='start' />;
          if (icon) {
            <layout width={separatorSize} />;
          }
          const verticalBumper = verticalPad;
          const textAlign = !icon ? 'center' : undefined;
          <label
            value={text}
            font={textFont}
            color={foregroundColor}
            opacity={loading && !icon ? 0 : 1}
            backgroundColor={blendingColor}
            flexShrink={1}
            marginTop={verticalBumper}
            marginBottom={verticalBumper}
            textAlign={textAlign}
            numberOfLines={textNumberOfLines}
            adjustsFontSizeToFitWidth={adjustsFontSizeToFitWidth}
            minimumScaleFactor={minimumScaleFactor}
          />;
        }
        // End Slot: optional slot to display an additional view at the end of the button
        <slot name='end' />;
        if (!circular) {
          <layout width={sidesSize} />;
        }
      })()}
    </view>;
  }

  private onTouchStart = (): void => {
    const touchAnimated = this.viewModel.touchAnimated;
    if (touchAnimated ?? true) {
      this.onTouchAnim(true);
    }
    const onTouchStart = this.viewModel.onTouchStart;
    if (onTouchStart) {
      onTouchStart();
    }
    this.touched = true;
  };
  private onTouchEnd = (): void => {
    if (!this.touched) {
      return;
    }
    this.touched = false;
    this.onTouchAnim(false);
    const onTouchEnd = this.viewModel.onTouchEnd;
    if (onTouchEnd) {
      onTouchEnd();
    }
  };
  private onTouchAnim(enabled: boolean): void {
    const root = this.root.single();
    if (root) {
      const baseScaleY = this.viewModel.scaleY ?? 1;
      const baseScaleX = this.viewModel.scaleX ?? 1;
      this.renderer.animate({ duration: enabled ? 0.05 : 0.1 }, () => {
        root.setAttribute('scaleY', enabled ? baseScaleY * 0.8 : baseScaleY);
        root.setAttribute('scaleX', enabled ? baseScaleX * 0.8 : baseScaleX);
        root.setAttribute('translationY', enabled ? 1 : 0);
      });
    }
  }

  private shouldUseBlendingColor(): boolean {
    // On iOS, we can speed up rendering by reducing blending
    // by adding a background color that matches the button's background
    // on the button's label, image and spinner
    // Don't apply blending color for custom themes. Since there is an alpha layer
    // on themed colors this will create a darker themed color around the blended area.
    if (Device.isIOS() && !isCustomTheme()) {
      const { circular, disableBlendingBackground } = this.viewModel;
      if (!circular && !disableBlendingBackground) {
        return true;
      }
    }
    // On Android however, this simply increases overdraw and is detrimental
    return false;
  }
}

/**
 * Constants
 */
const colorings = {
  [CoreButtonColoring.DEFAULT]: {
    foreground: SemanticColor.Text.PRIMARY,
    background: undefined,
    border: undefined,
  },
  [CoreButtonColoring.PRIMARY]: {
    foreground: SemanticColor.Text.ON_PRIMARY_BUTTON,
    background: SemanticColor.Button.PRIMARY,
    border: undefined,
  },
  [CoreButtonColoring.SECONDARY]: {
    foreground: SemanticColor.Text.ON_SECONDARY_BUTTON,
    background: SemanticColor.Button.SECONDARY,
    border: undefined,
  },
  [CoreButtonColoring.TERTIARY]: {
    foreground: SemanticColor.Text.ON_TERTIARY_BUTTON,
    background: SemanticColor.Button.TERTIARY,
    border: undefined,
  },
  [CoreButtonColoring.INACTIVE]: {
    foreground: SemanticColor.Text.ON_INACTIVE_BUTTON,
    background: SemanticColor.Button.INACTIVE,
    border: undefined,
  },
  [CoreButtonColoring.BRANDED]: {
    foreground: SemanticColor.Base.FADED_BLACK,
    background: SemanticColor.Base.BRAND_YELLOW,
    border: undefined,
  },
};

export const sizingOptions = {
  [CoreButtonSizing.XL]: {
    minHeight: 52,
    icon: 32,
    spinner: 24,
    border: 4,
    sides: 22,
    separator: 10,
    font: TextStyleFont.HEADLINE,
    nonDynamicFont: TextStyleFontNonDynamic.HEADLINE,
    verticalPad: 12,
    shadow: `0 3 8 ${SemanticColor.Elevation.CELL_SHADOW}`,
  },
  [CoreButtonSizing.LARGE]: {
    minHeight: 44,
    icon: 28,
    spinner: 24,
    border: 4,
    sides: 16,
    separator: 8,
    font: TextStyleFont.SUBHEADLINE_EMPHASIS,
    nonDynamicFont: TextStyleFontNonDynamic.SUBHEADLINE_EMPHASIS,
    verticalPad: 10,
    shadow: `0 3 8 ${SemanticColor.Elevation.CELL_SHADOW}`,
  },
  [CoreButtonSizing.MEDIUM]: {
    minHeight: 36,
    icon: 24,
    spinner: 16,
    border: 3,
    sides: 14,
    separator: 6,
    font: TextStyleFont.SUBHEADLINE_EMPHASIS,
    nonDynamicFont: TextStyleFontNonDynamic.SUBHEADLINE_EMPHASIS,
    verticalPad: 8,
    shadow: undefined,
  },
  [CoreButtonSizing.SMALL]: {
    minHeight: 32,
    icon: 24,
    spinner: 16,
    border: 2,
    sides: 14,
    separator: 6,
    font: TextStyleFont.SUBHEADLINE_EMPHASIS,
    nonDynamicFont: TextStyleFontNonDynamic.SUBHEADLINE_EMPHASIS,
    verticalPad: 6,
    shadow: undefined,
  },
  [CoreButtonSizing.TINY]: {
    minHeight: 28,
    icon: 16,
    spinner: 12,
    border: 2,
    sides: 8,
    separator: 4,
    font: TextStyleFont.CAPTION_EMPHASIS,
    nonDynamicFont: TextStyleFontNonDynamic.CAPTION_EMPHASIS,
    verticalPad: 4,
    shadow: undefined,
  },
};

const styleRootBase = new Style<View>({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  accessibilityCategory: 'button',
});

const styleFlexGrow = new Style<View>({
  flexDirection: 'row',
  alignItems: 'center',
  flexGrow: 1,
  justifyContent: 'center',
  accessibilityCategory: 'button',
});
