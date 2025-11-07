import { Asset } from 'valdi_core/src/Asset';
import { ColorPalette, ValdiRuntime } from 'valdi_core/src/ValdiRuntime';
import { Device } from 'valdi_core/src/Device';
import { DeviceCancelable } from 'valdi_core/src/DeviceBridge';
import { getModuleLoader } from 'valdi_core/src/ModuleLoaderGlobal';
import res from 'widgets/res';
import {
  AppColorPalette,
  ThemeDark,
  ThemeLight,
  ThemeMidnight,
} from './ColorSpec';
import { SemanticColor } from './styles/semanticColorsGen';
import { DARK_PALETTE, LIGHT_PALETTE, MIDNIGHT_PALETTE } from './ColorSpec';

declare const runtime: ValdiRuntime;
declare const global: {
  currentPalette: ColorPalette;
  darkModeObserver: DeviceCancelable;
  theme: string;
};

function updateColorPalette(palette: ColorPalette): void {
  global.currentPalette = palette;
  runtime.setColorPalette(palette);
}

if (!global.currentPalette) {
  updateColorPalette(LIGHT_PALETTE);
}

/**
 *
 * @returns a map from semantic colors to their corresponding hex code values
 * based on environment factors such as whether the device is in Dark Mode or Light Mode.
 */
export const getCurrentPalette = (): ColorPalette => {
  return global.currentPalette;
};

export const forceColorPalette = (palette: ColorPalette): void => {
  updateColorPalette(palette);
};

// @ExportFunction({ios: 'SCInitializeSemanticColorsTheme', android: 'com.snap.valdi.InitializeSemanticColorsTheme'})
export function setTheme(theme: string, systemDarkModeEnabled: boolean): void {
  global.theme = theme;
  updateColorPalette(paletteFromTheme(theme, systemDarkModeEnabled));
}

export function isCustomTheme(): boolean {
  return Boolean(global.theme) && global.theme !== ThemeDark && global.theme !== ThemeLight;
}

export function isDarkBasedCustomTheme(): boolean {
  return isCustomTheme() && global.currentPalette.backgroundMain === DARK_PALETTE.backgroundMain;
}

function paletteFromTheme(theme: string, systemDarkModeEnabled: boolean): AppColorPalette {
  const systemThemePalette = systemDarkModeEnabled ? DARK_PALETTE : LIGHT_PALETTE;
  if (!theme) {
    return systemThemePalette;
  }
  const appTheme = THEMES[global.theme];
  return appTheme && appTheme.palette ? appTheme.palette : systemThemePalette;
}

export function themeBackgroundImage(): Asset | undefined {
  if (!global.theme) {
    return undefined;
  }
  return THEMES[global.theme] ? THEMES[global.theme].backgroundImage : undefined;
}

export function colorWithThemedOverride(
  color: SemanticColor | undefined,
  themedOverride: SemanticColor,
): SemanticColor | undefined {
  if (isCustomTheme()) {
    return themedOverride;
  }
  return color;
}

let alreadyInitializedObserver = false;
export function initializeSemanticColors(): void {
  if (alreadyInitializedObserver) {
    return;
  }
  alreadyInitializedObserver = true;
  if (global.darkModeObserver) {
    global.darkModeObserver.cancel();
  }
  getModuleLoader().onModuleRegistered('DeviceBridge', () => {
    global.darkModeObserver = Device.observeDarkMode((isDarkMode: boolean) => {
      if (global.theme) {
        updateColorPalette(paletteFromTheme(global.theme, isDarkMode));
        return;
      }
      const palette = isDarkMode ? DARK_PALETTE : LIGHT_PALETTE;
      if (global.currentPalette === palette) {
        return;
      }
      updateColorPalette(palette);
    });
  });
}

interface Theme {
  id: string;
palette: AppColorPalette;
  backgroundImage: Asset | undefined;
}

const THEMES: { [key: string]: Theme } = {
  [ThemeLight]: {
    id: ThemeLight,
    backgroundImage: undefined,
    palette: LIGHT_PALETTE,
  },
  [ThemeDark]: {
    id: ThemeDark,
    backgroundImage: undefined,
    palette: DARK_PALETTE,
  },
  [ThemeMidnight]: {
    id: ThemeMidnight,
    palette: MIDNIGHT_PALETTE,
    backgroundImage: undefined,
  },
};
