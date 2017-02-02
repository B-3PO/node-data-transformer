'use strict';

var mysql = require('mysql');
var queryLog = require('./debog')('query');
var dbs = {};


/**
  * @name database
  * @module database
  * @description
  * Manage database connections
  */
module.exports = {
  /**
   * @name add
   * @function
   * @description
   * Add database connection pool
   *
   * @param {object} config - database config object
   */
  add: add,

  /**
   * @name query
   * @function
   * @description
   * run query
   *
   * @param {string} query - Query string
   * @param {function} callback - callback

   */
  query: query,
};


function add(config) {
  validate(config);
  dbs[config.database] = {
    connectionLimit: config.connectionlimit || 100,
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
  };

  if (dbs.default === undefined) {
    dbs.default = dbs[config.database];
  }
}

function query(queryString) {
  return new Promise(function (resolve, reject) {
    var conn = mysql.createConnection(dbs.default);
    conn.connect()
    conn.query(queryString, function (error, data) {
      if (error) {
        queryLog(queryLog.chalk.red('MYSQL ERRORS\n'), error);
        reject(error);
      } else {
        resolve(data);
      }
    });
    conn.end()
  });
}

// validate config object
function validate(config) {
  if (typeof config !== 'object' || config === null){
    throw Error('Requires a config object');
  }

  if (typeof config.host !== 'string'){
    throw Error('Config requires a `host` property of type `string`');
  }

  if (typeof config.user !== 'string'){
    throw Error('Config requires a `user` property of type `string`');
  }

  if (typeof config.database !== 'string'){
    throw Error('Config requires a `database` property of type `string`');
  }
}
