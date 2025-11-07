import { linearGradient } from 'widgets/src/styles/gradients';
import 'jasmine/src/jasmine';

describe('linearGradient', () => {
  it('should generate correctly', () => {
    const generated = linearGradient([
      ['red', 0],
      ['green', 0.5],
      ['blue', 1],
    ]);
    expect(generated).toEqual('linear-gradient(red 0, green 0.5, blue 1)');
  });
});
