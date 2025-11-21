import { PillButton } from 'widgets/src/components/button/PillButton';
import 'jasmine/src/jasmine';
import { createComponent } from 'valdi_test/test/JSXTestUtils';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';

describe('PillButton', () => {
  it('renders without error', async () => {
    const component = createComponent(
      PillButton,
      {
        text: 'Pill',
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);
    expect(component).toBeDefined();
  });

  it('renders when disabled', async () => {
    const component = createComponent(
      PillButton,
      {
        text: 'Pill',
        disabled: true,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);
    expect(component).toBeDefined();
  });

  it('renders when selected', async () => {
    const component = createComponent(
      PillButton,
      {
        text: 'Pill',
        selected: true,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);
    expect(component).toBeDefined();
  });
});
