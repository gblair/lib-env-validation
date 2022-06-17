export const castBool = (val: any) => {
  if (typeof val === 'boolean') return val;

  return val === 'true'
};
