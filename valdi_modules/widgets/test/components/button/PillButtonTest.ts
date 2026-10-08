import { PillButton } from 'widgets/src/components/button/PillButton';
import 'jasmine/src/jasmine';
import { valdiIt } from 'valdi_test/test/JSXTestUtils';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';

describe('PillButton', () => {
  valdiIt('renders without error', async driver => {
    const component = driver.renderComponent(
      PillButton,
      {
        text: 'Pill',
      },
      {},
    );

    await untilRenderComplete(component);
    expect(component).toBeDefined();
  });

  valdiIt('renders when disabled', async driver => {
    const component = driver.renderComponent(
      PillButton,
      {
        text: 'Pill',
        disabled: true,
      },
      {},
    );

    await untilRenderComplete(component);
    expect(component).toBeDefined();
  });

  valdiIt('renders when selected', async driver => {
    const component = driver.renderComponent(
      PillButton,
      {
        text: 'Pill',
        selected: true,
      },
      {},
    );

    await untilRenderComplete(component);
    expect(component).toBeDefined();
  });
});
