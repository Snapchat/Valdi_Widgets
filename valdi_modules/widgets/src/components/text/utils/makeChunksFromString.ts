import { TextWithTagsChunk } from '../TextWithTagsChunk';

interface TagRef {
  key: string;
  before: number;
  after: number;
  closing: boolean;
}

function findNextTag(text: string, idx: number): TagRef | undefined {
  const before = text.indexOf('<', idx);
  if (before < 0) {
    return undefined;
  }
  let start = before + 1;
  let closing = false;
  if (text[start] === '/') {
    start = start + 1;
    closing = true;
  }
  const end = text.indexOf('>', start);
  if (end < 0) {
    console.error("Xml tag is missing '>' in string:", text);
    return {
      key: text.slice(start),
      before: before,
      after: text.length,
      closing: closing,
    };
  } else {
    return {
      key: text.slice(start, end),
      before: before,
      after: end + 1,
      closing: closing,
    };
  }
}

export function makeChunksFromString(translatedStringWithTags: string): TextWithTagsChunk[] {
  const chunks: TextWithTagsChunk[] = [];

  // Non-recursive xml tag parsing
  let idx = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const previous = idx;
    // Find opening tag
    const tagOpen = findNextTag(translatedStringWithTags, idx);
    if (tagOpen === undefined) {
      break;
    }
    if (tagOpen.closing) {
      console.error('Xml opening tag is marked as closing in string:', translatedStringWithTags);
    }
    idx = tagOpen.after;
    // If we could find an opening tag, save the previous text as regular chunk
    chunks.push({
      text: translatedStringWithTags.slice(previous, tagOpen.before),
    });
    // Find closing tag
    const tagClose = findNextTag(translatedStringWithTags, idx);
    if (tagClose === undefined) {
      console.error('Xml tag not closed in string:', translatedStringWithTags);
      break;
    }
    if (!tagClose.closing) {
      console.error('Xml closing tag is marked as an opening tag in string:', translatedStringWithTags);
    }
    idx = tagClose.after;
    // If everything went well, save chunk
    if (tagOpen.key !== tagClose.key) {
      console.error("Xml tag key doesn't match opening and closing tag in string:", translatedStringWithTags);
    }
    chunks.push({
      key: tagOpen.key,
      text: translatedStringWithTags.slice(tagOpen.after, tagClose.before),
    });
  }

  // Anything outside a tag is a regular key-less chunk
  const rest = translatedStringWithTags.slice(idx);
  if (rest) {
    chunks.push({
      text: rest,
    });
  }

  return chunks;
}
