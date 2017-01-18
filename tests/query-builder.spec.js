// 'use strict';
// var chai = require('chai');
// var expect = chai.expect;
// var rewire = require("rewire");
// var sinonChai = require('sinon-chai');
// var sinon = require('sinon');
// chai.use(sinonChai);
//
// describe('query-builder', function () {
//   var resourceManager;
//   var queryBuilder;
//
//   beforeEach(function () {
//     resourceManager = require('../lib/resource-manager');
//     queryBuilder = rewire('../lib/query-builder');
//     queryBuilder.__set__('resource-manager', resourceManager);
//
//     //--- add resources for query builder to use ---
//
//     resourceManager.define('one', {
//       table: 'tableone',
//       fields: {
//         id: {dataType: 'id'},
//         name: {dataType: 'string'}
//       },
//       relationships: [
//         'two'
//       ]
//     });
//
//     resourceManager.define('two', {
//       table: 'tabletwo',
//       fields: {
//         id: {dataType: 'id'},
//         name: {dataType: 'string'}
//       }
//     });
//   });
//
//   // it('should return query', function () {
//   //
//   // });
//
// });
