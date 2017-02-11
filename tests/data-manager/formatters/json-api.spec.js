'use strict';

var dataMaker = require('../../helpers/data-maker');
var chai = require('chai');
var expect = chai.expect;
var rewire = require("rewire");
var sinonChai = require('sinon-chai');
var sinon = require('sinon');
chai.use(sinonChai);

describe('data-types', function () {
  var jsonapi;

  beforeEach(function () {
    jsonapi = rewire('../../../lib/data-manager/formatters/json-api');
  });
  afterEach(function () {
    dataMaker.reset();
  });

  it('should return json api result', function () {
    var struct = dataMaker.getStruct();
    var slices = dataMaker.getSliced();
    var a = jsonapi(slices[struct.$$resource.type].$$arr);
    expect(a).eql(dataMaker.getResultJSONAPI());
  });

  it('should return 1 data object', function () {
    var struct = dataMaker.getStruct();
    var slices = dataMaker.getSliced();
    var a = jsonapi(slices[struct.$$resource.type].$$arr[0]);
    expect(a.data.length).eql(1);
  });

  it('should return 1 data object', function () {
    var struct = dataMaker.getStruct();
    var slices = dataMaker.getSliced();
    var a = jsonapi(undefined);
    expect(a.data.length).eql(0);
  });

});
