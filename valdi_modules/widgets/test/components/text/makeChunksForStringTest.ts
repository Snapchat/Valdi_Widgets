import { makeChunksFromString } from 'widgets/src/components/text/utils/makeChunksFromString';
import 'jasmine/src/jasmine';

/**
 * Testing the tag parsing inside of makeChunksForString
 */
describe('makeChunksForStringTest', () => {
  /**
   * Single chunk
   */
  it('Parsing a single non-tagged string', () => {
    const inputString = 'Hello this is a regular string';
    const outputChunks = makeChunksFromString(inputString);
    expect(outputChunks).toEqual([
      {
        text: 'Hello this is a regular string',
      },
    ]);
  });
  /**
   * Three chunks with one tag
   */
  it('Parsing a string with a tag in the middle', () => {
    const inputString = 'Hello this is a regular string with a <tag>tag</tag> in the middle';
    const outputChunks = makeChunksFromString(inputString);
    expect(outputChunks).toEqual([
      {
        text: 'Hello this is a regular string with a ',
      },
      {
        key: 'tag',
        text: 'tag',
      },
      {
        text: ' in the middle',
      },
    ]);
  });
  /**
   * String with multiple times the same tag
   */
  it('Parsing a string with a tag repeated multiple times', () => {
    const inputString = 'Regular string with a <tag>tag</tag> that <tag>is repeated</tag> multiple times';
    const outputChunks = makeChunksFromString(inputString);
    expect(outputChunks).toEqual([
      {
        text: 'Regular string with a ',
      },
      {
        key: 'tag',
        text: 'tag',
      },
      {
        text: ' that ',
      },
      {
        key: 'tag',
        text: 'is repeated',
      },
      {
        text: ' multiple times',
      },
    ]);
  });
  /**
   * String with multiple tags
   */
  it('Parsing a string with multiple tags', () => {
    const inputString = 'Regular string with multiple <tag1>tags</tag1> in the <tag2>string</tag2>';
    const outputChunks = makeChunksFromString(inputString);
    expect(outputChunks).toEqual([
      {
        text: 'Regular string with multiple ',
      },
      {
        key: 'tag1',
        text: 'tags',
      },
      {
        text: ' in the ',
      },
      {
        key: 'tag2',
        text: 'string',
      },
    ]);
  });
});
