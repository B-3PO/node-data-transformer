'use strict';

var dataTypes = require('./data-types');
var log = require('./debog')('struct');

module.exports = function (dataRows, queryAttrs, struct) {
  var sliced = {};
  var row;
  while (row = dataRows.pop()) {
    nest(row, struct, queryAttrs, sliced);
  }
  return sliced;
};


function nest(row, struct, attrs, sliced) {
  // id field alias for root item
  var idAlias = struct.$$resource.table+'_'+struct.$$resource.idField;
  idAlias = attrs[idAlias].alias;
  var objId = row[idAlias];
  if (objId === null) { return; }

  var keys;
  var key;
  var obj;
  var attr;
  var subItem;
  var subItemId;
  var structAttr;
  var type = struct.$$resource.type;

  // default sliced type array
  if (!sliced[type]) {
    sliced[type] = {};
    sliced[type].$$arr = [];
  }

  // create slice object and add it to type array
  if (!sliced[type][objId]) {
    obj = {};
    // add helper propertied for formatting
    Object.defineProperties(obj, {
      '$$type': {
        value: type,
        enumerable: false,
        configurable: false,
        writable: false
      },
      '$$idField': {
        value: struct.$$resource.idField,
        enumerable: false,
        configurable: false,
        writable: false
      },
      '$$struct': {
        value: struct,
        enumerable: false,
        configurable: false,
        writable: false
      }
    });

    // pick attr from data results using the aliased name
    keys = Object.keys(struct);
    while (key = keys.pop()) {
      structAttr = struct[key];
      if (!structAttr.$$struct) {
        attr = attrs[structAttr.resource.table+'_'+structAttr.field];
        if (!attr) { log('Resouce named "'+structAttr.resource.name+'" is missing a field named "'+structAttr.field+'" '); }
        if (!dataTypes.convert[attr.dataType]) { log('Field named "'+structAttr.field+'" in resouce "'+structAttr.resource.name+'" is missing a dataType '); }
        obj[key] = dataTypes.convert[attr.dataType](row[attr.alias]);
      }
    }

    // add build object
    if (!sliced[type][objId]) {
      sliced[type][objId] = obj;
      sliced[type].$$arr.push(obj);
    }
  } else {
    obj = sliced[type][objId];
  }

  // nest relationships
  keys = Object.keys(struct);
  while (key = keys.pop()) {
    structAttr = struct[key];
    if (structAttr.$$struct) {
      // TODO add ability for single relations
      // create relationship array
      // add helper object($$pushed) to track what has been added by id
      if (!obj[key]) {
        obj[key] = [];
        Object.defineProperty(obj[key], '$$pushed', {
          value: {},
          enumerable: false,
          configurable: false,
          writable: true
        });
      }

      // nest relationship
      subItem = nest(row, structAttr, attrs, sliced);
      if (subItem) {
        subItemId = subItem[structAttr.$$resource.idField];
        // prevent duplicate objects
        if (!obj[key].$$pushed[subItemId]) {
          obj[key].$$pushed[subItemId] = true;
          obj[key].push(subItem);
        }
      }
    }
  }

  return obj;
}
