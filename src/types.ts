interface EnvContext {
  [key: string]: any;
}

type FieldValidator = (val: any, context?: EnvContext) => boolean;
type FieldPreprocessor = (val: any) => any;
type FieldPostprocessor = (val: any, context?: EnvContext) => any;

interface FieldValidation {
  validate: FieldValidator;
  msg: string;
}

interface FieldConf {
  name: string;
  default?: any;
  required?: boolean;
  preProcess?: FieldPreprocessor,
  postProcess?: FieldPostprocessor,
  validations?: FieldValidation[],
}

interface ValidationConfig extends Array<FieldConf> {}
