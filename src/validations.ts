export const mustBeOneOf = (list: any[]) => {
  return {
    validate: (val: any) => {
      return list.includes(val)
    },
    msg: 'must be one of: ' + list.join(', '),
  };
};

export const requiredIfPresent = (key: string) => {
  return {
    validate: (val: any, context: EnvContext) => {
      if (!context[key]) return true;

      return !!val;
    },
    msg: `is required when ${key} is present`,
  }
}

export const requiredIfTrue = (key: string) => {
  return {
    validate: (val: any, context: EnvContext) => {
      if (context[key] !== true) return true;

      return !!val;
    },
    msg: `is required when ${key} is true`,
  }
};
