'use strict';

var resourceManager = require('./lib/resource-manager');
var structManager = require('./lib/struct-manager');
var database = require('./lib/database');


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

  // data types
  BOOLEAN: 'boolean',
  ID: 'id',
  INT: 'int',
  NUMBER: 'number',
  STRING: 'string',
  UUID: 'uuid'
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
