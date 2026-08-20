interface EnvContext {
  [key: string]: any;
}

// validate() always passes the full config as context, so validators and
// postprocessors may declare a required context param (or omit it entirely)
type FieldValidator = (val: any, context: EnvContext) => boolean;
type FieldPreprocessor = (val: any) => any;
type FieldPostprocessor = (val: any, context: EnvContext) => any;

interface FieldValidation {
  validate: FieldValidator;
  msg: string;
}

interface FieldConf {
  name: string;
  default?: any;
  required?: boolean;
  deprecated?: boolean;
  message?: string,
  preProcess?: FieldPreprocessor;
  postProcess?: FieldPostprocessor;
  validations?: FieldValidation[];
}

interface ValidationConfig extends Array<FieldConf> {}
