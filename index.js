var resourceManager = require('./lib/resource-manager');
var structManager = require('./lib/struct-manager');
var database = require('./lib/database');
var dataGetter = require('./lib/data-getter');


/**
  * @name node-mysql-jsonapi-transformer
  * @module node-mysql-jsonapi-transformer
  * @description
  * Transform data from mysql into jsonapi
  */
module.exports = {
  defineResource: resourceManager.define,
  defineStruct: structManager.define,
  addDatabase: addDatabase,
  setFormatter: dataGetter.setFormatter,

  // data types
  STRING: 'string',
  NUMBER: 'number',
  INT: 'int',
  ID: 'id',
  UUID: 'uuid',
  BOOLEAN: 'boolean',
  JSON: 'json',
  JSON_API: 'jsonapi'
};


/**
 * @name addDatabase
 * @function
 * @description
 * add database to manager
 *
 * @param {object} config - database config
 */
function addDatabase(config) {
  database.add(config);
}
