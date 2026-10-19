import { Cell } from 'widgets/src/components/cell/Cell';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { elementTypeFind } from 'foundation/test/util/elementTypeFind';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { valdiIt } from 'valdi_test/test/JSXTestUtils';
import { IRenderedElementViewClass } from 'valdi_test/test/IRenderedElementViewClass';

describe('Cell', () => {
  valdiIt('renders title when provided', async driver => {
    const component = driver.renderComponent(
      Cell,
      {
        title: 'Test Title',
      },
      {},
    );

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const labels = elementTypeFind(elements, IRenderedElementViewClass.Label);
    const titleLabels = labels.filter(l => l.getAttribute('value') === 'Test Title');
    expect(titleLabels.length).toBeGreaterThan(0);
  });

  valdiIt('renders subtitle when provided as string', async driver => {
    const component = driver.renderComponent(
      Cell,
      {
        title: 'Title',
        subtitle: 'Test Subtitle',
      },
      {},
    );

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const labels = elementTypeFind(elements, IRenderedElementViewClass.Label);
    const subtitleLabels = labels.filter(l => l.getAttribute('value') === 'Test Subtitle');
    expect(subtitleLabels.length).toBeGreaterThan(0);
  });

  valdiIt('renders identity title when provided', async driver => {
    const component = driver.renderComponent(
      Cell,
      {
        title: 'Title',
        identityTitle: 'Identity',
      },
      {},
    );

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const labels = elementTypeFind(elements, IRenderedElementViewClass.Label);
    const identityLabels = labels.filter(l => l.getAttribute('value') === 'Identity');
    expect(identityLabels.length).toBeGreaterThan(0);
  });

  valdiIt('renders reason in uppercase when provided', async driver => {
    const component = driver.renderComponent(
      Cell,
      {
        title: 'Title',
        reason: 'test reason',
      },
      {},
    );

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const labels = elementTypeFind(elements, IRenderedElementViewClass.Label);
    const reasonLabels = labels.filter(l => l.getAttribute('accessibilityId') === 'result-reason');
    expect(reasonLabels.length).toBe(1);
    expect(reasonLabels[0]?.getAttribute('value')).toBe('TEST REASON');
  });
});
