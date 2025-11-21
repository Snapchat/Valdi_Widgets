import { IndexViewHandler } from 'widgets/src/components/indexview/IndexViewHandler';
import 'jasmine/src/jasmine';

describe('IndexViewHandler', () => {
  it('creates and returns refs by symbol key', () => {
    const handler = new IndexViewHandler();
    const symbol = { key: 'A' };

    const ref1 = handler.getOrCreateRef(symbol);
    const ref2 = handler.getRef(symbol);

    expect(ref1).toBeDefined();
    expect(ref2).toBe(ref1);
  });
});
