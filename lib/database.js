var mysql = require('mysql');
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
   * @name get
   * @function
   * @description
   * Get database pool by name
   *
   * @param {string} name - database name
   * @return {object} database pool
   */
  get: get,

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



function get(name) {
  return pools[name];
}

function add(config) {
  // TODO validate config

  pools[config.database] = mysql.createPool({
    connectionLimit: config.connectionlimit || 100,
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
  });

  if (config.default === true || pools.default === undefined) {
    pools.default = pools[config.database];
  }
}


function query(query, callback) {
  // TODO allow for passing of db name
  pools.default.getConnection(function(err, connection) {
    connection.query(query, function(err, rows, fields) {
      if (err !== null) {
        console.error(err);
        connection.release();
        callback(err);
        return;
      }

      connection.release();
      callback(undefined, rows);
    });
  });
}
