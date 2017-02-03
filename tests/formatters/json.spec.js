'use strict';
var chai = require('chai');
var expect = chai.expect;
var rewire = require("rewire");

describe('resource-manger', function () {
  var json;
  var converted = getConverted();
  var struct = getStruct();
  var slices = getSlices();

  beforeEach(function () {
    json = rewire('../../lib/formatters').json;
  });

  it('should convert to a single nested json structure', function () {
    expect(json(slices, struct)).eql(converted);
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
      id: 1,
      name: 'one',
      items: {
        $$type: 'items',
        id: 1,
        name: 'bagel',
        modefiers: null
      }
    },
    {
      $$type: 'menus',
      id: 1,
      name: 'one',
      items: {
        $$type: 'items',
        id: 1,
        name: 'bagel',
        modefiers: {
          $$type: 'modefiers',
          id: 1,
          name: 'cream cheese',
        }
      }
    },
    {
      $$type: 'menus',
      id: 1,
      name: 'one',
      items: {
        $$type: 'items',
        id: 2,
        name: 'toast'
      }
    },
    {
      $$type: 'menus',
      id: 2,
      name: 'two',
      items: {
        $$type: 'items',
        id: 3,
        name: 'bacon',
        modefiers: {
          $$type: 'modefiers',
          id: 2,
          name: 'more bacon'
        }
      }
    }
  ];
}

function getConverted() {
  return [
    {
      id: 1,
      items: [
        {
          id: 1,
          name: 'bagel',
          modefiers: [
            {
              id: 1,
              name: 'cream cheese'
            }
          ]
        },
        {
          id: 2,
          name: 'toast'
        }
      ],
      name: 'one'
    },
    {
      id: 2,
      items: [
        {
          id: 3,
          name: 'bacon',
          modefiers: [{
            id: 2,
            name: 'more bacon'
          }]
        }
      ],
      name: 'two'
    }
  ];
}
