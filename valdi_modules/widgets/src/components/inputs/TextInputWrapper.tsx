import { Application } from 'valdi_core/src/Application';
import { ApplicationCancelable } from 'valdi_core/src/ApplicationBridge';
import { Component } from 'valdi_core/src/Component';
import { Device } from 'valdi_core/src/Device';
import { RenderedElementUtils } from 'valdi_core/src/utils/RenderedElementUtils';
import { ElementFrame } from 'valdi_tsx/src/Geometry';
import { EditTextBeginEvent, EditTextEndEvent } from 'valdi_tsx/src/NativeTemplateElements';
import { Spacing } from 'widgets/src/styles/spacing';
import { ScrollViewHandler } from '../scroll/ScrollViewHandler';
import { ScrollViewSubscription } from '../scroll/ScrollViewSubscription';
import { ScrollWithKeyboard, ScrollWithKeyboardMode } from './ScrollWithKeyboard';
import { TextInputHandler } from './TextInputHandler';

export interface TextInputWrapperSpecificViewModel {
  scrollWithKeyboard?: ScrollWithKeyboard;
  onEditBegin?: (event: EditTextBeginEvent) => void;
  onEditEnd?: (event: EditTextEndEvent) => void;
  onLayout?: (frame: ElementFrame) => void;
}

export type TextInputWrapperViewModel<T> = TextInputWrapperSpecificViewModel & T;

/**
 * This component acts as a parent abstract class for the drop-in enhanced wrappers of:
 * - TextFieldWrapper for the <textfield/> element
 * - TextViewWrapper for the <textview/> element
 *
 * If configured through scrollWithKeyboard, the textfield/textview will auto-scroll
 * to center itself on the screen when the keyboard appear and occludes the typing box
 *
 * NOTE:
 * behaviour will be different on android if the
 * Activity:windowSoftInputMode value is set to anything other than "Nothing"
 * This is because android will already handle the keyboard's apparition logic in this case
 * and we will no-op here to avoid conflicting bevahiour
 */
export abstract class TextInputWrapper<T> extends Component<TextInputWrapperViewModel<T>> {
  protected readonly textInputHandler = new TextInputHandler<T>();

  private keyboardHeight: number = 0;
  private keyboardCancelable?: ApplicationCancelable;

  private scrollInProgress: boolean = false;
  private scrollSubscription?: ScrollViewSubscription;

  private isTyping: boolean = false;
  private isFocused: boolean = false;
  private isListening: boolean = false;

  setFocused(value: boolean): void {
    this.textInputHandler.setFocused(value);
  }

  onCreate(): void {
    this.keyboardCancelable = Application.observeKeyboardHeight(keyboardHeight => {
      this.keyboardHeight = keyboardHeight;
      this.isTyping = keyboardHeight !== 0;
      this.checkForScrollEvent();
    });
  }
  onDestroy(): void {
    this.keyboardCancelable?.cancel();
    this.scrollSubscription?.unsubscribe();
  }

  protected onEditBegin = (event: EditTextBeginEvent): void => {
    this.isFocused = true;
    this.checkForScrollEvent();
    this.viewModel.onEditBegin?.(event);
  };

  protected onEditEnd = (event: EditTextEndEvent): void => {
    this.isFocused = false;
    this.checkForScrollEvent();
    this.viewModel.onEditEnd?.(event);
  };

  protected onLayout = (frame: ElementFrame): void => {
    if (this.isTyping && this.isFocused && this.isListening) {
      this.doScrollToTextInput(false);
    }
    this.viewModel.onLayout?.(frame);
  };

  private checkForScrollEvent(): void {
    const isTyping = this.isTyping;
    const isFocused = this.isFocused;
    const isListening = this.isListening;
    // If we are focused and keyboard is up, but we haven't centered the textview yet
    // That means we need to start the textInput centering interaction
    if (isTyping && isFocused && !isListening) {
      this.doScrollToTextInput(true);
      this.startListeningForScrolling();
    }
    // If we not typing and keyboard is closed, and we are still listening for scrolls
    // That means we need to end the textInput centering interaction
    if (!isTyping && !isFocused && isListening) {
      this.doScrollBackToClamp();
      this.stopListeningForScrolling();
    }
  }

  private resolveScrollViewHandler(): ScrollViewHandler | undefined {
    const scrollInProgress = this.scrollInProgress;
    if (scrollInProgress) {
      return undefined;
    }
    const scrollWithKeyboard = this.viewModel.scrollWithKeyboard;
    if (!scrollWithKeyboard) {
      return undefined;
    }
    const scrollAllowed = Device.isIOS() || scrollWithKeyboard.mode === ScrollWithKeyboardMode.EnabledOnAllPlatforms;
    if (!scrollAllowed) {
      return undefined;
    }
    return scrollWithKeyboard.scrollViewHandler;
  }

  private computeIdealScrollY(): number | undefined {
    const scrollViewHandler = this.resolveScrollViewHandler();
    if (!scrollViewHandler) {
      return;
    }
    const scrollView = scrollViewHandler.single();
    if (!scrollView) {
      return;
    }
    const textInput = this.textInputHandler.single();
    if (!textInput) {
      return;
    }
    const relativePosition = RenderedElementUtils.relativePositionTo(scrollView, textInput);
    if (!relativePosition) {
      return;
    }
    const bottomSpacing = this.viewModel.scrollWithKeyboard?.bottomSpacing ?? Spacing.SM;
    const textInputBottom = relativePosition.y + textInput.frame.height + bottomSpacing;
    return textInputBottom - scrollView.frame.height + this.keyboardHeight;
  }

  private doScrollToTextInput(animated: boolean): void {
    const scrollViewHandler = this.resolveScrollViewHandler();
    if (!scrollViewHandler) {
      return;
    }
    const idealScrollY = this.computeIdealScrollY();
    if (idealScrollY === undefined) {
      return;
    }
    const currentScrollX = scrollViewHandler.scrollX;
    const currentScrollY = scrollViewHandler.scrollY;
    if (currentScrollY !== idealScrollY) {
      if (currentScrollY < idealScrollY || this.viewModel.scrollWithKeyboard?.allowScrollingUpward) {
        scrollViewHandler.scrollTo(currentScrollX, idealScrollY, animated);
      }
    }
  }

  private doScrollBackToClamp(): void {
    const scrollViewHandler = this.resolveScrollViewHandler();
    if (!scrollViewHandler) {
      return;
    }
    scrollViewHandler.scrollToClamped(scrollViewHandler.scrollX, scrollViewHandler.scrollY, true);
  }

  private startListeningForScrolling(): void {
    this.stopListeningForScrolling();
    const scrollViewHandler = this.resolveScrollViewHandler();
    if (!scrollViewHandler) {
      return;
    }
    this.isListening = true;
    this.scrollSubscription = scrollViewHandler.subscribeListener({
      onDragStart: () => {
        this.scrollInProgress = true;
      },
      onScrollEnd: () => {
        this.scrollInProgress = false;
      },
    });
  }

  private stopListeningForScrolling(): void {
    this.isListening = false;
    this.scrollSubscription?.unsubscribe();
    this.scrollSubscription = undefined;
    this.scrollInProgress = false;
  }

  abstract onRender(): void;
}
