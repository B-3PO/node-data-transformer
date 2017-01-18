'use strict';
var chai = require('chai');
var expect = chai.expect;
var rewire = require("rewire");

describe('resource-manger', function () {
  var jsonapi;
  var converted = getConverted();
  var struct = getStruct();
  var slices = getSlices();

  beforeEach(function () {
    jsonapi = rewire('../../lib/formatters').jsonapi;
  });

  it('should convert to a single nested json structure', function () {
    var a = jsonapi(slices, struct);
    a.data = a.data.sort(function (a, b) {
      return a.id - b.id;
    });
    a.included = a.included.sort(function (a, b) {
      return a.id - b.id;
    });
    converted.data = converted.data.sort(function (a, b) {
      return a.id - b.id;
    });
    converted.included = converted.included.sort(function (a, b) {
      return a.id - b.id;
    });
    expect(a).eql(converted);
  });
});



function getStruct() {
  var struct = {
    id: '',
    name: '',
    items: {
      $$struct: true,
      id: '',
      name: '',
      modefiers: {
        $$struct: true,
        id: '',
        name: ''
      }
    }
  };
  Object.defineProperty(struct, '$$resource', {
    value: {
      type: 'menus',
      idField: 'id'
    },
    enumerable: false
  });
  Object.defineProperty(struct.items, '$$struct', {
    value: true,
    enumerable: false
  });
  Object.defineProperty(struct.items, '$$resource', {
    value: {
      type: 'items',
      idField: 'id'
    },
    enumerable: false
  });
  Object.defineProperty(struct.items.modefiers, '$$struct', {
    value: true,
    enumerable: false
  });
  Object.defineProperty(struct.items.modefiers, '$$resource', {
    value: {
      type: 'modefiers',
      idField: 'id'
    },
    enumerable: false
  });
  return struct;
}

function getSlices() {
  return [
    {
      $$type: 'menus',
      id: '1',
      name: 'one',
      items: {
        $$type: 'items',
        id: '1',
        name: 'bagel',
        modefiers: null
      }
    },
    {
      $$type: 'menus',
      id: '1',
      name: 'one',
      items: {
        $$type: 'items',
        id: '1',
        name: 'bagel',
        modefiers: {
          $$type: 'modefiers',
          id: '1',
          name: 'cream cheese',
        }
      }
    },
    {
      $$type: 'menus',
      id: '1',
      name: 'one',
      items: {
        $$type: 'items',
        id: '2',
        name: 'toast'
      }
    },
    {
      $$type: 'menus',
      id: '2',
      name: 'two',
      items: {
        $$type: 'items',
        id: '3',
        name: 'bacon',
        modefiers: {
          $$type: 'modefiers',
          id: '2',
          name: 'more bacon'
        }
      }
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
