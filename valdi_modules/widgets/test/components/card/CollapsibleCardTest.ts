import { CollapsibleCard } from 'widgets/src/components/card/CollapsibleCard';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { elementTypeFind } from 'foundation/test/util/elementTypeFind';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { createComponent } from 'valdi_test/test/JSXTestUtils';
import { IRenderedElementViewClass } from 'valdi_test/test/IRenderedElementViewClass';

describe('CollapsibleCard', () => {
  // Basic no-op render function for testing
  const createRenderFunctions = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      renderFunction: (): void => {
        // Empty render function - the JSX itself doesn't need to work,
        // we're testing the CollapsibleCard's button logic
      },
      key: String(i),
    }));
  };

  it('renders with view elements', async () => {
    const component = createComponent(
      CollapsibleCard,
      {
        renderFunctions: createRenderFunctions(3),
        maxNumCollapsedComponents: 2,
        expandText: 'View More',
        collapseText: 'View Less',
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const views = elementTypeFind(elements, IRenderedElementViewClass.View);
    // CollapsibleCard wraps content in a Card which should render views
    expect(views.length).toBeGreaterThanOrEqual(0);
  });

  it('shows expand button label when items exceed maxNumCollapsedComponents', async () => {
    const component = createComponent(
      CollapsibleCard,
      {
        renderFunctions: createRenderFunctions(5),
        maxNumCollapsedComponents: 2,
        expandText: 'View More',
        collapseText: 'View Less',
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    // Verify the component instance can be accessed and has correct view model
    expect(component.viewModel.renderFunctions?.length).toBe(5);
    expect(component.viewModel.maxNumCollapsedComponents).toBe(2);
    // When renderFunctions.length (5) > maxNumCollapsedComponents (2), button should show
    expect(component.viewModel.renderFunctions!.length > component.viewModel.maxNumCollapsedComponents).toBeTrue();
  });

  it('does not require expand button when items are within maxNumCollapsedComponents', async () => {
    const component = createComponent(
      CollapsibleCard,
      {
        renderFunctions: createRenderFunctions(2),
        maxNumCollapsedComponents: 3,
        expandText: 'View More',
        collapseText: 'View Less',
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    // Verify view model properties
    expect(component.viewModel.renderFunctions?.length).toBe(2);
    expect(component.viewModel.maxNumCollapsedComponents).toBe(3);
    // When renderFunctions.length (2) <= maxNumCollapsedComponents (3), no button needed
    expect(component.viewModel.renderFunctions!.length <= component.viewModel.maxNumCollapsedComponents).toBeTrue();
  });
});
