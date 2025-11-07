import { getSemanticColorWithAlpha, SemanticColor } from 'widgets/src/styles/semanticColors';
import 'jasmine/src/jasmine';

describe('SemanticColorTest', () => {
  it('Get Semantic Color With Alpha', async () => {
    // rgb
    const rgbColor = 'rgb(125, 125, 125)'; // currently no colors use rgb(r, g, b)
    try {
      getSemanticColorWithAlpha(rgbColor, 0.5);
      fail();
    } catch (error) {
      expect();
    }

    // predefined
    const predefinedColor = 'white'; // currently no colors use
    try {
      getSemanticColorWithAlpha(predefinedColor, 0.5);
      fail();
    } catch (error) {
      expect();
    }

    // rgba
    const rgbaColor = SemanticColor.Flat.CLEAR; // least likely to change
    const rgbaColorWithAlpha = getSemanticColorWithAlpha(rgbaColor, 0.5);
    expect(rgbaColorWithAlpha).toEqual('rgba(0, 0, 0, 0.5)');

    // hex
    const hexColor = SemanticColor.Flat.PURE_WHITE;
    const hexColorWithAlpha = getSemanticColorWithAlpha(hexColor, 0.5);
    expect(hexColorWithAlpha).toEqual('#FFFFFF80');
  });
});
