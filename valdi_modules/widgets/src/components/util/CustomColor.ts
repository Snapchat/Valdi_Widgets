/**
 * An object that stores the color data and opacity.
 * This can be used when a feature wants to use a non SIGColor and wants to pass
 * the color information across the Valdi boundary.
 * Please get approval from #ux-platform-support before using custom color in your code.
 * @ExportModel({
 *  ios: 'SCCCustomColor',
 *  android: 'com.snap.valdi.foundation.CustomColor'
 * })
 */
export interface CustomColor {
  /** Red value of the color object. Should be a value between 0 and 255 */
  red: number;
  /** Green value of the color object. Should be a value between 0 and 255 */
  green: number;
  /** Blue value of the color object. Should be a value between 0 and 255 */
  blue: number;
  /** Opacity value of the color object. Should be a value between 0 and 1.0 */
  alpha: number;
}

/**
 *
 * Helper to convert a CustomColor object to a rgba string that can be used with a view.
 * @param color The CustomColor object which needs to converted to a rgba string
 * @returns The rgba string representation of the Color object
 */
export function customColorToRgbaString(color: CustomColor): string {
  return `rgba(${color.red}, ${color.green}, ${color.blue}, ${color.alpha})`;
}
