import { Device } from 'valdi_core/src/Device';

/**
 * Convert a float number to a percentage string representation.
 */
export function toPctStr(pct: number): string {
  return `${pct * 100}%`;
}

/**
 * Split an array in chunks.
 */
export function splitInChunks<T>(input: readonly T[], chunkSize: number): T[][] {
  const output = new Array<Array<T>>();

  for (let i = 0; i < input.length; i += chunkSize) {
    output.push(input.slice(i, i + chunkSize));
  }

  return output;
}

export function calcContentArea(): number {
  return Device.getDisplayHeight() - Device.getDisplayTopInset() - Device.getDisplayBottomInset();
}
