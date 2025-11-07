import { ElementRef } from 'valdi_core/src/ElementRef';
import { IRenderedElement } from 'valdi_core/src/IRenderedElement';
import { IRenderedElementBase } from 'valdi_tsx/src/IRenderedElementBase';
import { IRenderedElementHolder } from 'valdi_tsx/src/IRenderedElementHolder';

export interface TextInputElement {
  focused?: boolean;
}

export class TextInputHandler<T> implements IRenderedElementHolder<T> {
  protected readonly elementRef = new ElementRef<T>();

  private focusNextCreated = false;

  public isFocused(): boolean {
    if (this.focusNextCreated) {
      return true;
    }
    for (const element of this.elementRef.all()) {
      if (this.readFocusValueFromElement(element)) {
        return true;
      }
    }
    return false;
  }

  public setFocused(focused: boolean): void {
    if (focused) {
      const first = this.elementRef.single();
      if (first) {
        this.applyFocusValueToElement(first, true);
      } else {
        this.focusNextCreated = true;
      }
    } else {
      for (const element of this.elementRef.all()) {
        this.applyFocusValueToElement(element, false);
      }
      this.focusNextCreated = false;
    }
  }

  onElementCreated(element: IRenderedElementBase<T>): void {
    if (this.focusNextCreated) {
      this.focusNextCreated = false;
      this.applyFocusValueToElement(element, true);
    }
    return this.elementRef.onElementCreated(element);
  }

  onElementDestroyed(element: IRenderedElementBase<T>): void {
    return this.elementRef.onElementDestroyed(element);
  }

  setElements(elements: IRenderedElementBase<T>[]): void {
    return this.elementRef.setElements(elements);
  }

  /**
   * @deprecated
   * Most of the time you should just need to call the getFocused/setFocused functions directly
   * Any other attribute of the text input should be handled through the declarative state syntax
   */
  all(): IRenderedElement<T>[] {
    return this.elementRef.all();
  }

  /**
   * @deprecated
   * Most of the time you should just need to call the getFocused/setFocused functions directly
   * Any other attribute of the text input should be handled through the declarative state syntax
   */
  single(): IRenderedElement<T> | undefined {
    return this.elementRef.single();
  }

  private applyFocusValueToElement(element: IRenderedElementBase<T>, focused: boolean): void {
    (element as unknown as IRenderedElement).setAttribute('focused', focused);
  }

  private readFocusValueFromElement(element: IRenderedElement): boolean {
    return (element.getAttribute('focused') as boolean) ?? false;
  }
}
