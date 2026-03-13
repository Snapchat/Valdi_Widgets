/**
 * Web implementation for Share.
 * Uses navigator.share() when available; otherwise copies text to clipboard.
 */

import { ShareOptions } from '../../src/ShareNative';

export function shareWeb(options: ShareOptions): Promise<void> {
  if (typeof navigator === 'undefined') {
    return Promise.resolve();
  }
  const { title, text, url } = options;
  if (navigator.share && typeof navigator.share === 'function') {
    const data: ShareData = {};
    if (title != null) data.title = title;
    if (text != null) data.text = text;
    if (url != null) data.url = url;
    if (Object.keys(data).length === 0 && text != null) {
      data.text = text;
    }
    return navigator.share(data).catch(() => copyFallback(text || url || title || ''));
  }
  return copyFallback(text || url || title || '');
}

function copyFallback(text: string): Promise<void> {
  if (typeof navigator === 'undefined' || typeof document === 'undefined') {
    return Promise.resolve();
  }
  const clipboard = navigator.clipboard;
  if (clipboard && typeof clipboard.writeText === 'function') {
    return clipboard.writeText(text);
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return Promise.resolve();
  } catch {
    return Promise.resolve();
  }
}
