import { normalize } from 'foundation/src/unicode';
import { IndexViewSymbol } from '../IndexViewSymbol';
import { IndexViewSymbols } from '../IndexViewSymbols';

let latinSymbolMap: Map<string, IndexViewSymbol> | undefined;

export function lookupSymbolForString(key: string): IndexViewSymbol {
  // Create the lookup map if needed
  if (!latinSymbolMap) {
    latinSymbolMap = new Map<string, IndexViewSymbol>();
    for (const symbol of IndexViewSymbols.latin) {
      latinSymbolMap.set(symbol.key, symbol);
    }
    for (let i = 0; i < 10; i++) {
      latinSymbolMap.set(i.toString(), IndexViewSymbols.other);
    }
  }
  // Lookup the raw key first
  const symbol = latinSymbolMap.get(key);
  if (symbol) {
    return symbol;
  }
  // Try to resolve the symbol letter based on an arbitrary key
  if (key.length > 0) {
    const normalized = normalize(key[0]).trim().toLocaleUpperCase();
    if (normalize.length > 0) {
      const letter = normalized[0];
      const symbol = latinSymbolMap.get(letter);
      if (symbol) {
        return symbol;
      }
    }
  }
  // Default to "other" otherwise
  return IndexViewSymbols.other;
}
