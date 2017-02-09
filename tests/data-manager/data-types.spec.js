'use strict';
var chai = require('chai');
var expect = chai.expect;
var rewire = require("rewire");
var sinonChai = require('sinon-chai');
var sinon = require('sinon');
chai.use(sinonChai);

describe('data-types', function () {
  var dataTypes;

  beforeEach(function () {
    dataTypes = rewire('../../lib/data-manager/data-types');
  });

  it('should return boolean', function () {
    expect(dataTypes.convert.boolean(1)).to.equal(true);
    expect(dataTypes.convert.boolean(true)).to.equal(true);
  });

  it('should convert id to string', function () {
    expect(dataTypes.convert.id(1)).to.equal('1');
  });

  it('should not convert int', function () {
    expect(dataTypes.convert.int(1)).to.equal(1);
  });

  it('should not convert number', function () {
    expect(dataTypes.convert.number(1)).to.equal(1);
  });

  it('should not convert number', function () {
    expect(dataTypes.convert.number(1.1)).to.equal(1.1);
  });

  it('should not convert string', function () {
    expect(dataTypes.convert.number('str')).to.equal('str');
  });

  it('should not convert uuid', function () {
    expect(dataTypes.convert.uuid('str')).to.equal('str');
  });

});
