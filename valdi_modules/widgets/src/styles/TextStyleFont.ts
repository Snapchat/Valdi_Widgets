export type TextStyleFont = string;

import { systemBoldFont, systemFont } from 'valdi_core/src/SystemFont';

/**
 * Common Typography
 * They are defined as a trio of font-weight, font-size, and how they behave for text-scaling.
 */
export namespace TextStyleFont {
  export const TITLE_1 = systemBoldFont(34);
  export const TITLE_2 = systemBoldFont(28);
  export const TITLE_3 = systemBoldFont(22);
  export const TITLE_4 = systemBoldFont(20);
  export const HEADLINE = systemBoldFont(18);
  export const BODY = systemFont(16);
  export const BODY_EMPHASIS = systemBoldFont(16);
  export const BODY_BOLD = systemBoldFont(16);
  export const SUBHEADLINE = systemFont(14);
  export const SUBHEADLINE_EMPHASIS = systemBoldFont(14);
  export const CAPTION = systemFont(12);
  export const CAPTION_EMPHASIS = systemBoldFont(12);
  export const CAPTION_BOLD = systemBoldFont(12);
  export const FOOTNOTE = systemFont(10);
  export const FOOTNOTE_EMPHASIS = systemBoldFont(10);
  export const FOOTNOTE_BOLD = systemBoldFont(10);
}

export namespace TextStyleFontNonDynamic {
  export const TITLE_1 = systemBoldFont(34);
  export const TITLE_2 = systemBoldFont(28);
  export const TITLE_3 = systemBoldFont(22);
  export const TITLE_4 = systemBoldFont(20);
  export const HEADLINE = systemBoldFont(18);
  export const BODY = systemFont(16);
  export const BODY_EMPHASIS = systemBoldFont(16);
  export const SUBHEADLINE = systemFont(14);
  export const SUBHEADLINE_EMPHASIS = systemBoldFont(14);
  export const CAPTION = systemFont(12);
  export const CAPTION_EMPHASIS = systemBoldFont(12);
  export const FOOTNOTE = systemFont(10);
  export const FOOTNOTE_EMPHASIS = systemBoldFont(10);
}


/**
 * Typography scaling can be clamped up to a maximum font size,
 * bypassing and ignoring the accessibility settings of the user's device
 * Note: this is sometimes used to ensure that a component's label will not expand the size of its component too much
 */
export function clampedTextStyleFont(textStyleFont: TextStyleFont, maxSize: number): string {
  return `${textStyleFont} ${maxSize}`;
}
