var resources = {};

/**
  * @name resource-manager
  * @module resource-manager
  * @description
  * define and get resource
  */
module.exports = {
  /**
   * @name define
   * @function
   * @description
   * Define resourece
   *
   * @param {string} name - resourece name. used as jsonapi type
   * @param {object} config - resourece config object
   */
  define: define,

  /**
   * @name get
   * @function
   * @description
   * get resourece
   *
   * @param {string} path - resource name or dot seperated string to attribute
   * @return {object} resource
   */
  get: get
};



// get resource
function get(path) {
  var resourceName = path.indexOf('.') ? path.split('.')[0] : path;
  if (!resources[resourceName]) {
    console.error('No resouce found with the path "'+resourceName+'"');
    return undefined;
  }
  return transform(resources[resourceName]);
}

// define resouce
function define(name, config) {
  validate(name, config);
  config.name = name;
  resources[name] = config;
}

// transform resource
function transform(config) {
  if (config.$$transformed) { return config; }
  Object.defineProperty(config, '$$transformed', {
    value: true,
    configurable: false,
    writable: false,
    enumerable: false
  });
  // set id field
  Object.keys(config.fields).forEach(function (key) {
    if (config.fields[key].dataType && config.fields[key].dataType === 'id') {
      config.idField = key;
    }
  });
  config.relationships = (config.relationships || []).map(formatRelation);
  return config;
}

function formatRelation(relation) {
  var resourceSplit;
  var field;
  if (typeof relation === 'string') {
    resourceSplit = relation.split('.');
    field = 'id';
  } else {
    resourceSplit = relation.resource.split('.');
    field = relation.field || 'id';
  }
  return {
    resource: get(resourceSplit[0]), // replace string with resource object
    resourceRelationField: resourceSplit[1], // field name
    parentField: field // default is 'id'
  };
}




function validate(name, config) {
  if (typeof config !== 'object' || config === null){
    throw Error('Requires a config object');
  }

  if (typeof name !== 'string' || name === '') {
    throw Error('Requires a property `name` of type `string`');
  }

  if (resources[config.name] !== undefined) {
    throw Error('Resource with name of "' + config.name + '" already exists');
  }

  var hasId = false;
  Object.keys(config.fields).forEach(function (key) {
    if (config.fields[key].dataType && config.fields[key].dataType === 'id') { hasId = true; }
  });
  if (hasId === false) {
    throw Error('Requires a attribute with dataType `id`');
  }
}
