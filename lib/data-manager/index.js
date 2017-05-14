'use strict';

var database = require('../database');
var queryBuilder = require('../query-builder');
var dataSlicer = require('./data-slicer');
var dataAnatomizer = require('./data-anatomizer');
var util = require('util');

module.exports = function (struct, ids) {
  var queryObj = queryBuilder(struct, ids);
  var dataPromise = database
    .query(queryObj.query)
    .then(function (data) {
      var slices = dataSlicer(data, queryObj.attrs, struct);
      return {
        root: slices[struct.$$resource.type].$$arr,
        subRoot: slices[struct.$$resource.type].$$arr,
        slices: slices
      };
    })
    .catch(function (err) { console.error(err.stack) });

  return dataAnatomizer(dataPromise, arguments[arguments.length-1]);
};
