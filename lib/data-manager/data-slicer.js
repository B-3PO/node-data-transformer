const dataTypes = require('./data-types');
const log = require('../debog')('struct');
const resourceManager = require('../resource-manager');

module.exports = (dataRows, queryAttrs, struct, baseData) => {
  let sliced = baseData || {};
  let row;
  while (row = dataRows.pop()) {
    nest(row, struct, queryAttrs, sliced);
  }
  return sliced;
};


function nest(row, struct, attrs, sliced) {
  // id field alias for root item
  let idAlias = `${struct.$$resource.table}_${struct.$$resource.idField}`;
  if (!attrs[idAlias]) { return; }
  idAlias = attrs[idAlias].alias;
  let objId = row[idAlias];
  if (objId === null) { return; }
  let keys;
  let key;
  let obj;
  let attr;
  let subItem;
  let subItemId;
  let structAttr;
  let type = struct.$$resource.type;

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
      },
      '$$single': {
        value: struct.$$single,
        enumerable: false, configurable: false, writable: false
      }
    });

    // pick attr from data results using the aliased name
    keys = Object.keys(struct);
    while (key = keys.pop()) {
      structAttr = struct[key];
      // if (key === 'id') console.log(structAttr);
      if (!structAttr.$$struct) {
        attr = attrs[`${structAttr.resource.table}_${structAttr.field}`];
        if (!attr) { log(`Resouce named "${structAttr.resource.name}" is missing a field named "${structAttr.field}"`); }
        if (!dataTypes.convert[attr.dataType]) { log(`Field named "${structAttr.field}" in resouce "${structAttr.resource.name}" is missing a dataType`); }

        if (attr.config.concat) {
          obj[key] = attr.config.concat.reduce((a, b) => {
            if (b.indexOf('.') > 1) {
              var attrName = resourceManager.get(b).name + '_' + b.split('.')[1];
              console.log(b, attrName);
              // console.log(
              //   b,
              //   row[b.replace('.', '_')].alias
              //   // dataTypes.convert[attr.dataType](row[b.replace('.', '_')].alias)
              // );
              a += row[attrs[b.replace('.', '_')].alias];
            } else {
              a += b;
            }
            return a;
          }, '');
        } else {
          if (attr.alias.indexOf('category_id') > 0) console.log(attr.alias, row[attr.alias], key, dataTypes.convert[attr.dataType](row[attr.alias]));
          obj[key] = dataTypes.convert[attr.dataType](row[attr.alias]);
        }
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
