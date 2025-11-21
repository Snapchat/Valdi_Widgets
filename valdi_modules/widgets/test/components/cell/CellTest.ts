import { Cell } from 'widgets/src/components/cell/Cell';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { elementTypeFind } from 'foundation/test/util/elementTypeFind';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { createComponent } from 'valdi_test/test/JSXTestUtils';
import { IRenderedElementViewClass } from 'valdi_test/test/IRenderedElementViewClass';

describe('Cell', () => {
  it('renders title when provided', async () => {
    const component = createComponent(
      Cell,
      {
        title: 'Test Title',
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const labels = elementTypeFind(elements, IRenderedElementViewClass.Label);
    const titleLabels = labels.filter(l => l.getAttribute('value') === 'Test Title');
    expect(titleLabels.length).toBeGreaterThan(0);
  });

  it('renders subtitle when provided as string', async () => {
    const component = createComponent(
      Cell,
      {
        title: 'Title',
        subtitle: 'Test Subtitle',
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const labels = elementTypeFind(elements, IRenderedElementViewClass.Label);
    const subtitleLabels = labels.filter(l => l.getAttribute('value') === 'Test Subtitle');
    expect(subtitleLabels.length).toBeGreaterThan(0);
  });

  it('renders identity title when provided', async () => {
    const component = createComponent(
      Cell,
      {
        title: 'Title',
        identityTitle: 'Identity',
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const labels = elementTypeFind(elements, IRenderedElementViewClass.Label);
    const identityLabels = labels.filter(l => l.getAttribute('value') === 'Identity');
    expect(identityLabels.length).toBeGreaterThan(0);
  });

  it('renders reason in uppercase when provided', async () => {
    const component = createComponent(
      Cell,
      {
        title: 'Title',
        reason: 'test reason',
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const labels = elementTypeFind(elements, IRenderedElementViewClass.Label);
    const reasonLabels = labels.filter(l => l.getAttribute('accessibilityId') === 'result-reason');
    expect(reasonLabels.length).toBe(1);
    expect(reasonLabels[0]?.getAttribute('value')).toBe('TEST REASON');
  });
});
