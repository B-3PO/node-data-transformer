'use strict';

var resourceManager = require('./resource-manager');
var log = require('./debog')('struct');
var dataManager = require('./data-manager');

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
  define: define
};


function define(struct) {
  validate(struct);
  return Constructor(struct);
}

// validate incoming struct
function validate(struct) {
  if (typeof struct !== 'object' || struct === null){
    throw Error('Requires a struct object');
  }
}

function Constructor(struct) {
  Object.defineProperties(struct, {
    get: {
      value: get,
      enumerable: false,
      configurable: false,
      writable: false
    },
    $$struct: {
      value: true,
      configurable: false,
      enumerable: false,
      writable: false
    }
  });

  return struct;

  function get(ids) {
    ids = ids || [];
    return dataManager(build(struct), ids, arguments[arguments.length-1]);
  }
}

// check if structure has been built and return it
function build(struct, converted) {
  if (struct.$$built) { return struct; }
  Object.defineProperty(struct, '$$built', {
    value: true,
    configurable: false,
    writable: false,
    enumerable: false
  });
  return buildStruct(struct);
}

// recusively build struct and return it
function buildStruct(struct, parentStruct) {
  Object.keys(struct).forEach(function (key) {
    if (struct[key].$$struct) {
      buildStruct(struct[key], struct);
    } else {
      var resource = resourceManager.get(struct[key]);
      struct[key] = {
        resource: resource,
        field: struct[key].split('.')[1]
      };
      
      // set struct root resource based on resource idField
      if (resource.idField === key) {
        Object.defineProperty(struct, '$$resource', {
          value: resource,
          configurable: false,
          writable: false,
          enumerable: false
        });
      }
    }
  });

  // add parent structure reference
  if (parentStruct) {
    Object.defineProperty(struct, '$$parent', {
      value: parentStruct,
      configurable: false,
      writable: false,
      enumerable: false
    });
  }

  return struct;
}
