import { calcContentArea, splitInChunks, toPctStr } from 'widgets/src/components/grid/utils';
import 'jasmine/src/jasmine';
import { Device } from 'valdi_core/src/Device';

describe('grid utils', () => {
  it('converts to percent string', () => {
    expect(toPctStr(0.25)).toBe('25%');
  });

  it('splits array into chunks', () => {
    const result = splitInChunks([1, 2, 3, 4, 5], 2);
    expect(result).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('calculates content area from device metrics', () => {
    spyOn(Device, 'getDisplayHeight').and.returnValue(100);
    spyOn(Device, 'getDisplayTopInset').and.returnValue(10);
    spyOn(Device, 'getDisplayBottomInset').and.returnValue(5);

    expect(calcContentArea()).toBe(85);
  });
});
