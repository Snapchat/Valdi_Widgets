import { HorizontalRule } from 'widgets/src/components/rules/HorizontalRule';
import { VerticalRule } from 'widgets/src/components/rules/VerticalRule';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { elementTypeFind } from 'foundation/test/util/elementTypeFind';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { createComponent } from 'valdi_test/test/JSXTestUtils';
import { IRenderedElementViewClass } from 'valdi_test/test/IRenderedElementViewClass';
import { SemanticColor } from 'widgets/src/styles/semanticColors';

describe('Rule components', () => {
  it('renders horizontal rule with defaults', async () => {
    const component = createComponent(HorizontalRule, {}, {}).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const views = elementTypeFind(elements, IRenderedElementViewClass.View);
    expect(views.length).toBe(1);
    expect(views[0].getAttribute('backgroundColor')).toBe(SemanticColor.Layout.DIVIDER);
    expect(views[0].getAttribute('height')).toBe(1);
    expect(views[0].getAttribute('width')).toBe('100%');
  });

  it('renders vertical rule with custom stroke and color', async () => {
    const component = createComponent(
      VerticalRule,
      {
        stroke: 3,
        color: SemanticColor.Icon.PRIMARY,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const views = elementTypeFind(elements, IRenderedElementViewClass.View);
    expect(views.length).toBe(1);
    expect(views[0].getAttribute('backgroundColor')).toBe(SemanticColor.Icon.PRIMARY);
    expect(views[0].getAttribute('width')).toBe(3);
    expect(views[0].getAttribute('height')).toBe('100%');
  });
});
