'use strict';

var dataMaker = require('../helpers/data-maker');
var chai = require('chai');
var expect = chai.expect;
var rewire = require("rewire");
var sinonChai = require('sinon-chai');
var sinon = require('sinon');
chai.use(sinonChai);

describe('resource-manger', function () {
  var dataSlicer;
  var rows;
  var attrs;
  var converted = dataMaker.getResultSliced();


  beforeEach(function () {
    dataSlicer = rewire('../../lib/data-manager/data-slicer');
    rows = dataMaker.gertQueryData();
    attrs = dataMaker.getAttrs();
  });
  afterEach(function() {
    dataMaker.reset();
  });

  it('should format data', function () {
    var data = dataSlicer(rows, attrs, dataMaker.getStruct());
    expect(data).eql(converted);
  });
});
