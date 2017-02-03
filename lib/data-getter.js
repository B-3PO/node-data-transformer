var database = require('./database');
var queryBuilder = require('./query-builder');
var formaters = require('./formaters');

var DEFAULT_FORMATER = 'jsonapi';
var formatter = DEFAULT_FORMATER;


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
module.exports.setFormatter = function (value) {
  formatter = value;
};


function buildData(data, attrs, struct) {
  var dataSlices = [];
  var row = data.pop();
  while (row !== undefined) {
    dataSlices.push(nestRow(row, attrs, struct, {}));
    row = data.pop();
  }
  return formaters[formatter](dataSlices, struct);
}


// Creates slices of nested data
function nestRow(row, attrs, struct, nest) {
  var idAlias = struct.$$resource.table+'_'+struct.$$resource.idField;
  idAlias = attrs[idAlias].alias;
  if (row[idAlias] === null) { return null; }

  nest.$$type = struct.$$resource.type;
  Object.keys(struct).forEach(function (key) {
    var structAttr = struct[key];
    if (!structAttr.$$struct) {
      // get alias name to get row data
      var alias = structAttr.field;
      alias = structAttr.resource.table+'_'+alias;
      alias = attrs[alias].alias;
      nest[key] = row[alias];
    } else {
      nest[key] = nestRow(row, attrs, structAttr, {});
    }
  });
  return nest;
}
