// var asyncjs = require('async');

var JDBC = require('jdbc');
var jinst = require('jdbc/lib/jinst');
if (!jinst.isJvmCreated()) {
  jinst.setupClasspath(['./lib/drivers/AthenaJDBC41-1.0.0.jar']);
}

var config = {
  url: 'jdbc:awsathena://athena.us-east-1.amazonaws.com:443/',
  user : 'AKIAJGRPMBPFNMXPSGTA',
  password: 'vfTnkqBhHzi0j7iCDcTi1RkEP+arlrubIAHaEDKO',
  properties: {
    user : 'AKIAJGRPMBPFNMXPSGTA',
    password: 'vfTnkqBhHzi0j7iCDcTi1RkEP+arlrubIAHaEDKO',
    s3_staging_dir: 's3://aws-athena-query-results-562983362877-us-east-1/'
  }
};

var hsqldb = new JDBC(config);
hsqldb.initialize(function(err) {
  if (err) {
    console.log(err);
  }

  hsqldb.reserve(function(err, connObj) {
    console.log("Using connection: " + connObj.uuid);
    // Grab the Connection for use.
    var conn = connObj.conn;

    conn.createStatement(function(err, statement) {
      if (err) {
        console.error(err);
      } else {
        statement.executeQuery("SELECT * FROM elb_logs limit 10", function(err, resultset) {
          if (err) {
            console.error(err);
          } else {
            resultset.toObjArray(function(err, results) {
              console.log(results[0]);
            });
          }
        });
      }
    });
  });

});
