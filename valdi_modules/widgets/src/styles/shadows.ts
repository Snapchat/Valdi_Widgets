import { SemanticColor } from './semanticColors';

// Use this function to generate a value for the boxShadow attribute on views
export function boxShadow(xOffset: number, yOffset: number, blurRadius: number, color: string | SemanticColor): string {
  return `${xOffset} ${yOffset} ${blurRadius} ${color}`;
}
