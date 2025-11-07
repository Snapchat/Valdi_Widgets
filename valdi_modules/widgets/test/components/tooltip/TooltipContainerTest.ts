import { TooltipConstants } from 'widgets/src/components/tooltip/TooltipConstants';
import { TooltipContainer } from 'widgets/src/components/tooltip/TooltipContainer';
import { TooltipInlined } from 'widgets/src/components/tooltip/TooltipInlined';
import { TooltipPosition } from 'widgets/src/components/tooltip/TooltipPosition';
import { ExplorerVirtualNode } from 'foundation/test/util/ExplorerVirtualNode';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { componentGetVirtualNode } from 'foundation/test/util/componentGetVirtualNode';
import { elementGlobFind } from 'foundation/test/util/elementGlobFind';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { IRenderedElementViewClass } from 'valdi_test/test/IRenderedElementViewClass';
import { createComponent } from 'valdi_test/test/JSXTestUtils';
import { ElementFrame } from 'valdi_tsx/src/Geometry';

type CallOnLayout = (frame: ElementFrame) => void;

describe('TooltipContainerTest', () => {
  /**
   * Test that the tooltip become opacity=1 when all frames have been computed
   * using the Position=TopLeft case
   */
  it('Tooltip appears with frames and position TopLeft', async () => {
    // Create our test component
    const component = createComponent(
      TooltipContainer,
      {
        on: true,
        text: 'Hello tooltip',
        position: TooltipPosition.TopLeft,
      },
      {},
    ).getComponent();
    // Wait for first render
    await untilRenderComplete(component);
    // Check result, tooltip not visible because no frame compouted
    new ExplorerVirtualNode(componentGetVirtualNode(component))
      .expectDirectChildElement(IRenderedElementViewClass.Layout, {})
      .expectDirectChildElement(IRenderedElementViewClass.Layout, {})
      .expectDirectChildElement(IRenderedElementViewClass.Layout, {})
      .expectDirectChildElement(IRenderedElementViewClass.Layout, {})
      .expectDirectChildComponent(TooltipInlined, { text: 'Hello tooltip', opacity: 0 });
    // Fetch elements that we and set the frame artificially
    const containerElement = elementGlobFind(componentGetElements(component), 'Layout:container');
    (containerElement[0].getAttribute('onLayout') as CallOnLayout)({
      x: 0,
      y: 0,
      width: 200,
      height: 200,
    });
    const tooltipElement = elementGlobFind(componentGetElements(component), '**/Layout:tooltip');
    (tooltipElement[0].getAttribute('onLayout') as CallOnLayout)({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
    // Wait for second render
    await untilRenderComplete(component);
    // Check result, we should now have everything proper, as the frames have been computed
    new ExplorerVirtualNode(componentGetVirtualNode(component))
      .expectDirectChildElement(IRenderedElementViewClass.Layout, {})
      .expectDirectChildElement(IRenderedElementViewClass.Layout, { top: 0, left: 0 })
      .expectDirectChildElement(IRenderedElementViewClass.Layout, {
        justifyContent: 'flex-end',
        bottom: 0,
        right: -TooltipConstants.tailOverlap,
      })
      .expectDirectChildElement(IRenderedElementViewClass.Layout, {})
      .expectDirectChildComponent(TooltipInlined, { text: 'Hello tooltip', opacity: 1 });
  });

  /**
   * Test that the tooltip is horizontally centered properly when using Position=BottomCenter
   */
  it('Tooltip appears horizontally centered', async () => {
    // Create our test component
    const component = createComponent(
      TooltipContainer,
      {
        on: true,
        text: 'Hello tooltip',
        position: TooltipPosition.BottomCenter,
      },
      {},
    ).getComponent();
    // Wait for first render
    await untilRenderComplete(component);
    // Fetch elements that we and set the frame artificially
    const containerElement = elementGlobFind(componentGetElements(component), 'Layout:container');
    (containerElement[0].getAttribute('onLayout') as CallOnLayout)({
      x: 0,
      y: 0,
      width: 200,
      height: 200,
    });
    const tooltipElement = elementGlobFind(componentGetElements(component), '**/Layout:tooltip');
    (tooltipElement[0].getAttribute('onLayout') as CallOnLayout)({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
    // Wait for second render
    await untilRenderComplete(component);
    // Check result, we should now have everything proper, as the frames have been computed
    new ExplorerVirtualNode(componentGetVirtualNode(component))
      .expectDirectChildElement(IRenderedElementViewClass.Layout, {})
      .expectDirectChildElement(IRenderedElementViewClass.Layout, { bottom: 0, left: 100 })
      .expectDirectChildElement(IRenderedElementViewClass.Layout, {
        top: 0,
        left: -50,
      })
      .expectDirectChildElement(IRenderedElementViewClass.Layout, {})
      .expectDirectChildComponent(TooltipInlined, { text: 'Hello tooltip', opacity: 1 });
  });
});
