import { EmojiLabel } from 'widgets/src/components/text/EmojiLabel';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { valdiIt } from 'valdi_test/test/JSXTestUtils';

describe('EmojiLabel', () => {
  valdiIt('renders with value', async driver => {
    const component = driver.renderComponent(
      EmojiLabel,
      {
        value: '😀 Hello',
      },
      {},
    );

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    expect(elements.length).toBeGreaterThan(0);
  });

  valdiIt('passes through viewModel properties', async driver => {
    const component = driver.renderComponent(
      EmojiLabel,
      {
        value: 'Test',
        numberOfLines: 2,
      },
      {},
    );

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const root = elements[0];
    expect(root).toBeDefined();
  });
});
