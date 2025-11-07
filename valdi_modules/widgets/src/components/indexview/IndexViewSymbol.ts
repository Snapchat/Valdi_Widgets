import { Asset } from 'valdi_core/src/Asset';

export interface IndexViewSymbol {
  key: string;
  image?: string | Asset;
  label?: string;
}
