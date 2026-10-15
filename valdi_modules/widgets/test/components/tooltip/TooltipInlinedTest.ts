import { TooltipInlined } from 'widgets/src/components/tooltip/TooltipInlined';
import { TooltipPosition } from 'widgets/src/components/tooltip/TooltipPosition';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { elementTypeFind } from 'foundation/test/util/elementTypeFind';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { valdiIt, withValdiRenderer } from 'valdi_test/test/JSXTestUtils';
import { IRenderedElementViewClass } from 'valdi_test/test/IRenderedElementViewClass';

describe('TooltipInlined', () => {
  valdiIt('renders with default viewModel properties', async driver => {
    const viewModel = {
      text: 'Hint',
      position: TooltipPosition.TopCenter,
    };

    const component = driver.renderComponent(TooltipInlined, viewModel, {});

    await untilRenderComplete(component);

    // Verify viewModel properties are set correctly
    expect(component.viewModel.text).toBe('Hint');
    expect(component.viewModel.position).toBe(TooltipPosition.TopCenter);
    expect(component.viewModel.opacity).toBeUndefined();
    expect(component.viewModel.maxNumberOfLines).toBeUndefined();

    // Verify basic rendering - labels and views should exist
    const elements = componentGetElements(component);
    const labels = elementTypeFind(elements, IRenderedElementViewClass.Label);
    const views = elementTypeFind(elements, IRenderedElementViewClass.View);

    expect(labels.length).toBeGreaterThanOrEqual(1);
    expect(views.length).toBeGreaterThanOrEqual(1);
  });

  valdiIt('renders with custom viewModel properties', async driver => {
    const viewModel = {
      text: 'Custom Hint',
      position: TooltipPosition.BottomLeft,
      opacity: 0.5,
      maxNumberOfLines: 5,
      overrideBackgroundColor: 'pink' as const,
    };

    const component = driver.renderComponent(TooltipInlined, viewModel, {});

    await untilRenderComplete(component);

    // Verify viewModel properties are set correctly
    expect(component.viewModel.text).toBe('Custom Hint');
    expect(component.viewModel.position).toBe(TooltipPosition.BottomLeft);
    expect(component.viewModel.opacity).toBe(0.5);
    expect(component.viewModel.maxNumberOfLines).toBe(5);
    expect(component.viewModel.overrideBackgroundColor).toBe('pink');

    // Verify component renders expected element types
    const elements = componentGetElements(component);
    const labels = elementTypeFind(elements, IRenderedElementViewClass.Label);
    const views = elementTypeFind(elements, IRenderedElementViewClass.View);
    const images = elementTypeFind(elements, IRenderedElementViewClass.Image);

    expect(labels.length).toBeGreaterThanOrEqual(1);
    expect(views.length).toBeGreaterThanOrEqual(1);
    expect(images.length).toBeGreaterThanOrEqual(1);
  });

  it('supports all tooltip positions', async () => {
    const positions = [
      TooltipPosition.TopCenter,
      TooltipPosition.TopLeft,
      TooltipPosition.TopRight,
      TooltipPosition.BottomCenter,
      TooltipPosition.BottomLeft,
      TooltipPosition.BottomRight,
      TooltipPosition.CenterLeft,
      TooltipPosition.CenterRight,
    ];

    for (const position of positions) {
      // Fresh renderer per position: re-rendering one tree with a new position trips a native assertion.
      await withValdiRenderer(async driver => {
        const component = driver.renderComponent(
          TooltipInlined,
          { text: 'Test', position },
          {},
        );

        await untilRenderComplete(component);

        expect(component.viewModel.position).toBe(position);

        const elements = componentGetElements(component);
        expect(elements.length).toBeGreaterThan(0);
      })();
    }
  });
});
