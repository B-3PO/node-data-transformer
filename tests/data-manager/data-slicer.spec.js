'use strict';
var chai = require('chai');
var expect = chai.expect;
var rewire = require("rewire");
var sinonChai = require('sinon-chai');
var sinon = require('sinon');
chai.use(sinonChai);

describe('resource-manger', function () {
  var dataSlicer;
  var structManager;
  var resourceManager;
  var resourceRevert;
  var revertDataManager;
  var rows;
  var attrs;
  var converted = getConverted();


  beforeEach(function () {
    dataSlicer = rewire('../../lib/data-manager/data-slicer');
    structManager = rewire('../../lib/struct-manager');
    revertDataManager = structManager.__set__('dataManager', function () {})
    resourceManager = rewire('../../lib/resource-manager');
    resourceRevert = structManager.__set__('resourceManager', resourceManager);
    rows = gertQueryData();
    attrs = getAttrs();
  });
  afterEach(function() {
    resourceRevert();
    revertDataManager();
  });

  it('should format data', function () {
    var data = dataSlicer(rows, attrs, getStruct());
    expect(data).eql(converted);
  });


  function getStruct() {
    resourceManager.define('menus', {
      fields: {
        id: {dataType: 'id'},
        name: {dataType: 'string'}
      },
      relationships: [
        'items.id'
      ]
    });
    resourceManager.define('items', {
      fields: {
        id: {dataType: 'id'},
        name: {dataType: 'string'}
      },
      relationships: [
        'modefiers.id'
      ]
    });
    resourceManager.define('modefiers', {
      fields: {
        id: {dataType: 'id'},
        name: {dataType: 'string'}
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

function getAttrs() {
  return  {
    'menus_id': {
      id: 0,
      table: 'menus',
      field: 'id',
      alias: '0_menus_id',
      config: 'menus',
      dataType: 'id'
    },
    'menus_name': {
      id: 1,
      table: 'menus',
      field: 'name',
      alias: '1_menus_name',
      config: 'menus',
      dataType: 'string'
    },
    'items_id': {
      id: 2,
      table: 'items',
      field: 'id',
      alias: '2_items_id',
      config: 'items',
      dataType: 'id'
    },
    'items_name': {
      id: 3,
      table: 'items',
      field: 'name',
      alias: '3_items_name',
      config: 'items',
      dataType: 'string'
    },
    'modefiers_id': {
      id: 4,
      table: 'modefiers',
      field: 'id',
      alias: '4_modefiers_id',
      config: 'modefiers',
      dataType: 'id'
    },
    'modefiers_name': {
      id: 5,
      table: 'modefiers',
      field: 'name',
      alias: '5_modefiers_name',
      config: 'modefiers',
      dataType: 'string'
    }
  };
}

function getConverted() {
  return {
    "menus": {
      "1": {
        "name": "one",
        "id": "1",
        "items": [
          {
            "name": "toast",
            "id": "2",
            "modefiers": []
          },
          {
            "name": "bagel",
            "id": "1",
            "modefiers": [
              {
                "name": "cream cheese",
                "id": "1"
              }
            ]
          }
        ]
      },
      "2": {
        "name": "two",
        "id": "2",
        "items": [
          {
            "name": "bacon",
            "id": "3",
            "modefiers": [
              {
                "name": "more bacon",
                "id": "2"
              }
            ]
          }
        ]
      },
      "$$arr": [
        {
          "name": "two",
          "id": "2",
          "items": [
            {
              "name": "bacon",
              "id": "3",
              "modefiers": [
                {
                  "name": "more bacon",
                  "id": "2"
                }
              ]
            }
          ]
        },
        {
          "name": "one",
          "id": "1",
          "items": [
            {
              "name": "toast",
              "id": "2",
              "modefiers": []
            },
            {
              "name": "bagel",
              "id": "1",
              "modefiers": [
                {
                  "name": "cream cheese",
                  "id": "1"
                }
              ]
            }
          ]
        }
      ]
    },
    "items": {
      "1": {
        "name": "bagel",
        "id": "1",
        "modefiers": [
          {
            "name": "cream cheese",
            "id": "1"
          }
        ]
      },
      "2": {
        "name": "toast",
        "id": "2",
        "modefiers": []
      },
      "3": {
        "name": "bacon",
        "id": "3",
        "modefiers": [
          {
            "name": "more bacon",
            "id": "2"
          }
        ]
      },
      "$$arr": [
        {
          "name": "bacon",
          "id": "3",
          "modefiers": [
            {
              "name": "more bacon",
              "id": "2"
            }
          ]
        },
        {
          "name": "toast",
          "id": "2",
          "modefiers": []
        },
        {
          "name": "bagel",
          "id": "1",
          "modefiers": [
            {
              "name": "cream cheese",
              "id": "1"
            }
          ]
        }
      ]
    },
    "modefiers": {
      "1": {
        "name": "cream cheese",
        "id": "1"
      },
      "2": {
        "name": "more bacon",
        "id": "2"
      },
      "$$arr": [
        {
          "name": "more bacon",
          "id": "2"
        },
        {
          "name": "cream cheese",
          "id": "1"
        }
      ]
    }
  };
}
