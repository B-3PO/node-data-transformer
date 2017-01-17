var mysql = require('mysql');
var queryLog = require('./debog')('query');
var pools = {};


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
  query: query
};


function add(config) {
  validate(config);
  pools[config.database] = mysql.createPool({
    connectionLimit: config.connectionlimit || 100,
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
  });

  if (pools.default === undefined) {
    pools.default = pools[config.database];
  }
}


function query(query, callback) {
  // TODO allow for passing of db name so we can query from multiple databases
  // currently we are using the default db
  pools.default.getConnection(function(err, connection) {
    connection.query(query, function(err, rows, fields) {
      if (err !== null) {
        queryLog(queryLog.chalk.red('MYSQL ERRORS\n'), err);
        connection.release();
        callback(err);
        return;
      }

      connection.release();
      callback(undefined, rows);
    });
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
