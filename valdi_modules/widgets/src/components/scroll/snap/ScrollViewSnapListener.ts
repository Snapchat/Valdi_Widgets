import { IRenderedElement } from 'valdi_core/src/IRenderedElement';
export interface ScrollViewSnapListener<T> {
  onAnchorSnap?: (index: number, element: IRenderedElement<T>) => void;
  onAnchorScroll?: (index: number, element: IRenderedElement<T>) => void;
}
