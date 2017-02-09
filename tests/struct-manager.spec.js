'use strict';
var chai = require('chai');
var expect = chai.expect;
var rewire = require("rewire");
var sinonChai = require('sinon-chai');
var sinon = require('sinon');
chai.use(sinonChai);

describe('resource-manger', function () {
  var structManager;
  var resourceRevert;

  beforeEach(function () {
    structManager = rewire('../lib/struct-manager');
    resourceRevert = structManager.__set__('resourceManager', require('../lib/resource-manager'));
  });

  describe('define', function () {
    function define(config) {
      return function () {
        structManager.define(config);
      }
    }

    it('should throw because of missing config', function () {
      var def = define();
      expect(def).to.throw(Error);
    });

    it('should return struct object', function () {
      var gotten = structManager.define({
        id: 'one.id',
        name: 'one.name'
      });
      expect(gotten).to.be.an('object');
    });
  });


  describe('struct.get', function () {
    var structure;
    beforeEach(function () {
      structure = structManager.define({
        id: 'one.id',
        name: 'one.name'
      });
    });


    it('should log error because no resource with name one exists', function () {
      function get() {
        structure.get();
      }
      var stubbedConsoleError = sinon.stub(console, "error");
      expect(get).to.throw(Error);
      expect(console.error).to.be.called;
      stubbedConsoleError.restore();
    });
  });
});
