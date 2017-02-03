'use strict';
var chai = require('chai');
var expect = chai.expect;
var rewire = require("rewire");
var sinonChai = require('sinon-chai');
var sinon = require('sinon');
chai.use(sinonChai);

describe('resource-manger', function () {
  var dataGetter;
  var structManager;
  var resourceManager;
  var revertResourceManager;
  var revertGetData;
  var struct;
  var queryData = gertQueryData();
  var converted = getConverted();


  beforeEach(function () {
    dataGetter = rewire('../lib/data-getter');
    structManager = rewire('../lib/struct-manager');
    resourceManager = rewire('../lib/resource-manager');
    revertResourceManager = structManager.__set__('resourceManager', resourceManager);
    revertGetData = structManager.__set__('getData', function () {}); // stub getData
    struct = getStruct();
  });
  afterEach(function () {
    revertResourceManager();
    revertGetData();
  });

  it('should console error if the database errors', function () {
    var revert = dataGetter.__set__('database', {
      add: function(){},
      query: function(query,cb){cb(true);} // callback with error
    });
    var revertQueryBuilder = dataGetter.__set__('queryBuilder', function(){return '';});
    var stubbedConsoleError = sinon.stub(console, "error");
    var stubCallback = sinon.stub();
    dataGetter({table: 'one', name: 'one', fields:{}}, [], stubCallback);
    expect(console.error).to.be.called;
    expect(stubCallback).to.be.called;
    stubbedConsoleError.restore();
    revert();
    revertQueryBuilder();
  });

  it('should format data', function () {
    var revert = dataGetter.__set__('database', {
      add: function(){},
      query: function(query,cb){cb(undefined, queryData);} // callback with data
    });
    var data;
    dataGetter(struct, [], function (error, _data) {
      data = _data;
    });

    data = sortData(data);
    // console.log(JSON.stringify(data.data, null, 2))
    // console.log(JSON.stringify(data.included, null, 2))
    converted = sortData(converted)
    expect(data).eql(converted);
    revert();
  });

  function sortData(data) {
    sortSet(data.data);
    sortSet(data.included);

    function sortSet(data) {
      data.sort(function (a, b) {
        var sortedObj = {};
        if (a.relationships) {
          Object.keys(a.relationships).sort(function (a, b) {
            if(a < b) return -1;
            if(a > b) return 1;
            return 0;
          }).forEach(function (key) {
            sortedObj[key] = {};
            sortedObj[key].data = a.relationships[key].data.sort(function (a, b) {
              return a.id - b.id;
            });
          })
          a.relationships = sortedObj;
        }

        return a.id - b.id;
      });
    }

    return data;
  }


  function getStruct() {
    resourceManager.define('menus', {
      fields: {
        id: {dataType: 'id'},
        name: {dataTpye: 'string'}
      },
      relationships: [
        'items.id'
      ]
    });
    resourceManager.define('items', {
      fields: {
        id: {dataType: 'id'},
        name: {dataTpye: 'string'}
      },
      relationships: [
        'modefiers.id'
      ]
    });
    resourceManager.define('modefiers', {
      fields: {
        id: {dataType: 'id'},
        name: {dataTpye: 'string'}
      }
    });
    var struct = structManager.define({
      id: 'menus.id',
      name: 'menus.name',
      items: structManager.define({
        id: 'items.id',
        name: 'items.name',
        modefiers: structManager.define({
          id: 'modefiers.id',
          name: 'modefiers.name'
        })
      })
    });
    struct.get([]);
    return struct;
  }
});


function gertQueryData() {
  return [
    {
      '0_menus_id': '1',
      '1_menus_name': 'one',
      '2_items_id': '1',
      '3_items_name': 'bagel',
      '4_modefiers_id': null,
      '5_modefiers_name': null
    },
    {
      '0_menus_id': '1',
      '1_menus_name': 'one',
      '2_items_id': '1',
      '3_items_name': 'bagel',
      '4_modefiers_id': '1',
      '5_modefiers_name': 'cream cheese'
    },
    {
      '0_menus_id': '1',
      '1_menus_name': 'one',
      '2_items_id': '2',
      '3_items_name': 'toast',
      '4_modefiers_id': null,
      '5_modefiers_name': null
    },
    {
      '0_menus_id': '2',
      '1_menus_name': 'two',
      '2_items_id': '3',
      '3_items_name': 'bacon',
      '4_modefiers_id': '2',
      '5_modefiers_name': 'more bacon'
    }
  ];
}

function getConverted() {
  return {
    "data": [
      {
        "id": '1',
        "type": "menus",
        "attributes": {
          "name": "one"
        },
        "relationships": {
          "items": {
            "data": [
              {
                "id": '2',
                "type": "items"
              },
              {
                "id": '1',
                "type": "items"
              }
            ]
          }
        }
      },
      {
        "id": '2',
        "type": "menus",
        "attributes": {
          "name": "two"
        },
        "relationships": {
          "items": {
            "data": [
              {
                "id": '3',
                "type": "items"
              }
            ]
          }
        }
      }
    ],
    "included": [
      {
        "id": '1',
        "type": "modefiers",
        "attributes": {
          "name": "cream cheese"
        },
        "relationships": {}
      },
      {
        "id": '1',
        "type": "items",
        "attributes": {
          "name": "bagel"
        },
        "relationships": {
          "modefiers": {
            "data": [
              {
                "id": '1',
                "type": "modefiers"
              }
            ]
          }
        }
      },
      {
        "id": '2',
        "type": "modefiers",
        "attributes": {
          "name": "more bacon"
        },
        "relationships": {}
      },
      {
        "id": '3',
        "type": "items",
        "attributes": {
          "name": "bacon"
        },
        "relationships": {
          "modefiers": {
            "data": [
              {
                "id": '2',
                "type": "modefiers"
              }
            ]
          }
        }
      }
    ]
  };
}
