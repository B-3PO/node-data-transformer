var database = require('./database');
var queryBuilder = require('./query-builder');


/**
  * @name data-getter
  * @module data-getter
  * @description
  * Manage database connections
  *
  * @param {object} struct - structure
  * @param {array} ids - array of ids for calling specific peices fo data
  * @param {functon} callback - callback
  */
module.exports = function (struct, ids) {
  var callback = arguments[arguments.length-1];
  var queryObj = queryBuilder(struct, ids);
  database.query(queryObj.query, function (error, rows) {
    if (error) {
      console.error(error);
      callback(error)
      return;
    }
    callback(undefined, buildData(rows, queryObj.attrs, struct));
  });
};


// structure data into jsonapi
function buildData(data, attrs, struct) {
  // nest mysql row data based on struct
  var nestedData = [];
  var row = data.pop();
  while (row !== undefined) {
    nestedData.push(nestRow(row, attrs, struct, {}));
    row = data.pop();
  }

  // format data into jsonapi
  var formatted = {
    data: [],
    included: {}
  };
  format(nestedData, struct, formatted, true);
  return formatted;
}

// nest row data
function nestRow(row, attrs, struct, nest) {
  Object.keys(struct).forEach(function (key) {
    if (!struct[key].$$struct) {
      nest[key] = row[attrs[struct[key].resource.table+'_'+key].alias];
    } else {
      nest[key] = nestRow(row, attrs, struct[key], {});
    }
  });
  return nest;
}

// TODO add meta data for type and toMany
function format(arr, struct, obj, root) {
  if (!(arr instanceof Array)) { arr = [arr]; }
  var structKeys;
  var structKey;
  var item;
  var data = arr.pop();

  // create items
  while (data !== undefined) {
    item = {
      id: data[struct.$$root.idField],
      type: struct.$$root.name,
      attributes: {}
    };
    structKeys = Object.keys(struct);
    structKey = structKeys.pop();

    // add attributes
    while (structKey !== undefined) {
      if (!struct[structKey].$$struct) { item.attributes[structKey] = data[structKey]; }
      else { format(data[structKey], struct[structKey], obj); }
      structKey = structKeys.pop();
    }

    // add object wither to data ro include
    if (root) { obj.data.push(item); }
    else {
      if (!obj.included[item.type]) { obj.included[item.type] = {}; }
      obj.included[item.type][item.id] = item;
    }
    data = arr.pop();
  }
}
