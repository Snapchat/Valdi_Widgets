import { ScrollViewHandler } from 'widgets/src/components/scroll/ScrollViewHandler';
import 'jasmine/src/jasmine';
import { IRenderedElement } from 'valdi_core/src/IRenderedElement';
import { ScrollView, ScrollViewInteractive } from 'valdi_tsx/src/NativeTemplateElements';
import { ElementFrame } from 'valdi_tsx/src/Geometry';

class FakeScrollView implements IRenderedElement<ScrollViewInteractive> {
  id = 1;
  key = 'scroll';
  tag = 'scroll';
  viewClass = 'ScrollView';
  children: IRenderedElement[] = [];
  parent = undefined;
  parentIndex = 0;
  renderer: any = undefined;
  emittingComponent = undefined;
  frame: ElementFrame = { x: 0, y: 0, width: 100, height: 200 };
  private attributes: Record<string, any> = {};

  getAttribute(name: keyof ScrollViewInteractive): any {
    return this.attributes[name as string];
  }
  setAttribute(name: keyof ScrollViewInteractive, value: any): boolean {
    this.attributes[name as string] = value;
    return true;
  }
  setAttributes(attrs: any): boolean {
    Object.assign(this.attributes, attrs);
    return true;
  }
  getAttributeNames(): (keyof ScrollViewInteractive)[] {
    return Object.keys(this.attributes) as (keyof ScrollViewInteractive)[];
  }
  getNativeView(): Promise<any> {
    throw new Error('not implemented');
  }
  getNativeNode(): any {
    return undefined;
  }
  takeSnapshot(): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }
  getVirtualNode(): any {
    return undefined;
  }
}

describe('ScrollViewHandler', () => {
  it('applies deferred attributes when element becomes available', () => {
    const handler = new ScrollViewHandler();
    handler.setAttribute('translationX', 10);
    handler.setAttributes({ contentOffsetX: 5, contentOffsetY: 6 });

    const element = new FakeScrollView();
    handler.onElementCreated(element);

    expect(element.getAttribute('translationX')).toBe(10);
    expect(element.getAttribute('contentOffsetX')).toBe(5);
    expect(element.getAttribute('contentOffsetY')).toBe(6);
  });

  it('clamps scroll offsets based on content size and frame', () => {
    const handler = new ScrollViewHandler();
    const element = new FakeScrollView();
    handler.onElementCreated(element);

    (handler as any).onContentSizeChange({ width: 150, height: 250 });
    handler.scrollToClamped(200, 400, false);

    expect(element.getAttribute('contentOffsetX')).toBe(50); // 150 - width 100
    expect(element.getAttribute('contentOffsetY')).toBe(50); // 250 - height 200
    expect(element.getAttribute('contentOffsetAnimated')).toBe(false);
  });
});
