import { castBool } from '../preProcessors';

describe('castBool', () => {
  it('casts the string "true" to true', () => {
    expect(castBool('true')).toBe(true);
  });

  it('casts the string "false" to false', () => {
    expect(castBool('false')).toBe(false);
  });

  it('casts any other string to false', () => {
    expect(castBool('yes')).toBe(false);
    expect(castBool('1')).toBe(false);
    expect(castBool('')).toBe(false);
  });

  it('passes booleans through unchanged', () => {
    expect(castBool(true)).toBe(true);
    expect(castBool(false)).toBe(false);
  });
});
