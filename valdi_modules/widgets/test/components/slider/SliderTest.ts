import { Slider } from 'widgets/src/components/slider/Slider';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { createComponent } from 'valdi_test/test/JSXTestUtils';

describe('Slider', () => {
  it('initializes with provided value', async () => {
    const component = createComponent(
      Slider,
      {
        initialValue: 0.5,
        onChange: () => {},
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    // Verify state is set correctly
    expect(component.state.value).toBeCloseTo(0.5, 2);
  });

  it('updates value on touch within bar width', async () => {
    const onChange = jasmine.createSpy('onChange');
    const component = createComponent(
      Slider,
      {
        onChange,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    // Simulate bar layout to set bar width
    component['onBarLayout']({ width: 100, height: 25, x: 0, y: 0 });
    await untilRenderComplete(component);

    expect(component.state.barWidth).toBe(100);

    // Simulate touch event
    component['onBarTouch']({ x: 50 } as any);
    await untilRenderComplete(component);

    expect(onChange).toHaveBeenCalledWith(0.5);
    expect(component.state.value).toBeCloseTo(0.5, 2);
  });

  it('clamps value between 0 and 1', async () => {
    const onChange = jasmine.createSpy('onChange');
    const component = createComponent(
      Slider,
      {
        onChange,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    // Set bar width
    component['onBarLayout']({ width: 100, height: 25, x: 0, y: 0 });
    await untilRenderComplete(component);

    // Touch beyond the bar (should clamp to 1)
    component['onBarTouch']({ x: 150 } as any);
    await untilRenderComplete(component);

    expect(onChange).toHaveBeenCalledWith(1.0);
    expect(component.state.value).toBe(1.0);

    // Touch before the bar (should clamp to 0)
    component['onBarTouch']({ x: -50 } as any);
    await untilRenderComplete(component);

    expect(onChange).toHaveBeenCalledWith(0.0);
    expect(component.state.value).toBe(0.0);
  });

  it('renders without errors', async () => {
    const component = createComponent(
      Slider,
      {
        initialValue: 0.3,
        onChange: () => {},
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    expect(elements.length).toBeGreaterThan(0);
  });
});
