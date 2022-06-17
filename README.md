# ENV validation library

This library is designed to support validating environment variables for a nodejs application of any kind. 

## How to use

In a file (e.g. `config.js`)
```js
require('dotenv').config();

const {validate, validations, preProcessors} = require('@learningalbum/env-validation');

const {castBool} = preProcessors;
const {mustBeOneOf, requiredIfPresent, requiredIfTrue} = validations;

const varsConfig = [
  // Array of variable configs (see below)
  {
    name: 'MY_VAR',
    require: true,
  }
]

// Get the validated vars into an object like {VAR1, VAR2, VAR3, etc} 
module.exports = validate(varsConfig);
```

Then in your application code, wherever you need config from your env, you do stuff like:

```js
const { MY_VAR } = require('config.js');
// Do something with MY_VAR
```

If MY_VAR doesn't validate in the way you've configured in config.js, the app won't even start and there will be an 
error message describing why.

### Variable configs

Declare each variable you want to validate. For full details on the interface, please see [the docs](https://pages.git.vzlt.cloud/learningalbum/lib-env-validation/) or `src/types.ts`. 

|key|type|required?|description|
|-|-|-|-|
|name|string|yes|the name of the variable to pick up from `process.env`|
|default|any|no|a default value to use|
|preProcess|`(val: any) => any`|no|function to transform the value before any validation|
|validations|array of `(val: any, context?: EnvContext) => boolean`|no|function to validate the value|
