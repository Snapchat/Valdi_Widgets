import { IndexViewSymbol } from '../IndexViewSymbol';

export function convertLabelToSymbol(label: string, key?: string): IndexViewSymbol {
  return {
    key: key ?? label,
    label: label[0] ?? '?',
  };
}
