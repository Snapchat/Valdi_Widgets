import { ScrollBarHandler } from 'widgets/src/components/scroll/scrollbar/ScrollBarHandler';
import 'jasmine/src/jasmine';
import { ScrollViewHandler } from 'widgets/src/components/scroll/ScrollViewHandler';
import { RenderedElementUtils } from 'valdi_core/src/utils/RenderedElementUtils';
import { IRenderedElement } from 'valdi_core/src/IRenderedElement';

interface FakeElement extends IRenderedElement {
  __y: number;
}

const makeElement = (id: number, key: string, parentIndex: number, y: number): any => {
  return {
    id,
    key,
    parentIndex,
    setAttribute: () => {},
    getAttribute: () => undefined,
    __y: y,
  };
};

describe('ScrollBarHandler', () => {
  let scrollViewHandler: ScrollViewHandler;

  beforeEach(() => {
    scrollViewHandler = { scrollView: {} } as ScrollViewHandler;
    spyOn(RenderedElementUtils, 'relativePositionTo').and.callFake((_, element) => {
      return { x: 0, y: (element as FakeElement).__y };
    });
  });

  it('returns nearest label based on anchors', () => {
    const handler = new ScrollBarHandler();
    const refA = handler.getOrCreateRef('A');
    const refB = handler.getOrCreateRef('B');

    refA.onElementCreated(makeElement(1, 'a', 0, 10));
    refB.onElementCreated(makeElement(2, 'b', 1, 60));

    expect(handler.getLabelAtPosition(scrollViewHandler, 5)).toBe('A');
    expect(handler.getLabelAtPosition(scrollViewHandler, 55)).toBe('A');
    expect(handler.getLabelAtPosition(scrollViewHandler, 60)).toBe('B');
  });

  it('refreshes cached offsets when anchors change', () => {
    const handler = new ScrollBarHandler();
    const ref = handler.getOrCreateRef('A');

    const element = makeElement(1, 'a', 0, 20);
    ref.onElementCreated(element);
    expect(handler.getLabelAtPosition(scrollViewHandler, 10)).toBe('A');

    element.__y = 120;
    ref.onElementCreated(element);

    expect(handler.getLabelAtPosition(scrollViewHandler, 110)).toBe('A');
  });
});
