var resourceManager = require('./resource-manager');
var getData = require('./data-getter');


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
  return struct = Constructer(struct);
}

// validate incoming struct
function validate(struct) {
  if (typeof struct !== 'object' || struct === null){
    throw Error('Requires a struct object');
  }
}

// Create new struct object
function Constructer(struct) {
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

  // ids = array of ids
  function get(ids, callback) {
    // build(struct);
    var now = Date.now();
    getData(build(struct), ids, function (error, data) {
      callback(error, data)
    });
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
function buildStruct(struct) {
  var resources = [];
  Object.keys(struct).forEach(function (key) {
    if (struct[key].$$struct) {
      buildStruct(struct[key]);
    } else {
      var resource = resourceManager.get(struct[key]);
      resources.push(resource);
      struct[key] = {
        resource: resource,
        field: struct[key].split('.')[1]
      };
    }
  });

  // set struct root
  var root;
  resources.forEach(function (item) {
    // root is undefined
    //  OR
    // root does not have item as relationField
    //  AND
    // item has root as relation
    if (root === undefined || (!containsRelation(root, item) && containsRelation(item, root))) {
      root = item;
    }
  });
  Object.defineProperty(struct, '$$root', {
    value: root,
    configurable: false,
    writable: false,
    enumerable: false
  });
  return struct;
}

function containsRelation(root, relation) {
  var contains = false;
  (root.relationships || []).forEach(function (rel) {
    if (rel.resource === relation) { contains = true; }
  });
  return contains;
}
