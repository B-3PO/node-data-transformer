'use strict';
var chai = require('chai');
var expect = chai.expect;
var rewire = require("rewire");
var sinonChai = require('sinon-chai');
var sinon = require('sinon');
chai.use(sinonChai);

describe('resource-manger', function () {
  var databaseManager;
  var mysql = require('mysql');
  var mysqlmock;
  var revertDatabaseManager;

  beforeEach(function () {
    databaseManager = rewire('../lib/database');
    mysqlmock = sinon.mock(mysql);
    revertDatabaseManager = databaseManager.__set__('mysql', mysql);
  });
  afterEach(function () {
    revertDatabaseManager();
  });

  describe('add', function () {
    function add(config) {
      return function () {
        databaseManager.add(config);
      }
    }

    it('should throw because of missing config', function () {
      var db = add();
      expect(db).to.throw(Error);
    });

    it('should throw because config is missing `host`', function () {
      var db = add({});
      expect(db).to.throw(Error);
    });

    it('should throw because config is missing `user`', function () {
      var db = add({
        host: 'localhost'
      });
      expect(db).to.throw(Error);
    });

    it('should throw because config is missing `database`', function () {
      var db = add({
        host: 'localhost',
        user: 'ben'
      });
      expect(db).to.throw(Error);
    });

    it('should not throw with correct config', function () {
      mysqlmock.expects('createConnection').once();
      databaseManager.add({
        host: 'localhost',
        user: 'ben',
        database: 'test'
      });
      databaseManager.query('');
      mysqlmock.verify();
      mysqlmock.restore();
    });
  });
});
