import { Asset } from 'valdi_core/src/Asset';
import { IndexViewSymbol } from '../IndexViewSymbol';

export function convertImageToSymbol(image: string | Asset, key: string): IndexViewSymbol {
  return {
    key: key,
    image: image,
  };
}
