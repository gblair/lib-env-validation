import { validate } from '../validate';
import { castBool } from '../preProcessors';
import { mustBeOneOf, requiredIfPresent, requiredIfTrue } from '../validations';

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
  jest.restoreAllMocks();
});

describe('validate', () => {
  it('picks up values from process.env', () => {
    process.env.APP_NAME = 'my-app';

    const config = validate([{ name: 'APP_NAME' }]);

    expect(config.APP_NAME).toBe('my-app');
  });

  it('leaves unset vars undefined when no default is given', () => {
    delete process.env.MISSING_VAR;

    const config = validate([{ name: 'MISSING_VAR' }]);

    expect(config.MISSING_VAR).toBeUndefined();
  });

  describe('defaults', () => {
    it('applies the default when the var is unset', () => {
      delete process.env.PORT;

      const config = validate([{ name: 'PORT', default: '3000' }]);

      expect(config.PORT).toBe('3000');
    });

    it('does not apply the default when the var is set', () => {
      process.env.PORT = '8080';

      const config = validate([{ name: 'PORT', default: '3000' }]);

      expect(config.PORT).toBe('8080');
    });

    it('applies a function default with the current context', () => {
      delete process.env.PUBLIC_URL;
      process.env.HOST = 'example.com';

      const config = validate([
        { name: 'HOST' },
        { name: 'PUBLIC_URL', default: (val: any, ctx: EnvContext) => `https://${ctx.HOST}` },
      ]);

      expect(config.PUBLIC_URL).toBe('https://example.com');
    });

    it('applies the default when a preprocessed var is unset (castBool regression)', () => {
      delete process.env.FEATURE_FLAG;

      const config = validate([
        { name: 'FEATURE_FLAG', preProcess: castBool, default: true },
      ]);

      expect(config.FEATURE_FLAG).toBe(true);
    });

    it('does not clobber an explicit false with a default of true', () => {
      process.env.FEATURE_FLAG = 'false';

      const config = validate([
        { name: 'FEATURE_FLAG', preProcess: castBool, default: true },
      ]);

      expect(config.FEATURE_FLAG).toBe(false);
    });

    it('does not clobber an explicit true with a default of false', () => {
      process.env.FEATURE_FLAG = 'true';

      const config = validate([
        { name: 'FEATURE_FLAG', preProcess: castBool, default: false },
      ]);

      expect(config.FEATURE_FLAG).toBe(true);
    });
  });

  describe('preProcess', () => {
    it('transforms the raw value', () => {
      process.env.MAX_RETRIES = '5';

      const config = validate([
        { name: 'MAX_RETRIES', preProcess: (val) => parseInt(val, 10) },
      ]);

      expect(config.MAX_RETRIES).toBe(5);
    });

    it('is not called for unset vars', () => {
      delete process.env.MISSING_VAR;
      const preProcess = jest.fn();

      validate([{ name: 'MISSING_VAR', preProcess }]);

      expect(preProcess).not.toHaveBeenCalled();
    });
  });

  describe('postProcess', () => {
    it('transforms the value with the config as context', () => {
      process.env.HOST = 'example.com';
      process.env.PATH_PREFIX = 'api';

      const config = validate([
        { name: 'HOST' },
        { name: 'PATH_PREFIX', postProcess: (val, ctx) => `https://${ctx.HOST}/${val}` },
      ]);

      expect(config.PATH_PREFIX).toBe('https://example.com/api');
    });

    it('runs exactly once per var regardless of how many vars are configured', () => {
      process.env.VAR_A = 'a';
      process.env.VAR_B = 'b';
      process.env.VAR_C = 'c';
      const postProcess = jest.fn((val) => val + '!');

      const config = validate([
        { name: 'VAR_A', postProcess },
        { name: 'VAR_B' },
        { name: 'VAR_C' },
      ]);

      expect(postProcess).toHaveBeenCalledTimes(1);
      expect(config.VAR_A).toBe('a!');
    });

    it('runs after defaults are applied', () => {
      delete process.env.PORT;

      const config = validate([
        { name: 'PORT', default: '3000', postProcess: (val) => parseInt(val, 10) },
      ]);

      expect(config.PORT).toBe(3000);
    });
  });

  describe('required', () => {
    it('throws when a required var is missing', () => {
      delete process.env.API_KEY;

      expect(() => validate([{ name: 'API_KEY', required: true }])).toThrow('INVALID_CONFIG');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('API_KEY is required'));
    });

    it('passes when a required var is set', () => {
      process.env.API_KEY = 'secret';

      expect(() => validate([{ name: 'API_KEY', required: true }])).not.toThrow();
    });

    it('passes when a required var is satisfied by its default', () => {
      delete process.env.API_KEY;

      const config = validate([{ name: 'API_KEY', required: true, default: 'fallback' }]);

      expect(config.API_KEY).toBe('fallback');
    });

    it('treats an explicit false boolean as present', () => {
      process.env.FEATURE_FLAG = 'false';

      expect(() =>
        validate([{ name: 'FEATURE_FLAG', preProcess: castBool, required: true }])
      ).not.toThrow();
    });
  });

  describe('deprecated', () => {
    it('warns when a deprecated var is present', () => {
      process.env.OLD_VAR = 'still-here';

      validate([{ name: 'OLD_VAR', deprecated: true, message: 'Use NEW_VAR instead.' }]);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('OLD_VAR is deprecated. Use NEW_VAR instead.')
      );
    });

    it('does not warn when a deprecated var is absent', () => {
      delete process.env.OLD_VAR;

      validate([{ name: 'OLD_VAR', deprecated: true, message: 'Use NEW_VAR instead.' }]);

      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('validations', () => {
    it('passes when all validations pass', () => {
      process.env.NODE_ENV = 'production';

      expect(() =>
        validate([{ name: 'NODE_ENV', validations: [mustBeOneOf(['development', 'production'])] }])
      ).not.toThrow();
    });

    it('throws with the validation message when a validation fails', () => {
      process.env.NODE_ENV = 'staging';

      expect(() =>
        validate([{ name: 'NODE_ENV', validations: [mustBeOneOf(['development', 'production'])] }])
      ).toThrow('INVALID_CONFIG');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('NODE_ENV must be one of: development, production')
      );
    });

    it('collects errors across multiple vars', () => {
      delete process.env.API_KEY;
      process.env.NODE_ENV = 'staging';

      expect(() =>
        validate([
          { name: 'API_KEY', required: true },
          { name: 'NODE_ENV', validations: [mustBeOneOf(['development', 'production'])] },
        ])
      ).toThrow('INVALID_CONFIG');

      const output = (console.error as jest.Mock).mock.calls.map((args) => args[0]).join('\n');
      expect(output).toContain('API_KEY is required');
      expect(output).toContain('NODE_ENV must be one of');
    });

    it('supports context-dependent validations against cast values', () => {
      process.env.USE_REDIS = 'true';
      delete process.env.REDIS_URL;

      expect(() =>
        validate([
          { name: 'USE_REDIS', preProcess: castBool, default: false },
          { name: 'REDIS_URL', validations: [requiredIfTrue('USE_REDIS')] },
        ])
      ).toThrow('INVALID_CONFIG');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('REDIS_URL is required when USE_REDIS is true')
      );
    });

    it('supports requiredIfPresent across vars', () => {
      process.env.SMTP_HOST = 'smtp.example.com';
      delete process.env.SMTP_PASSWORD;

      expect(() =>
        validate([
          { name: 'SMTP_HOST' },
          { name: 'SMTP_PASSWORD', validations: [requiredIfPresent('SMTP_HOST')] },
        ])
      ).toThrow('INVALID_CONFIG');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('SMTP_PASSWORD is required when SMTP_HOST is present')
      );
    });
  });
});
