import { ConfirmationButton } from 'widgets/src/components/button/ConfirmationButton';
import 'jasmine/src/jasmine';
import { createComponent } from 'valdi_test/test/JSXTestUtils';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';

describe('ConfirmationButton', () => {
  it('renders without error', async () => {
    const component = createComponent(
      ConfirmationButton,
      {
        text: 'Confirm',
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);
    expect(component).toBeDefined();
  });

  it('renders when disabled', async () => {
    const component = createComponent(
      ConfirmationButton,
      {
        text: 'Confirm',
        disabled: true,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);
    expect(component).toBeDefined();
  });
});
