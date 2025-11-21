import { GridView, GridViewWrapper } from 'widgets/src/components/grid/GridView';
import { splitInChunks, toPctStr } from 'widgets/src/components/grid/utils';
import 'jasmine/src/jasmine';

describe('GridView', () => {
  it('exports GridView class', () => {
    // Verify GridView class exists
    expect(GridView).toBeDefined();
    expect(typeof GridView).toBe('function');
  });

  it('exports GridViewWrapper class', () => {
    // Verify GridViewWrapper class exists
    expect(GridViewWrapper).toBeDefined();
    expect(typeof GridViewWrapper).toBe('function');
  });

  it('verifies GridView has expected prototype methods', () => {
    // Verify the component class has proper prototype methods
    expect(GridView.prototype.onRender).toBeDefined();
  });

  it('uses grid utility helpers correctly', () => {
    expect(splitInChunks([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [3, 4],
    ]);
    expect(toPctStr(0.25)).toBe('25%');
  });
});
