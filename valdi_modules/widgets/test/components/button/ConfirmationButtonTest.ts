import { ConfirmationButton } from 'widgets/src/components/button/ConfirmationButton';
import 'jasmine/src/jasmine';
import { valdiIt } from 'valdi_test/test/JSXTestUtils';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';

describe('ConfirmationButton', () => {
  valdiIt('renders without error', async driver => {
    const component = driver.renderComponent(
      ConfirmationButton,
      {
        text: 'Confirm',
      },
      {},
    );

    await untilRenderComplete(component);
    expect(component).toBeDefined();
  });

  valdiIt('renders when disabled', async driver => {
    const component = driver.renderComponent(
      ConfirmationButton,
      {
        text: 'Confirm',
        disabled: true,
      },
      {},
    );

    await untilRenderComplete(component);
    expect(component).toBeDefined();
  });
});
