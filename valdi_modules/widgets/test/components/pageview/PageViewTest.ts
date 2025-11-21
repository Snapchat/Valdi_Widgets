import { ScrollViewHandler } from 'widgets/src/components/scroll/ScrollViewHandler';
import 'jasmine/src/jasmine';

/**
 * Tests for PageView-related functionality.
 * Note: PageView component renders multiple root elements which requires special handling.
 * These tests focus on the supporting classes and logic used by PageView.
 */
describe('PageView', () => {
  describe('ScrollViewHandler used by PageView', () => {
    it('initializes with default values', () => {
      const handler = new ScrollViewHandler();

      expect(handler.scrollX).toBe(0);
      expect(handler.scrollY).toBe(0);
      expect(handler.scrollViewFrame).toBeUndefined();
      expect(handler.getContentWidth()).toBe(0);
      expect(handler.getContentHeight()).toBe(0);
    });

    it('returns undefined frame when no element is set', () => {
      const handler = new ScrollViewHandler();

      expect(handler.scrollViewFrame).toBeUndefined();
      expect(handler.scrollView).toBeUndefined();
    });

    it('allows subscription and unsubscription of listeners', () => {
      const handler = new ScrollViewHandler();
      const listener = {
        onScroll: jasmine.createSpy('onScroll'),
      };

      const subscription = handler.subscribeListener(listener);
      expect(subscription).toBeDefined();
      expect(subscription.unsubscribe).toBeDefined();

      // Should not throw when unsubscribing
      subscription.unsubscribe();
    });

    it('defers attribute setting when element is not set', () => {
      const handler = new ScrollViewHandler();

      // Should not throw when setting attributes before element is set
      handler.scrollTo(100, 50, false);
      handler.setTranslationX(10);
      handler.setTranslationY(20);
    });

    it('handles circular ratio default value', () => {
      const handler = new ScrollViewHandler();

      expect(handler.circularRatio).toBe(1);
    });

    it('handles horizontal default value', () => {
      const handler = new ScrollViewHandler();

      expect(handler.horizontal).toBe(false);
    });

    it('handles scroll animated default value', () => {
      const handler = new ScrollViewHandler();

      expect(handler.scrollAnimated).toBe(false);
    });

    it('returns empty array from all() when no element', () => {
      const handler = new ScrollViewHandler();

      expect(handler.all()).toEqual([]);
    });

    it('returns undefined from single() when no element', () => {
      const handler = new ScrollViewHandler();

      expect(handler.single()).toBeUndefined();
    });
  });
});
