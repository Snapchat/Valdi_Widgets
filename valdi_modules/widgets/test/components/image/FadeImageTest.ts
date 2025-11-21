import { FadeImage } from 'widgets/src/components/image/FadeImage';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { elementTypeFind } from 'foundation/test/util/elementTypeFind';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { createComponent } from 'valdi_test/test/JSXTestUtils';
import { IRenderedElementViewClass } from 'valdi_test/test/IRenderedElementViewClass';

describe('FadeImage', () => {
  it('renders with source', async () => {
    const component = createComponent(
      FadeImage,
      {
        src: 'test-image-url',
        width: 100,
        height: 100,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const images = elementTypeFind(elements, IRenderedElementViewClass.Image);
    expect(images.length).toBeGreaterThan(0);
  });

  it('applies objectFit property', async () => {
    const component = createComponent(
      FadeImage,
      {
        src: 'test-image-url',
        objectFit: 'contain',
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const images = elementTypeFind(elements, IRenderedElementViewClass.Image);
    expect(images.length).toBeGreaterThan(0);
    expect(images[0]?.getAttribute('objectFit')).toBe('contain');
  });

  it('renders with border radius', async () => {
    const component = createComponent(
      FadeImage,
      {
        src: 'test-image-url',
        borderRadius: 10,
      },
      {},
    ).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const images = elementTypeFind(elements, IRenderedElementViewClass.Image);
    expect(images.length).toBeGreaterThan(0);
    expect(images[0]?.getAttribute('borderRadius')).toBe(10);
  });
});
