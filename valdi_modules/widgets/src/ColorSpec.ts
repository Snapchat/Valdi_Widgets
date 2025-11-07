import { ColorPalette } from "valdi_core/src/ValdiRuntime";

type SemanticColorValue = { tag?: 'SemanticColorValue' } & string;

export const ThemeLight = 'light';
export const ThemeDark = 'dark';
export const ThemeMidnight = 'midnight';

const anyPalette = {
  // Form
  formBorderError: '#DC2E4B',
  // IconAndText
  iconAndTextSuccess: '#018850',
  iconAndTextWarning: '#D03C01',
  iconAndTextBadgeOrMessageBar: '#FFFFFF',
  iconAndTextBadgeSecondary: '#000000',
  iconAndTextOnPrimaryBrandButton: '#000000',
  // Content
  contentPrimary: '#FFFFFF',
  contentSecondary: 'rgba(255, 255, 255, 0.75)',
  contentTertiary: 'rgba(255, 255, 255, 0.62)',
  contentDisabled: 'rgba(255, 255, 255, 0.62)',
  contentError: '#ED4964',
  // Button
  buttonPrimaryBrandFill: '#FFFC00',
  buttonPrimaryFillNegative: '#DC2E4B',
  // RadioCheckToggle
  radioCheckToggleToggleSelectedFill: '#39CA8E',
  // Notification
  notificationBadgePrimary: '#0FADFF',
  notificationBadgeSecondary: '#FFFC00',
  // Flat
  flatPureBlack: '#000000',
  flatPureWhite: '#FFFFFF',
  flatClear: 'rgba(0, 0, 0, 0)',
  // Base
  baseOffBlack: '#16191C',
  baseFadedBlack: '#2C3137',
  baseGray100: '#434A54',
  baseGray90: '#4E565F',
  baseGray80: '#656D78',
  baseGray70: '#9A9FA7',
  baseGray60: '#AEB6BD',
  baseGray50: '#B9C0C7',
  baseGray40: '#CED4DA',
  baseGray30: '#DFE3E7',
  baseGray20: '#EAEDEF',
  baseGray10: '#F7F8F9',
  baseBlueDark: '#0096E5',
  baseBlueMedium: '#049EEE',
  baseBlueRegular: '#0FADFF',
  baseBlueLight: '#61C9FF',
  basePurpleDark: '#8936B6',
  basePurpleMedium: '#9043BE',
  basePurpleRegular: '#A05DCD',
  basePurpleLight: '#C195DE',
  baseRedDark: '#D80030',
  baseRedMedium: '#E1143D',
  baseRedRegular: '#F23C57',
  baseRedLight: '#F77F91',
  baseGreenDark: '#00A179',
  baseGreenMedium: '#00A881',
  baseGreenRegular: '#02B790',
  baseGreenLight: '#59D0B6',
  baseOrangeDark: '#E57200',
  baseOrangeMedium: '#EE7A00',
  baseOrangeRegular: '#FF8A00',
  baseOrangeLight: '#FFB257',
  baseYellowDark: '#E5C100',
  baseYellowMedium: '#EEC813',
  baseYellowRegular: '#FFD838',
  baseYellowLight: '#FFE67C',
  baseSuccessGreen: '#29BD49',
  baseBitmojiGreen: '#39CA8E',
  baseAppYellow: '#FFE300',
  baseBrandYellow: '#FFFC00',
  // Brand
  brandPrimary: '#0FADFF',
  brandSecondary: '#A05DCD',
};

const lightPalette: AppColorPalette = {
  ...anyPalette,
  // Form
  formBackgroundFocused: '#FFFFFF',
  formBackgroundDisabled: '#FFFFFF',
  formBackgroundDefault: '#FFFFFF',
  formBorderFocused: '#9A9B9D',
  formBorderDefault: '#E1E3E5',
  formBackgroundError: '#FFFFFF',
  formBorderDisabled: '#E1E3E5',
  formInputDisabled: '#C3C5C7',
  // IconAndText
  iconAndTextPrimary: '#000000',
  iconAndTextSecondary: '#646567',
  iconAndTextTertiary: '#9A9B9D',
  iconAndTextLink: '#0FADFF',
  iconAndTextSelected: '#0FADFF',
  iconAndTextDisabled: '#9A9B9D',
  iconAndTextError: '#C2243E',
  iconAndTextOnPrimaryNeutralButton: '#FFFFFF',
  // Button
  buttonPrimaryNeutralFill: '#444546',
  buttonPrimaryFillDisabled: '#B0B1B2',
  buttonSecondaryFill: '#EDEEEF',
  // RadioCheckToggle
  radioCheckToggleNormalFill: '#FFFFFF',
  radioCheckToggleSelectedFill: '#0FADFF',
  radioCheckToggleNormalStroke: '#9A9B9D',
  radioCheckToggleToggleNormalFill: '#E1E3E5',
  radioCheckToggleSelectedIndicator: '#FFFFFF',
  // Background
  backgroundDefault: '#EDEEEF',
  backgroundMain: '#FFFFFF',
  backgroundSubscreen: '#F7F8F9',
  backgroundSurface: '#FFFFFF',
  backgroundSurfaceThemed: '#FFFFFF',
  backgroundSurfaceTranslucent: 'rgba(255, 255, 255, 0.85)',
  backgroundSurfaceDown: '#E9E9E9',
  backgroundAboveSurface: '#FFFFFF',
  backgroundTopSurface: '#FFFFFF',
  backgroundDisabled: '#EAEDEF',
  backgroundObject: 'rgba(0, 0, 0, 0.05)',
  backgroundObjectDown: 'rgba(0, 0, 0, 0.1)',
  backgroundOverlay: 'rgba(0, 0, 0, 0.4)',
  backgroundSurfaceMainWithContainer: '#F9F9FA',
  backgroundSurfaceContainer: '#FFFFFF',
  backgroundSurfaceBorder: '#E1E3E5',
  backgroundSurfaceHeaderOverlay: 'rgba(255, 255, 255, 0.75)',
  backgroundSecondary: '#FFFFFF',
  // Text
  textPrimary: '#16191C',
  textSecondary: '#656D78',
  textTertiary: '#9A9FA7',
  textSelected: '#0FADFF',
  textNegative: '#F23C57',
  textLink: '#0FADFF',
  textPlayer: '#FFFFFF',
  textOnPrimaryButton: '#FFFFFF',
  textOnSecondaryButton: '#2C3137',
  textOnTertiaryButton: '#FFFFFF',
  textOnQuaternaryButton: '#FFFFFF',
  textOnInactiveButton: '#FFFFFF',
  // Button
  buttonPrimary: '#0FADFF',
  buttonSecondary: '#ECEFF1',
  buttonTertiary: '#4E565F',
  buttonQuaternary: '#4E565F',
  buttonSelected: '#B9C0C7',
  buttonInactive: '#B9C0C7',
  buttonNegative: '#E1143D',
  buttonToggleSelectedFill: '#39CA8E',
  buttonToggleOff: '#DFE3E7',
  buttonShareLive: '#49C28F',
  buttonPrimaryThemed: '#0FADFF',
  // Icon
  iconPrimary: '#2C3137',
  iconSecondary: '#4E565F',
  iconTertiary: '#B9C0C7',
  iconTertiaryHighContrastDarkMode: '#B9C0C7',
  iconSelected: '#0FADFF',
  iconError: '#F23C57',
  iconSuccess: '#29BD49',
  iconStreakRestore: '#F46326',
  // Layout
  layoutInputBorder: '#B9C0C7',
  layoutInputBorderFocused: '#4E565F',
  layoutDivider: '#EEEEEE',
  layoutDividerThemed: '#EEEEEE',
  layoutPlaceholder: '#F1F2F4',
  // Elevation
  elevationCellShadow: 'rgba(0, 0, 0, 0.1)',
  elevationHeaderShadow: 'rgba(0, 0, 0, 0.1)',
  elevationFooterShadow: 'rgba(0, 0, 0, 0.1)',
  elevationBorderBottom: '#EEEEEE',
  elevationBorderBottomSelected: '#2C3137',
};

const darkPalette: AppColorPalette = {
  ...anyPalette,
  // Form
  formBackgroundFocused: '#131414',
  formBackgroundDisabled: '#131414',
  formBackgroundDefault: '#131414',
  formBorderFocused: '#B0B1B2',
  formBorderDefault: '#646567',
  formBackgroundError: '#131414',
  formBorderDisabled: '#2A2A2B',
  formInputDisabled: '#444546',
  // IconAndText
  iconAndTextPrimary: '#FFFFFF',
  iconAndTextSecondary: '#B0B1B2',
  iconAndTextTertiary: '#646567',
  iconAndTextLink: '#0894FA',
  iconAndTextSelected: '#FFFC00',
  iconAndTextDisabled: '#646567',
  iconAndTextError: '#ED4964',
  iconAndTextOnPrimaryNeutralButton: '#000000',
  // Button
  buttonPrimaryNeutralFill: '#FFFFFF',
  buttonPrimaryFillDisabled: '#444546',
  buttonSecondaryFill: '#363738',
  // RadioCheckToggle
  radioCheckToggleNormalFill: '#000000',
  radioCheckToggleSelectedFill: '#99DDFF',
  radioCheckToggleNormalStroke: '#545557',
  radioCheckToggleToggleNormalFill: '#363738',
  radioCheckToggleSelectedIndicator: '#000000',
  // Background
  backgroundDefault: '#2A2A2B',
  backgroundMain: '#121212',
  backgroundSubscreen: '#121212',
  backgroundSurface: '#1E1E1E',
  backgroundSurfaceThemed: '#1E1E1E',
  backgroundSurfaceTranslucent: 'rgba(30, 30, 30, 0.85)',
  backgroundSurfaceDown: '#212121',
  backgroundAboveSurface: '#292929',
  backgroundTopSurface: '#434A54',
  backgroundDisabled: 'rgba(255, 255, 255, 0.1)',
  backgroundObject: 'rgba(255, 255, 255, 0.1)',
  backgroundObjectDown: 'rgba(255, 255, 255, 0.2)',
  backgroundOverlay: 'rgba(0, 0, 0, 0.4)',
  backgroundSurfaceMainWithContainer: '#131414',
  backgroundSurfaceContainer: '#202122',
  backgroundSurfaceBorder: '#444546',
  backgroundSurfaceHeaderOverlay: 'rgba(0, 0, 0, 0.75)',
  backgroundSecondary: '#121212',
  // Text
  textPrimary: '#DEDEDE',
  textSecondary: '#999999',
  textTertiary: '#616161',
  textSelected: '#0FADFF',
  textNegative: '#F23C57',
  textLink: '#0FADFF',
  textPlayer: '#FFFFFF',
  textOnPrimaryButton: '#FFFFFF',
  textOnSecondaryButton: '#FFFFFF',
  textOnTertiaryButton: '#FFFFFF',
  textOnQuaternaryButton: '#1E1E1E',
  textOnInactiveButton: 'rgba(255, 255, 255, 0.3)',
  // Button
  buttonPrimary: '#0FADFF',
  buttonSecondary: '#2B2B2B',
  buttonTertiary: '#4E565F',
  buttonQuaternary: '#FFFFFF',
  buttonSelected: '#1E1E1E',
  buttonInactive: '#1E1E1E',
  buttonNegative: '#E1143D',
  buttonToggleSelectedFill: '#39CA8E',
  buttonToggleOff: '#515151',
  buttonShareLive: '#52C293',
  buttonPrimaryThemed: '#FFFC00',
  // Icon
  iconPrimary: '#DEDEDE',
  iconSecondary: '#999999',
  iconTertiary: '#616161',
  iconTertiaryHighContrastDarkMode: '#FFFFFF',
  iconSelected: '#0FADFF',
  iconError: '#F23C57',
  iconSuccess: '#29BD49',
  iconStreakRestore: '#F46326',
  // Layout
  layoutInputBorder: '#222222',
  layoutInputBorderFocused: '#999999',
  layoutDivider: 'rgba(255, 255, 255, 0.1)',
  layoutDividerThemed: 'rgba(255, 255, 255, 0.1)',
  layoutPlaceholder: '#1E1E1E',
  // Elevation
  elevationCellShadow: 'rgba(0, 0, 0, 0.1)',
  elevationHeaderShadow: 'rgba(0, 0, 0, 0.1)',
  elevationFooterShadow: 'rgba(0, 0, 0, 0.1)',
  elevationBorderBottom: 'rgba(255, 255, 255, 0.1)',
  elevationBorderBottomSelected: '#DEDEDE',
};

const midnightPalette: AppColorPalette = {
  ...darkPalette,
  // Form
  formBackgroundFocused: '#0D0636',
  formBackgroundDefault: '#0D0636',
  // Button
  buttonSecondaryFill: 'rgba(222, 236, 255, 0.2)',
  // RadioCheckToggle
  radioCheckToggleNormalFill: 'rgba(0, 0, 0, 0.8)',
  radioCheckToggleSelectedFill: '#A48DFF',
  // Notification
  notificationBadgePrimary: '#A48DFF',
  // Background
  backgroundSurfaceThemed: 'rgba(222, 236, 255, 0.1)',
  backgroundObject: '#0D0636',
  backgroundSecondary: '#1C1054',
  // Text
  textPrimary: '#FFFFFF',
  textTertiary: '#B0B1B2',
  textSelected: '#A48DFF',
  textPlayer: '#FFFFFF',
  textOnSecondaryButton: '#FFFFFF',
  textOnTertiaryButton: '#FFFFFF',
  // Button
  buttonPrimary: '#A48DFF',
  buttonSecondary: 'rgba(222, 236, 255, 0.2)',
  buttonSelected: 'rgba(222, 236, 255, 0.2)',
  buttonPrimaryThemed: '#A48DFF',
  // Icon
  iconPrimary: '#FFFFFF',
  iconTertiary: '#B0B1B2',
  iconSelected: '#A48DFF',
  // Layout
  layoutDividerThemed: 'rgba(0, 0, 0, 0)',
};

export interface AppColorPalette extends ColorPalette {
  // Form
  formBackgroundFocused: SemanticColorValue;
  formBackgroundDisabled: SemanticColorValue;
  formBackgroundDefault: SemanticColorValue;
  formBorderError: SemanticColorValue;
  formBorderFocused: SemanticColorValue;
  formBorderDefault: SemanticColorValue;
  formBackgroundError: SemanticColorValue;
  formBorderDisabled: SemanticColorValue;
  formInputDisabled: SemanticColorValue;
  // IconAndText
  iconAndTextPrimary: SemanticColorValue;
  iconAndTextSecondary: SemanticColorValue;
  iconAndTextTertiary: SemanticColorValue;
  iconAndTextLink: SemanticColorValue;
  iconAndTextSelected: SemanticColorValue;
  iconAndTextDisabled: SemanticColorValue;
  iconAndTextSuccess: SemanticColorValue;
  iconAndTextWarning: SemanticColorValue;
  iconAndTextBadgeOrMessageBar: SemanticColorValue;
  iconAndTextBadgeSecondary: SemanticColorValue;
  iconAndTextError: SemanticColorValue;
  iconAndTextOnPrimaryBrandButton: SemanticColorValue;
  iconAndTextOnPrimaryNeutralButton: SemanticColorValue;
  // Content
  contentPrimary: SemanticColorValue;
  contentSecondary: SemanticColorValue;
  contentTertiary: SemanticColorValue;
  contentDisabled: SemanticColorValue;
  contentError: SemanticColorValue;
  // Button
  buttonPrimaryBrandFill: SemanticColorValue;
  buttonPrimaryNeutralFill: SemanticColorValue;
  buttonPrimaryFillNegative: SemanticColorValue;
  buttonPrimaryFillDisabled: SemanticColorValue;
  buttonSecondaryFill: SemanticColorValue;
  // RadioCheckToggle
  radioCheckToggleNormalFill: SemanticColorValue;
  radioCheckToggleSelectedFill: SemanticColorValue;
  radioCheckToggleNormalStroke: SemanticColorValue;
  radioCheckToggleToggleNormalFill: SemanticColorValue;
  radioCheckToggleToggleSelectedFill: SemanticColorValue;
  radioCheckToggleSelectedIndicator: SemanticColorValue;
  // Base
  baseOffBlack: SemanticColorValue;
  baseFadedBlack: SemanticColorValue;
  baseGray100: SemanticColorValue;
  baseGray90: SemanticColorValue;
  baseGray80: SemanticColorValue;
  baseGray70: SemanticColorValue;
  baseGray60: SemanticColorValue;
  baseGray50: SemanticColorValue;
  baseGray40: SemanticColorValue;
  baseGray30: SemanticColorValue;
  baseGray20: SemanticColorValue;
  baseGray10: SemanticColorValue;
  baseBlueDark: SemanticColorValue;
  baseBlueMedium: SemanticColorValue;
  baseBlueRegular: SemanticColorValue;
  baseBlueLight: SemanticColorValue;
  basePurpleDark: SemanticColorValue;
  basePurpleMedium: SemanticColorValue;
  basePurpleRegular: SemanticColorValue;
  basePurpleLight: SemanticColorValue;
  baseRedDark: SemanticColorValue;
  baseRedMedium: SemanticColorValue;
  baseRedRegular: SemanticColorValue;
  baseRedLight: SemanticColorValue;
  baseGreenDark: SemanticColorValue;
  baseGreenMedium: SemanticColorValue;
  baseGreenRegular: SemanticColorValue;
  baseGreenLight: SemanticColorValue;
  baseOrangeDark: SemanticColorValue;
  baseOrangeMedium: SemanticColorValue;
  baseOrangeRegular: SemanticColorValue;
  baseOrangeLight: SemanticColorValue;
  baseYellowDark: SemanticColorValue;
  baseYellowMedium: SemanticColorValue;
  baseYellowRegular: SemanticColorValue;
  baseYellowLight: SemanticColorValue;
  baseSuccessGreen: SemanticColorValue;
  baseBitmojiGreen: SemanticColorValue;
  baseAppYellow: SemanticColorValue;
  baseBrandYellow: SemanticColorValue;
  // Brand
  brandPrimary: SemanticColorValue;
  brandSecondary: SemanticColorValue;
  // Icon
  iconPrimary: SemanticColorValue;
  iconSecondary: SemanticColorValue;
  iconTertiary: SemanticColorValue;
  iconTertiaryHighContrastDarkMode: SemanticColorValue;
  iconSelected: SemanticColorValue;
  iconError: SemanticColorValue;
  iconSuccess: SemanticColorValue;
  iconStreakRestore: SemanticColorValue;
  // Layout
  layoutInputBorder: SemanticColorValue;
  layoutInputBorderFocused: SemanticColorValue;
  layoutDivider: SemanticColorValue;
  layoutDividerThemed: SemanticColorValue;
  layoutPlaceholder: SemanticColorValue;
  // Elevation
  elevationCellShadow: SemanticColorValue;
  elevationHeaderShadow: SemanticColorValue;
  elevationFooterShadow: SemanticColorValue;
  elevationBorderBottom: SemanticColorValue;
  elevationBorderBottomSelected: SemanticColorValue;
}

export const LIGHT_PALETTE = lightPalette;
export const DARK_PALETTE = darkPalette;
export const MIDNIGHT_PALETTE = midnightPalette;

