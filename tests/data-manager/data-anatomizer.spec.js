'use strict';

var dataMaker = require('../helpers/data-maker');
var chai = require('chai');
var expect = chai.expect;
var rewire = require("rewire");
var sinonChai = require('sinon-chai');
var sinon = require('sinon');
var util = require('util');
chai.use(sinonChai);

describe('data-types', function () {
  var dataSlicer;
  var dataAnatomizer;
  var attrs;
  var rows;
  var anatomizer;

  beforeEach(function () {
    dataSlicer = rewire('../../lib/data-manager/data-slicer');
    rows = dataMaker.gertQueryData();
    attrs = dataMaker.getAttrs();
    dataAnatomizer = rewire('../../lib/data-manager/data-anatomizer');

    var struct = dataMaker.getStruct();
    var slices = dataSlicer(rows, attrs, struct);
    var promise = Promise.resolve({
      root: slices[struct.$$resource.type].$$arr,
      subRoot: slices[struct.$$resource.type].$$arr,
      slices: slices
    });
    anatomizer = dataAnatomizer(struct, promise, arguments[arguments.length-1]);
  });
  afterEach(function() {
    dataMaker.reset();
  });

  it('should return json object', function (done) {
    anatomizer.toJSON(function (data) {
      expect(data).to.deep.equal(dataMaker.getResultJSON());
      done();
    });
  });


  it('should return json api object', function (done) {
    anatomizer.toJSONAPI(function (data) {
      expect(data).to.deep.equal(dataMaker.getResultJSONAPI());
      done();
    });
  });

  it('should return filtered object', function (done) {
    anatomizer.filter({
      id: function (value) {
        return value === '2'
      }
    }).toJSON(function (data) {
      expect(data).to.deep.equal([
        { name: 'two', id: '2', items: [{
            id: '3', name: 'bacon',
            modefiers: [{ id: '2',   name: 'more bacon' }]
          }] }
      ]);
      done();
    });
  });

  it('should return filtered object ids', function (done) {
    anatomizer
      .filter({
        id: function (value) {
          return value === '1'
        }
      })
      .items(['2'])
      .toJSON(function (data) {
        expect(data).to.deep.equal([
          { name: 'one', id: '1', items: [
              { name: "toast", id: "2", modefiers: [] }
            ] } ]);
        done();
      });
  });


  it('should return filtered object 2', function (done) {
    anatomizer
      .filter({
        id: function (value) {
          return value === '2'
        }
      })
      .items()
      .filter(function (data) {
        data.id !== '3'
      })
      .toJSON(function (data) {
        expect(data).to.deep.equal([
          { name: 'two', id: '2', items: [] } ]);
        done();
      });
  });

});
