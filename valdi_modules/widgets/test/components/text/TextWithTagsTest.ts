import { AttributedTextBuilder } from 'valdi_core/src/utils/AttributedTextBuilder';
import { IRenderedElementViewClass } from 'valdi_test/test/IRenderedElementViewClass';
import { createComponent } from 'valdi_test/test/JSXTestUtils';
import { TextWithTags } from 'widgets/src/components/text/TextWithTags';
import { makeChunksFromString } from 'widgets/src/components/text/utils/makeChunksFromString';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { elementTypeFind } from 'foundation/test/util/elementTypeFind';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';

describe('TextWithTagsTest', () => {
  /**
   * When allowing the attributed text rendering, we have a single label
   */
  it('Simple case, with attributed, should render an attribured text label and match the tags', async () => {
    // Parse the string
    const chunks = makeChunksFromString('This is my <tag>string</tag>');
    // Create our test component
    const instrumentedComponent = createComponent(
      TextWithTags,
      {
        chunks: chunks,
        tagsByKey: {
          tag: {
            color: 'red',
          },
        },
        baseStyle: {
          color: 'blue',
        },
      },
      {},
    );
    const component = instrumentedComponent.getComponent();
    // Wait for first render
    await untilRenderComplete(component);
    // Check results
    const elements = componentGetElements(component);
    const labels = elementTypeFind(elements, IRenderedElementViewClass.Label);
    expect(labels.length).toEqual(1);

    const expectedValue = new AttributedTextBuilder()
      .appendText('This is my ')
      .append('string', { color: 'red' })
      .build();

    expect(labels[0].getAttribute('value')).toEqual(expectedValue);
    expect(labels[0].getAttribute('color')).toEqual('blue');
  });

  /**
   * When allowing the attributed text rendering we use a single label
   * even when configuring an `onTap` on one of its parts.
   */
  it('with onTap on one of the parts should render an attributed text label and match the tags', async () => {
    const onTap = (): void => {};

    // Parse the string
    const chunks = makeChunksFromString('This is my <tag1>string</tag1> and <tag2>my-other-string</tag2>');

    // Create our test component
    const instrumentedComponent = createComponent(
      TextWithTags,
      {
        chunks: chunks,
        tagsByKey: {
          tag1: {
            font: 'font1',
            color: 'green',
          },
          tag2: {
            font: 'font2',
            color: 'red',
            onTap,
          },
        },
        baseStyle: {
          font: 'font0',
          color: 'blue',
        },
      },
      {},
    );
    const component = instrumentedComponent.getComponent();
    // Wait for first render
    await untilRenderComplete(component);
    // Check results
    const elements = componentGetElements(component);
    const labels = elementTypeFind(elements, IRenderedElementViewClass.Label);
    expect(labels.length).toEqual(1);

    const expectedValue = new AttributedTextBuilder()
      .appendText('This is my ')
      .append('string', { color: 'green', font: 'font1' })
      .append(' and ')
      .append('my-other-string', {
        color: 'red',
        font: 'font2',
        onTap,
      })
      .build();

    expect(labels[0].getAttribute('value')).toEqual(expectedValue);
    expect(labels[0].getAttribute('color')).toEqual('blue');
    expect(labels[0].getAttribute('font')).toEqual('font0');
  });

  /**
   * When allowing the attributed text rendering, but using forbiddent feature, we have multiple labels
   */
  it('Complex case, with attributed and accessibilityId, should render multiple labels', async () => {
    const onTap = (): void => {};

    // Parse the string
    const chunks = makeChunksFromString('This is my <tag1>string</tag1> and <tag2>my-other-string</tag2>');

    // Create our test component
    const instrumentedComponent = createComponent(
      TextWithTags,
      {
        chunks: chunks,
        tagsByKey: {
          tag1: {
            font: 'font1',
            color: 'green',
          },
          tag2: {
            font: 'font2',
            color: 'red',
            accessibilityId: 'hello',
            onTap,
          },
        },
        baseStyle: {
          font: 'font0',
          color: 'blue',
        },
      },
      {},
    );
    const component = instrumentedComponent.getComponent();
    // Wait for first render
    await untilRenderComplete(component);
    // Check results
    const elements = componentGetElements(component);
    const labels = elementTypeFind(elements, IRenderedElementViewClass.Label);
    expect(labels.length).toEqual(4);

    expect(labels[0].getAttribute('value')).toEqual('This is my ');
    expect(labels[0].getAttribute('color')).toEqual('blue');
    expect(labels[0].getAttribute('font')).toEqual('font0');
    expect(labels[1].getAttribute('value')).toEqual('string');
    expect(labels[1].getAttribute('color')).toEqual('green');
    expect(labels[1].getAttribute('font')).toEqual('font1');
    expect(labels[2].getAttribute('value')).toEqual(' and ');
    expect(labels[2].getAttribute('color')).toEqual('blue');
    expect(labels[2].getAttribute('font')).toEqual('font0');
    expect(labels[3].getAttribute('value')).toEqual('my-other-string');
    expect(labels[3].getAttribute('color')).toEqual('red');
    expect(labels[3].getAttribute('font')).toEqual('font2');
    expect(labels[3].getAttribute('accessibilityId')).toEqual('hello');
    expect(labels[3].getAttribute('onTap')).toBe(onTap);
  });
});
