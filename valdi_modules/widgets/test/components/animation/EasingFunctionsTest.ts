import { EasingFunctions } from 'widgets/src/components/animation/EasingFunctions';
import 'jasmine/src/jasmine';

describe('EasingFunctions', () => {
  it('clamps input between 0 and 1', () => {
    expect(EasingFunctions.linear(-1)).toBe(0);
    expect(EasingFunctions.linear(2)).toBe(1);
  });

  it('computes standard easing curves', () => {
    expect(EasingFunctions.easeInQuad(0.5)).toBeCloseTo(0.25, 2);
    expect(EasingFunctions.easeOutQuad(0.5)).toBeCloseTo(0.75, 2);
    expect(EasingFunctions.easeInOutQuad(0.25)).toBeCloseTo(0.125, 3);
    expect(EasingFunctions.easeInOutQuad(0.75)).toBeCloseTo(0.875, 3);

    expect(EasingFunctions.easeInCubic(0.5)).toBeCloseTo(0.125, 3);
    expect(EasingFunctions.easeOutCubic(0.5)).toBeCloseTo(0.875, 3);
  });
});
