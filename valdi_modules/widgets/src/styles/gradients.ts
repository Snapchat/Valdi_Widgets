import { SemanticColor } from './semanticColors';

export enum GradientDirection {
  TopToBottom = '0deg',
  TopRightToBottomLeft = '45deg',
  RightToLeft = '90deg',
  BottomRightToTopLeft = '135deg',
  BottomToTop = '180deg',
  BottomLeftToTopRight = '225deg',
  LeftToRight = '270deg',
  TopLeftToBottomRight = '315deg',
}

export type ColorStop = [SemanticColor, number];

// Use this function to generate a style string for a linear gradient
export function linearGradient(stops: ColorStop[], direction?: GradientDirection): string {
  const values = stops.map(colorStop => `${colorStop[0]} ${colorStop[1]}`).join(', ');
  if (direction) {
    return `linear-gradient(${direction}, ${values})`;
  }
  return `linear-gradient(${values})`;
}

/**
 * Use this function to generate a style string for a radial gradient
 * NOTE: Android (non SnapDrawing) doesn't support oval radial gradients and will instead render them
 * as circles when applied as a background to non-square views
 */
export function radialGradient(stops: ColorStop[]): string {
  const values = stops.map(colorStop => `${colorStop[0]} ${colorStop[1]}`).join(', ');
  return `radial-gradient(${values})`;
}
