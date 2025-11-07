import { ScrollViewHandler } from '../scroll/ScrollViewHandler';

/**
 * Depending on context in which the valdi view is rendered, it may make sense to change the auto-scroll behaviour
 */
export const enum ScrollWithKeyboardMode {
  // If possible we can keep keyboard auto-scroll cross-platform
  EnabledOnAllPlatforms,
  // In some cases, android may already handle the auto-scroll behaviour, need to be disabled to avoid conflicts
  EnabledExceptOnAndroid,
}

/**
 * Configures the auto-scrolling behaviour when the textfield becomes focused
 */
export interface ScrollWithKeyboard {
  mode: ScrollWithKeyboardMode;
  scrollViewHandler: ScrollViewHandler;
  allowScrollingUpward?: boolean;
  bottomSpacing?: number;
}
