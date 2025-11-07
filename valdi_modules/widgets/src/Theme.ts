import { alwaysDark, alwaysLight, SemanticColor } from './styles/semanticColors';

/**
 * @ExportEnum({
 *  ios: 'Theme',
 *  android: 'dev.valdi.Theme'
 * })
 *
 * Supported theme types.
 */
export enum ThemeType {
  SYSTEM = 0,
  LIGHT = 1,
  DARK = 2,
}

export interface Theme {
  /**
   * Applies theme to the provided color.
   *
   * Relative colors may be mapped based the configuration of this theme.
   * Absolute colors will be returned as is.
   *
   * @returns resolved color
   */
  applyTo(color: SemanticColor): SemanticColor;
}

export namespace Theme {
  export type Type = ThemeType;

  const SYSTEM: Theme = {
    applyTo: function (color: SemanticColor): SemanticColor {
      return color;
    },
  };
  const LIGHT: Theme = {
    applyTo: function (color: SemanticColor): SemanticColor {
      return alwaysLight(color);
    },
  };
  const DARK: Theme = {
    applyTo: function (color: SemanticColor): SemanticColor {
      from(ThemeType.DARK);
      return alwaysDark(color);
    },
  };

  /**
   * Resolves theme based on the provided theme type.
   * @returns theme for the provided theme type if it's defined otherwise returns SYSTEM theme
   */
  export function from(type?: Theme.Type): Theme {
    switch (type) {
      case ThemeType.LIGHT:
        return LIGHT;
      case ThemeType.DARK:
        return DARK;
      case ThemeType.SYSTEM:
      default:
        return SYSTEM;
    }
  }
}
