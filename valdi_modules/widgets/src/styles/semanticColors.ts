
import { getCurrentPalette } from 'widgets/src/InitSemanticColors';
import { DARK_PALETTE, LIGHT_PALETTE } from 'widgets/src/ColorSpec';
import { SemanticColor } from './semanticColorsGen';

/**
 * Take a semantic color and return the same semantic color but the output color will stay in Dark mode
 * It will ignore the device dark-mode status
 */
export function alwaysDark(color: SemanticColor): SemanticColor {
  return DARK_PALETTE[color];
}

/**
 * Take a semantic color and return the same semantic color but the output color will stay in Light mode
 * It will ignore the device dark-mode status
 */
export function alwaysLight(color: SemanticColor): SemanticColor {
  return LIGHT_PALETTE[color];
}

export enum SemanticColorPalette {
  /**
   * Get the semantic color based on the current mode
   */
  Current,
  /**
   * Take a semantic color and return the same semantic color but the output color will stay in Light mode
   * It will ignore the device dark-mode status
   */
  Light,

  /**
   * Take a semantic color and return the same semantic color but the output color will stay in Dark mode
   * It will ignore the device dark-mode status
   */
  Dark,
}

/**
 * Get the semantic color with the given alpha
 */
export function getSemanticColorWithAlpha(color: SemanticColor, alpha: number, palette?: SemanticColorPalette): string {
  let paletteColor: SemanticColor;
  switch (palette ?? SemanticColorPalette.Current) {
    case SemanticColorPalette.Current:
      paletteColor = getCurrentPalette()[color];
      break;
    case SemanticColorPalette.Light:
      paletteColor = alwaysLight(color);
      break;
    case SemanticColorPalette.Dark:
      paletteColor = alwaysDark(color);
      break;
  }

  // Add alpha to hex colors
  if (paletteColor.startsWith('#')) {
    // Convert the alpha to 8bit
    const _alpha = Math.round(Math.min(Math.max(alpha, 0), 1) * 255);
    // Convert the 8bit alpha to hex and append - #FFFFFF00
    return paletteColor + _alpha.toString(16).padStart(2, '0').toUpperCase();
  }
  // Add alpha to rgb colors
  if (paletteColor.startsWith('rgb(')) {
    // Remove 'rgb(' and ')' - (r, g, b
    const rgbColor = paletteColor.substring(3).slice(0, -1);
    // rgba(r, g, b, a)
    return 'rgba' + rgbColor + ', ' + alpha + ')';
  }
  // Update alpha of rgba colors
  if (paletteColor.startsWith('rgba')) {
    // Split by ','
    const splitPaletteColor = paletteColor.split(',');
    // Remove the alpha
    splitPaletteColor.pop();
    // Add the new alpha
    splitPaletteColor.push(' ' + alpha + ')');
    // rgba(r, g, b, a)
    return splitPaletteColor.toString();
  }
  // Return the color if unsupported format
  return paletteColor;
}

export { SemanticColor } from './semanticColorsGen';

export function rgbToString(r: number, g: number, b: number): string {
  let red = r.toString(16);
  let green = g.toString(16);
  let blue = b.toString(16);

  if (red.length < 2) {
    red = '0' + red;
  }
  if (green.length < 2) {
    green = '0' + green;
  }
  if (blue.length < 2) {
    blue = '0' + blue;
  }

  return `#${red}${green}${blue}`;
}

export function hsvToRgb(h: number, s: number, v: number): string {
  let r: number;
  let g: number;
  let b: number;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      (r = v), (g = t), (b = p);
      break;
    case 1:
      (r = q), (g = v), (b = p);
      break;
    case 2:
      (r = p), (g = v), (b = t);
      break;
    case 3:
      (r = p), (g = q), (b = v);
      break;
    case 4:
      (r = t), (g = p), (b = v);
      break;
    case 5:
      (r = v), (g = p), (b = q);
      break;
    default:
      throw Error('Invalid values');
  }

  return rgbToString(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
}
