import { ElementRef } from 'valdi_core/src/ElementRef';
import { IndexViewSymbol } from './IndexViewSymbol';

/**
 * Maintains a map of IndexViewSymbol keys to ElementRef instances so an IndexView can scroll to named anchors.
 * Pass to IndexView and IndexViewAnchor to link them together.
 */
export class IndexViewHandler {
  private elementRefs: Map<string, ElementRef>;
  constructor() {
    this.elementRefs = new Map<string, ElementRef>();
  }
  getRef(symbol: IndexViewSymbol): ElementRef | undefined {
    return this.elementRefs.get(symbol.key);
  }
  getOrCreateRef(symbol: IndexViewSymbol): ElementRef {
    let elementRef = this.elementRefs.get(symbol.key);
    if (!elementRef) {
      elementRef = new ElementRef();
      this.elementRefs.set(symbol.key, elementRef);
    }
    return elementRef;
  }
}
