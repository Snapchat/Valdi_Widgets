import { EmojiLabel } from 'widgets/src/components/text/EmojiLabel';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { createComponent } from 'valdi_test/test/JSXTestUtils';

describe('EmojiLabel', () => {
  it('renders with value', async () => {
    const component = createComponent(
      EmojiLabel,
      {
        value: '😀 Hello',
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('passes through viewModel properties', async () => {
    const component = createComponent(
      EmojiLabel,
      {
        value: 'Test',
        numberOfLines: 2,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const root = elements[0];
    expect(root).toBeDefined();
  });
});
