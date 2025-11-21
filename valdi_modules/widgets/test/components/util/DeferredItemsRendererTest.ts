import { DeferredItemsRenderer, DeferredItemsRendererListener } from 'widgets/src/components/util/DeferredItemsRenderer';
import 'jasmine/src/jasmine';
import * as OnIdle from 'valdi_core/src/utils/OnIdle';

describe('DeferredItemsRenderer', () => {
  it('allows initial items then schedules more on idle', () => {
    const listener: DeferredItemsRendererListener = {
      onReadyToRenderNewItems: jasmine.createSpy('onReadyToRenderNewItems'),
    };
    const renderer = new DeferredItemsRenderer(2, 1, listener);
    const idleSpy = spyOn(OnIdle, 'onIdleInterruptible').and.callFake(cb => cb());

    renderer.prepareForRender();
    expect(renderer.shouldRenderNextItem()).toBeTrue();
    expect(renderer.shouldRenderNextItem()).toBeTrue();
    expect(renderer.shouldRenderNextItem()).toBeFalse();

    // idle callback should allow rendering additional item
    expect(listener.onReadyToRenderNewItems).toHaveBeenCalledWith(renderer);
    renderer.prepareForRender();
    expect(renderer.shouldRenderNextItem()).toBeTrue();
    expect(idleSpy).toHaveBeenCalled();
  });
});
