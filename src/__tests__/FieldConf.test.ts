import { validate } from '../validate';
import { castBool } from '../preProcessors';
import { mustBeOneOf } from '../validations';

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
  jest.restoreAllMocks();
});

// A field conf using every option at once, to catch interactions between them
test('a fully-loaded field conf runs preProcess, default, postProcess, and validations together', () => {
  process.env.LOG_LEVEL = 'debug';
  delete process.env.VERBOSE;

  const config = validate([
    {
      name: 'VERBOSE',
      preProcess: castBool,
      default: true,
      required: true,
    },
    {
      name: 'LOG_LEVEL',
      default: 'info',
      postProcess: (val) => val.toUpperCase(),
      validations: [mustBeOneOf(['DEBUG', 'INFO', 'WARN', 'ERROR'])],
    },
  ]);

  expect(config.VERBOSE).toBe(true);
  expect(config.LOG_LEVEL).toBe('DEBUG');
  expect(console.error).not.toHaveBeenCalled();
});
