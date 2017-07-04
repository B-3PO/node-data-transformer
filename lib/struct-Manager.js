const resourceManager = require('./resource-manager');
const dataManager = require('./data-manager');

/**
  * @name struct-manager
  * @module struct-manager
  * @description
  * define and get structures
  */
module.exports = {
  /**
   * @name define
   * @function
   * @description
   * Define structure
   *
   * @param {object} struct - struct object
   */
  define,
};


function define(struct, single) {
  validate(struct);
  return Constructor(struct, single);
}

// validate incoming struct
function validate(struct) {
  if (typeof struct !== 'object' || struct === null) {
    throw Error('Requires a struct object');
  }
}

function Constructor(struct, single) {
  Object.defineProperties(struct, {
    get: {
      value: get,
      enumerable: false, configurable: false, writable: false
    },
    $$struct: {
      value: true,
      configurable: false, enumerable: false, writable: false
    },
    $$single: {
      value: !!single,
      configurable: false, enumerable: false, writable: false
    }
  });

  return struct;

  function get(ids = [], callback) {
    return dataManager(build(struct), ids, callback);
  }
}

// check if structure has been built and return it
function build(struct) {
  if (struct.$$built) { return struct; }
  Object.defineProperty(struct, '$$built', {
    value: true,
    configurable: false,
    writable: false,
    enumerable: false,
  });
  return buildStruct(struct);
}

// recusively build struct and return it
function buildStruct(struct, parentStruct) {
  let hasId = false;
  Object.keys(struct).forEach((key) => {
    if (struct[key].$$struct) {
      buildStruct(struct[key], struct);
    } else {
      const resource = resourceManager.get(struct[key]);
      struct[key] = {
        resource,
        field: struct[key].split('.')[1],
      };

      // set struct root resource based on resource idField
      if (resource.idField === key) {
        hasId = true;
        Object.defineProperty(struct, '$$resource', {
          value: resource,
          configurable: false,
          writable: false,
          enumerable: false,
        });
      }
    }
  });

  if (!hasId) {
    throw Error(`id field required for structure with name "${struct.name}"`);
  }

  // add parent structure reference
  if (parentStruct) {
    Object.defineProperty(struct, '$$parent', {
      value: parentStruct,
      configurable: false,
      writable: false,
      enumerable: false,
    });
  }

  return struct;
}
