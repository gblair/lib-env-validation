import { mustBeOneOf, requiredIfPresent, requiredIfTrue } from '../validations';

describe('mustBeOneOf', () => {
  const validation = mustBeOneOf(['a', 'b']);

  it('passes for a value in the list', () => {
    expect(validation.validate('a')).toBe(true);
  });

  it('fails for a value not in the list', () => {
    expect(validation.validate('c')).toBe(false);
  });

  it('includes the list in its message', () => {
    expect(validation.msg).toBe('must be one of: a, b');
  });
});

describe('requiredIfPresent', () => {
  const validation = requiredIfPresent('OTHER');

  it('passes when the other var is absent', () => {
    expect(validation.validate(undefined, {})).toBe(true);
  });

  it('passes when the other var is present and this one is set', () => {
    expect(validation.validate('value', { OTHER: 'set' })).toBe(true);
  });

  it('fails when the other var is present and this one is missing', () => {
    expect(validation.validate(undefined, { OTHER: 'set' })).toBe(false);
  });
});

describe('requiredIfTrue', () => {
  const validation = requiredIfTrue('FLAG');

  it('passes when the flag is not true', () => {
    expect(validation.validate(undefined, { FLAG: false })).toBe(true);
    expect(validation.validate(undefined, {})).toBe(true);
  });

  it('passes when the flag is the string "true" rather than a boolean', () => {
    expect(validation.validate(undefined, { FLAG: 'true' })).toBe(true);
  });

  it('passes when the flag is true and this var is set', () => {
    expect(validation.validate('value', { FLAG: true })).toBe(true);
  });

  it('fails when the flag is true and this var is missing', () => {
    expect(validation.validate(undefined, { FLAG: true })).toBe(false);
  });
});
