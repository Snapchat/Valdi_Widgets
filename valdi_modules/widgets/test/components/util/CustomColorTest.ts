import { customColorToRgbaString } from 'widgets/src/components/util/CustomColor';
import 'jasmine/src/jasmine';

describe('CustomColor', () => {
  it('converts to rgba string', () => {
    const rgba = customColorToRgbaString({ red: 10, green: 20, blue: 30, alpha: 0.5 });
    expect(rgba).toBe('rgba(10, 20, 30, 0.5)');
  });
});
