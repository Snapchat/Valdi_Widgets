import { Card, CardShadow, CARD_RADIUS } from 'widgets/src/components/card/Card';
import 'jasmine/src/jasmine';

describe('Card', () => {
  it('exports Card class and constants', () => {
    // Verify Card class exists
    expect(Card).toBeDefined();
    expect(typeof Card).toBe('function');

    // Verify constants are exported correctly
    expect(CARD_RADIUS).toBe(10);
  });

  it('exports CardShadow enum values', () => {
    // Verify CardShadow enum values
    expect(CardShadow.NONE).toBeDefined();
    expect(CardShadow.DEFAULT).toBeDefined();
  });

  it('verifies Card has expected prototype methods', () => {
    // Verify Card has onRender method
    expect(Card.prototype.onRender).toBeDefined();
  });
});
