'use strict';

var dataMaker = require('./helpers/data-maker');
var chai = require('chai');
var expect = chai.expect;
var rewire = require("rewire");
var sinonChai = require('sinon-chai');
var sinon = require('sinon');
chai.use(sinonChai);

describe('query-builder', function () {
  var queryBuilder;
  var resultingQuery = 'SELECT menus.id AS 0_menus_id,menus.name AS 1_menus_name,items.id AS 2_items_id,items.name AS 3_items_name,modefiers.id AS 4_modefiers_id,modefiers.name AS 5_modefiers_name FROM menus\nLEFT JOIN items ON items.id = menus.id\nLEFT JOIN modefiers ON modefiers.id = items.id\nWHERE menus.id IN (1)';

  beforeEach(function () {
    queryBuilder = rewire('../lib/query-builder');
  });
  afterEach(function() {
    dataMaker.reset();
  });

  it('should return query', function () {
    var struct = dataMaker.getStruct();
    expect(queryBuilder(struct, [1]).query).to.equal(resultingQuery)
  });

});
