const getDefault = (val: any, fieldConf: FieldConf, context: EnvContext) => {
  if(typeof fieldConf.default === 'function') return fieldConf.default(val, context);

  return fieldConf.default;
}

export const validate = (varsConfig: ValidationConfig = []) => {
  // Our output config
  const config: EnvContext = {};

  // Any errors we encounter along the way
  const errors: string[] = [];

  // First preprocess all the env vars
  varsConfig.forEach((fieldConf) => {
    const {name, preProcess} = fieldConf;
    const raw = process.env[name];

    config[name] = typeof preProcess === 'function'
      ? preProcess(raw)
      : raw;
  });

  // Set up defaults, which may depend on other config vars
  varsConfig.forEach((fieldConf) => {
    const {name} = fieldConf;
    const val = config[name];

    if(typeof val === 'boolean') return;

    if(!!val) return;

    config[name] = getDefault(val, fieldConf, config);
  });

  // Run validations
  varsConfig.forEach((fieldConf) => {
    const {required, validations, name} = fieldConf;
    const val = config[name];

    // Check if required
    if (required && !val) {
      errors.push(`${name} is required`);
      return;
    }

    // We're done unless there are any validation rules
    if (!validations) return;

    // Apply validation rules
    validations.forEach((validation) => {
      if (validation.validate(val, config)) return;

      errors.push(`${name} ${validation.msg}`);
    });
  })

  if (errors.length > 0) {
    // tslint:disable-next-line
    console.error("\n" + 'ERROR: Please check your config var(s):' + "\n\n  " + errors.join("\n  ") + "\n");
    throw new Error('INVALID_CONFIG');
  }

  return config;
};
