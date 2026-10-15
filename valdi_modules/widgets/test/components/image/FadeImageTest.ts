import { FadeImage } from 'widgets/src/components/image/FadeImage';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { elementTypeFind } from 'foundation/test/util/elementTypeFind';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { valdiIt } from 'valdi_test/test/JSXTestUtils';
import { IRenderedElementViewClass } from 'valdi_test/test/IRenderedElementViewClass';

describe('FadeImage', () => {
  valdiIt('renders with source', async driver => {
    const component = driver.renderComponent(
      FadeImage,
      {
        src: 'test-image-url',
        width: 100,
        height: 100,
      },
      {},
    );

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const images = elementTypeFind(elements, IRenderedElementViewClass.Image);
    expect(images.length).toBeGreaterThan(0);
  });

  valdiIt('applies objectFit property', async driver => {
    const component = driver.renderComponent(
      FadeImage,
      {
        src: 'test-image-url',
        objectFit: 'contain',
      },
      {},
    );

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const images = elementTypeFind(elements, IRenderedElementViewClass.Image);
    expect(images.length).toBeGreaterThan(0);
    expect(images[0]?.getAttribute('objectFit')).toBe('contain');
  });

  valdiIt('renders with border radius', async driver => {
    const component = driver.renderComponent(
      FadeImage,
      {
        src: 'test-image-url',
        borderRadius: 10,
      },
      {},
    );

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const images = elementTypeFind(elements, IRenderedElementViewClass.Image);
    expect(images.length).toBeGreaterThan(0);
    expect(images[0]?.getAttribute('borderRadius')).toBe(10);
  });
});
