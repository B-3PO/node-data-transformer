'use strict';

module.exports = function jsonapi(data) {
  var obj = {
    data: [],
    included: []
  };
  format(data, obj, true);
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

  // format attributes and relationships
  var keys = Object.keys(struct);
  while (key = keys.pop()) {
    structAttr = struct[key];
    if (structAttr.$$struct) {
      built.relationships[key] = formatRelationship(format(data[key], obj));
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
