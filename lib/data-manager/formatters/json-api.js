'use strict';

var filter = require('./filter');

module.exports = function jsonapi(data) {
  var obj = {
    data: [],
    included: []
  };
  Object.defineProperty(obj, '$$types', {
    value: {},
    configurable: false, writable: true, enumerable: false
  });
  format(filter(data), obj, true);
  return obj;
};


function format(data, obj, root) {
  if (data instanceof Array) {
    return data.map(function (item) {
      return formatObj(item, obj, root);
    });
  } else {
    return formatObj(data, obj, root);
  }
}

function formatObj(data, obj, root) {
  if (!data) { return; }

  var key;
  var structAttr;
  var struct = data.$$struct;
  var built = {
    id: data[data.$$idField],
    type: data.$$type,
    attributes: {},
    relationships: {}
  };

  if (!obj.$$types[built.type]) { obj.$$types[built.type] = {}; }
  if (obj.$$types[built.type][built.id]) { return obj.$$types[built.type][built.id]; }

  // format attributes and relationships
  var keys = Object.keys(struct);
  while (key = keys.pop()) {
    structAttr = struct[key];
    if (structAttr.$$struct) {
      built.relationships[key] = formatRelationship(format(data[key], obj));
      if (structAttr.$$single) {
        if (built.relationships[key].data.length === 1) { built.relationships[key].data = built.relationships[key].data[0]; }
        else { built.relationships[key].data = null; }
      }
    } else {
      built.attributes[key] = data[key];
    }
  }

  // add item to jsonapi object
  if (root) {
    obj.data.push(built);
  } else {
    obj.included.push(built);
  }
  obj.$$types[built.type][built.id] = built;
  return built;
}


// format relationship object based on the jsonapi spec
function formatRelationship(data) {
  if (!data) { return; }
  if (data instanceof Array) {
    return {
      data: data.map(buildRelationship)
    };
  } else {
    // NOTE currently we are forcing everything to be an arr
    return {
      data: [buildRelationship(data)]
    }
  }
}

function buildRelationship(data) {
  return {
    id: data.id,
    type: data.type
  };
}
