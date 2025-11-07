import { convertLabelToSymbol } from './utils/convertLabelToSymbol';

export namespace IndexViewSymbols {
  export const star = convertLabelToSymbol('★');
  export const smile = convertLabelToSymbol('☻');
  export const error = convertLabelToSymbol('?');

  export const other = convertLabelToSymbol('#');
  export const latin = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ].map(c => convertLabelToSymbol(c));
}
