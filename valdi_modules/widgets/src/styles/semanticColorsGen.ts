import { AppColorPalette } from 'widgets/src/ColorSpec';

export type SemanticColor = keyof AppColorPalette & string;

// See valdi_core/src/ColorSpec.ts for the actual color values
// Use these as your color values and the Valdi runtime will apply the right
// RGB value based on the device's current UI style.
export namespace SemanticColor {
  export namespace Form {
    export const BACKGROUND_FOCUSED: SemanticColor = 'formBackgroundFocused';
    export const BACKGROUND_DISABLED: SemanticColor = 'formBackgroundDisabled';
    export const BACKGROUND_DEFAULT: SemanticColor = 'formBackgroundDefault';
    export const BORDER_ERROR: SemanticColor = 'formBorderError';
    export const BORDER_FOCUSED: SemanticColor = 'formBorderFocused';
    export const BORDER_DEFAULT: SemanticColor = 'formBorderDefault';
    export const BACKGROUND_ERROR: SemanticColor = 'formBackgroundError';
    export const BORDER_DISABLED: SemanticColor = 'formBorderDisabled';
    export const INPUT_DISABLED: SemanticColor = 'formInputDisabled';
  }
  export namespace IconAndText {
    export const PRIMARY: SemanticColor = 'iconAndTextPrimary';
    export const SECONDARY: SemanticColor = 'iconAndTextSecondary';
    export const TERTIARY: SemanticColor = 'iconAndTextTertiary';
    export const LINK: SemanticColor = 'iconAndTextLink';
    export const SELECTED: SemanticColor = 'iconAndTextSelected';
    export const DISABLED: SemanticColor = 'iconAndTextDisabled';
    export const SUCCESS: SemanticColor = 'iconAndTextSuccess';
    export const WARNING: SemanticColor = 'iconAndTextWarning';
    export const BADGE_OR_MESSAGE_BAR: SemanticColor = 'iconAndTextBadgeOrMessageBar';
    export const BADGE_SECONDARY: SemanticColor = 'iconAndTextBadgeSecondary';
    export const ERROR: SemanticColor = 'iconAndTextError';
    export const ON_PRIMARY_BRAND_BUTTON: SemanticColor = 'iconAndTextOnPrimaryBrandButton';
    export const ON_PRIMARY_NEUTRAL_BUTTON: SemanticColor = 'iconAndTextOnPrimaryNeutralButton';
  }
  export namespace Content {
    export const PRIMARY: SemanticColor = 'contentPrimary';
    export const SECONDARY: SemanticColor = 'contentSecondary';
    export const TERTIARY: SemanticColor = 'contentTertiary';
    export const DISABLED: SemanticColor = 'contentDisabled';
    export const ERROR: SemanticColor = 'contentError';
  }
  export namespace Button {
    export const PRIMARY_BRAND_FILL: SemanticColor = 'buttonPrimaryBrandFill';
    export const PRIMARY_NEUTRAL_FILL: SemanticColor = 'buttonPrimaryNeutralFill';
    export const PRIMARY_FILL_NEGATIVE: SemanticColor = 'buttonPrimaryFillNegative';
    export const PRIMARY_FILL_DISABLED: SemanticColor = 'buttonPrimaryFillDisabled';
    export const SECONDARY_FILL: SemanticColor = 'buttonSecondaryFill';
  }
  export namespace RadioCheckToggle {
    export const NORMAL_FILL: SemanticColor = 'radioCheckToggleNormalFill';
    export const SELECTED_FILL: SemanticColor = 'radioCheckToggleSelectedFill';
    export const NORMAL_STROKE: SemanticColor = 'radioCheckToggleNormalStroke';
    export const TOGGLE_NORMAL_FILL: SemanticColor = 'radioCheckToggleToggleNormalFill';
    export const TOGGLE_SELECTED_FILL: SemanticColor = 'radioCheckToggleToggleSelectedFill';
    export const SELECTED_INDICATOR: SemanticColor = 'radioCheckToggleSelectedIndicator';
  }
  export namespace Notification {
    export const BADGE_PRIMARY: SemanticColor = 'notificationBadgePrimary';
    export const BADGE_SECONDARY: SemanticColor = 'notificationBadgeSecondary';
    export const MESSAGE_BAR_DEFAULT: SemanticColor = 'notificationMessageBarDefault';
    export const MESSAGE_BAR_INFO: SemanticColor = 'notificationMessageBarInfo';
    export const MESSAGE_BAR_ERROR: SemanticColor = 'notificationMessageBarError';
  }

  export namespace Flat {
    export const PURE_BLACK: SemanticColor = 'flatPureBlack';
    export const PURE_WHITE: SemanticColor = 'flatPureWhite';
    export const CLEAR: SemanticColor = 'flatClear';
  }
  
  export namespace Base {
    export const OFF_BLACK: SemanticColor = 'baseOffBlack';
    export const FADED_BLACK: SemanticColor = 'baseFadedBlack';
    export const GRAY100: SemanticColor = 'baseGray100';
    export const GRAY90: SemanticColor = 'baseGray90';
    export const GRAY80: SemanticColor = 'baseGray80';
    export const GRAY70: SemanticColor = 'baseGray70';
    export const GRAY60: SemanticColor = 'baseGray60';
    export const GRAY50: SemanticColor = 'baseGray50';
    export const GRAY40: SemanticColor = 'baseGray40';
    export const GRAY30: SemanticColor = 'baseGray30';
    export const GRAY20: SemanticColor = 'baseGray20';
    export const GRAY10: SemanticColor = 'baseGray10';
    export const BLUE_DARK: SemanticColor = 'baseBlueDark';
    export const BLUE_MEDIUM: SemanticColor = 'baseBlueMedium';
    export const BLUE_REGULAR: SemanticColor = 'baseBlueRegular';
    export const BLUE_LIGHT: SemanticColor = 'baseBlueLight';
    export const PURPLE_DARK: SemanticColor = 'basePurpleDark';
    export const PURPLE_MEDIUM: SemanticColor = 'basePurpleMedium';
    export const PURPLE_REGULAR: SemanticColor = 'basePurpleRegular';
    export const PURPLE_LIGHT: SemanticColor = 'basePurpleLight';
    export const RED_DARK: SemanticColor = 'baseRedDark';
    export const RED_MEDIUM: SemanticColor = 'baseRedMedium';
    export const RED_REGULAR: SemanticColor = 'baseRedRegular';
    export const RED_LIGHT: SemanticColor = 'baseRedLight';
    export const GREEN_DARK: SemanticColor = 'baseGreenDark';
    export const GREEN_MEDIUM: SemanticColor = 'baseGreenMedium';
    export const GREEN_REGULAR: SemanticColor = 'baseGreenRegular';
    export const GREEN_LIGHT: SemanticColor = 'baseGreenLight';
    export const ORANGE_DARK: SemanticColor = 'baseOrangeDark';
    export const ORANGE_MEDIUM: SemanticColor = 'baseOrangeMedium';
    export const ORANGE_REGULAR: SemanticColor = 'baseOrangeRegular';
    export const ORANGE_LIGHT: SemanticColor = 'baseOrangeLight';
    export const YELLOW_DARK: SemanticColor = 'baseYellowDark';
    export const YELLOW_MEDIUM: SemanticColor = 'baseYellowMedium';
    export const YELLOW_REGULAR: SemanticColor = 'baseYellowRegular';
    export const YELLOW_LIGHT: SemanticColor = 'baseYellowLight';
    export const SUCCESS_GREEN: SemanticColor = 'baseSuccessGreen';
    export const APP_YELLOW: SemanticColor = 'baseAppYellow';
    export const BRAND_YELLOW: SemanticColor = 'baseBrandYellow';
  }
  export namespace Brand {
    export const PRIMARY: SemanticColor = 'brandPrimary';
    export const SECONDARY: SemanticColor = 'brandSecondary';
  }
  export namespace Background {
    export const DEFAULT: SemanticColor = 'backgroundDefault';
    export const MAIN: SemanticColor = 'backgroundMain';
    export const SUBSCREEN: SemanticColor = 'backgroundSubscreen';
    export const SURFACE: SemanticColor = 'backgroundSurface';
    export const SURFACE_THEMED: SemanticColor = 'backgroundSurfaceThemed';
    export const SURFACE_TRANSLUCENT: SemanticColor = 'backgroundSurfaceTranslucent';
    export const SURFACE_DOWN: SemanticColor = 'backgroundSurfaceDown';
    export const ABOVE_SURFACE: SemanticColor = 'backgroundAboveSurface';
    export const TOP_SURFACE: SemanticColor = 'backgroundTopSurface';
    export const DISABLED: SemanticColor = 'backgroundDisabled';
    export const OBJECT: SemanticColor = 'backgroundObject';
    export const OBJECT_DOWN: SemanticColor = 'backgroundObjectDown';
    export const OVERLAY: SemanticColor = 'backgroundOverlay';
    export const SURFACE_MAIN_WITH_CONTAINER: SemanticColor = 'backgroundSurfaceMainWithContainer';
    export const SURFACE_CONTAINER: SemanticColor = 'backgroundSurfaceContainer';
    export const SURFACE_BORDER: SemanticColor = 'backgroundSurfaceBorder';
    export const SURFACE_HEADER_OVERLAY: SemanticColor = 'backgroundSurfaceHeaderOverlay';
    export const SECONDARY: SemanticColor = 'backgroundSecondary';
  }
  export namespace Text {
    export const PRIMARY: SemanticColor = 'textPrimary';
    export const SECONDARY: SemanticColor = 'textSecondary';
    export const TERTIARY: SemanticColor = 'textTertiary';
    export const SELECTED: SemanticColor = 'textSelected';
    export const NEGATIVE: SemanticColor = 'textNegative';
    export const LINK: SemanticColor = 'textLink';
    export const PLAYER: SemanticColor = 'textPlayer';
    export const ON_PRIMARY_BUTTON: SemanticColor = 'textOnPrimaryButton';
    export const ON_SECONDARY_BUTTON: SemanticColor = 'textOnSecondaryButton';
    export const ON_TERTIARY_BUTTON: SemanticColor = 'textOnTertiaryButton';
    export const ON_QUATERNARY_BUTTON: SemanticColor = 'textOnQuaternaryButton';
    export const ON_INACTIVE_BUTTON: SemanticColor = 'textOnInactiveButton';
    export const ON_PRIMARY_BRAND_FILL_BUTTON: SemanticColor = 'textOnPrimaryBrandFillButton';
  }
  export namespace Button {
    export const PRIMARY: SemanticColor = 'buttonPrimary';
    export const SECONDARY: SemanticColor = 'buttonSecondary';
    export const TERTIARY: SemanticColor = 'buttonTertiary';
    export const QUATERNARY: SemanticColor = 'buttonQuaternary';
    export const SELECTED: SemanticColor = 'buttonSelected';
    export const INACTIVE: SemanticColor = 'buttonInactive';
    export const NEGATIVE: SemanticColor = 'buttonNegative';
    export const TOGGLE_SELECTED_FILL: SemanticColor = 'buttonToggleSelectedFill';
    export const TOGGLE_OFF: SemanticColor = 'buttonToggleOff';
    export const SHARE_LIVE: SemanticColor = 'buttonShareLive';
    export const PRIMARY_THEMED: SemanticColor = 'buttonPrimaryThemed';
  }
  export namespace Icon {
    export const PRIMARY: SemanticColor = 'iconPrimary';
    export const SECONDARY: SemanticColor = 'iconSecondary';
    export const TERTIARY: SemanticColor = 'iconTertiary';
    export const TERTIARY_HIGH_CONTRAST_DARK_MODE: SemanticColor = 'iconTertiaryHighContrastDarkMode';
    export const SELECTED: SemanticColor = 'iconSelected';
    export const ERROR: SemanticColor = 'iconError';
    export const SUCCESS: SemanticColor = 'iconSuccess';
    export const STREAK_RESTORE: SemanticColor = 'iconStreakRestore';
  }
  export namespace Layout {
    export const INPUT_BORDER: SemanticColor = 'layoutInputBorder';
    export const INPUT_BORDER_FOCUSED: SemanticColor = 'layoutInputBorderFocused';
    export const DIVIDER: SemanticColor = 'layoutDivider';
    export const DIVIDER_THEMED: SemanticColor = 'layoutDividerThemed';
    export const PLACEHOLDER: SemanticColor = 'layoutPlaceholder';
  }
  export namespace Elevation {
    export const CELL_SHADOW: SemanticColor = 'elevationCellShadow';
    export const HEADER_SHADOW: SemanticColor = 'elevationHeaderShadow';
    export const FOOTER_SHADOW: SemanticColor = 'elevationFooterShadow';
    export const BORDER_BOTTOM: SemanticColor = 'elevationBorderBottom';
    export const BORDER_BOTTOM_SELECTED: SemanticColor = 'elevationBorderBottomSelected';
  }
}