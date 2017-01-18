'use strict';
var chai = require('chai');
var expect = chai.expect;
var rewire = require("rewire");
var sinonChai = require('sinon-chai');
var sinon = require('sinon');
chai.use(sinonChai);

describe('resource-manger', function () {
  var resourceManager;

  beforeEach(function () {
    resourceManager = rewire('../lib/resource-manager');
  });

  describe('define', function () {
    function define(name, config) {
      return function () {
        resourceManager.define(name, config);
      }
    }

    it('should throw because of missing config', function () {
      var def = define();
      expect(def).to.throw(Error);
    });

    it('should throw because name is not a string', function () {
      var def = define({}, {});
      expect(def).to.throw(Error);
    });

    it('should throw because no table exists', function () {
      var def = define('one', {});
      expect(def).to.throw(Error);
    });

    it('should throw because no fields exists', function () {
      var def = define('one', {
        table: 'one'
      });
      expect(def).to.throw(Error);
    });

    it('should throw because no id field exists', function () {
      var def = define('one', {
        table: 'one',
        fields: {
          name: {dataType: 'string'}
        }
      });
      expect(def).to.throw(Error);
    });

    it('should add resource', function () {
      var def = define('one', {
        table: 'tableone',
        fields: {
          id: {dataType: 'id'},
          name: {dataType: 'string'}
        },
        relationships: [ 'item' ]
      });

      expect(def).to.not.throw(Error);
    });

    it('should throw because resouce with same name is already defined', function () {
      define('one', {
        table: 'tableone',
        fields: {
          id: {dataType: 'id'},
          name: {dataType: 'string'}
        },
        relationships: [ 'item' ]
      })();

      var def = define('one', {
        table: 'tableone',
        fields: {
          id: {dataType: 'id'},
          name: {dataType: 'string'}
        },
        relationships: [ 'item' ]
      });

      expect(def).to.throw(Error);
    });
  });


  describe('get', function () {
    it('should log error if no resource was found', function () {
      var stubbedConsoleError = sinon.stub(console, "error");
      resourceManager.get('test');
      expect(console.error).to.be.called;
      stubbedConsoleError.restore();
    });

    it('should log error if no relation resource was found', function () {
      var stubbedConsoleError = sinon.stub(console, "error");
      resourceManager.define('one', {
        table: 'tableone',
        fields: {
          id: {dataType: 'id'},
          name: {dataType: 'string'}
        },
        relationships: [
          'two'
        ]
      });
      resourceManager.get('one');
      expect(console.error).to.be.called;
      stubbedConsoleError.restore();
    });

    it('should return resource obj', function () {
      resourceManager.define('one', {
        table: 'tableone',
        fields: {
          id: {dataType: 'id'},
          name: {dataType: 'string'}
        },
        relationships: [ 'two.id' ]
      });
      resourceManager.define('two', {
        table: 'tabletwo',
        fields: {
          id: {dataType: 'id'},
          name: {dataType: 'string'}
        }
      });
      var gotten = resourceManager.get('one');
      expect(gotten).to.be.an('object');
    });
  });

});
