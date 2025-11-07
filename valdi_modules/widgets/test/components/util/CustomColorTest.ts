import { CustomColor, customColorToRgbaString } from 'widgets/src/components/util/CustomColor';
import 'jasmine/src/jasmine';

describe('customcolorToRgbaStringTest', () => {
  it('should convert a Color object to an rgba string', () => {
    const color: CustomColor = { red: 255, green: 255, blue: 255, alpha: 0.1 };
    const result = customColorToRgbaString(color);
    expect(result).toBe('rgba(255, 255, 255, 0.1)');
  });
});
