import { DataSyncingBar } from 'widgets/src/components/refresh/DataSyncingBar';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { elementTypeFind } from 'foundation/test/util/elementTypeFind';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { createComponent } from 'valdi_test/test/JSXTestUtils';
import { IRenderedElementViewClass } from 'valdi_test/test/IRenderedElementViewClass';

describe('DataSyncingBar', () => {
  it('renders gradient view within scroll', async () => {
    const component = createComponent(DataSyncingBar, {}, {}).getComponent();

    await untilRenderComplete(component);

    const elements = componentGetElements(component);
    const scrolls = elementTypeFind(elements, IRenderedElementViewClass.ScrollView);
    const views = elementTypeFind(elements, IRenderedElementViewClass.View);
    expect(scrolls.length).toBe(1);
    expect(views.length).toBeGreaterThan(0);
  });

  it('updates scroll position over time', async () => {
    const bar = createComponent(DataSyncingBar, {}, {}).getComponent();
    const scrollSpy = jasmine.createSpy('scroll');
    (bar as any).scrollViewHandler = {
      scrollTo: scrollSpy,
    };
    (bar as any).setTimeoutDisposable = jasmine.createSpy('setTimeoutDisposable');

    // Run scroll twice to simulate timer
    bar.scroll();
    bar.scroll();

    expect(scrollSpy.calls.count()).toBe(2);
    expect(scrollSpy.calls.argsFor(0)[0]).toBeGreaterThan(0);
  });
});
