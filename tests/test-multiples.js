var transformer = require('../index');
var util = require('util');

transformer.addDatabase({
  host: '127.0.0.1',
  user: 'root',
  database: 'bypass',
  connectionLimit: 10,
  default: true
});

transformer.defineResource('venues', {
  fields: {
    id: {dataType: transformer.ID},
    name: {dataType: transformer.STRING}
  },

  relationships: [
    'menus.venue_id',
    'menu_items.venue_id'
  ]
});

transformer.defineResource('menus', {
  fields: {
    id: {dataType: transformer.ID},
    name: {dataType: transformer.STRING}
  },

  relationships: [
    'menu_items.menu_id',
    {
      resource: 'venues.id',
      field: 'venue_id'
    }
  ]
});


transformer.defineResource('menu_items', {
  fields: {
    id: {dataType: transformer.ID},
    item_id: {dataType: transformer.INT},
    venue_id: {dataType: transformer.INT},
    menu_id: {dataType: transformer.INT},
    name: {dataType: transformer.STRING},
    price: {dataType: transformer.STRING}
  },

  relationships: [
    {
      resource: 'menus.id',
      field: 'menu_id'
    },
    {
      resource: 'items.id',
      field: 'item_id'
    },
    {
      resource: 'venues.id',
      field: 'venue_id'
    }
  ]
});

transformer.defineResource('items', {
  fields: {
    id: {dataType: transformer.ID},
    name: {dataType: transformer.STRING},
  },

  relationships: [
    'menu_items.item_id'
  ]
});



var struct = transformer.defineStruct({
  id: 'venues.id',
  name: 'venues.name',

  menus: transformer.defineStruct({
    id: 'menus.id',
    name: 'menus.name',

    menu_items: transformer.defineStruct({
      id: 'menu_items.id',
      name: 'items.name',
      price: 'menu_items.price'
    })
  }),


  venue_menu_items: transformer.defineStruct({
    id: 'menu_items.id',
    name: 'items.name',
    price: 'menu_items.price'
  })
});


struct
  .get('86')
  // .root('menu_items')
  .toJSONAPI(function (data) {
    // console.log(data.included.length);
    // console.log(data.data[0].relationships.venue_menu_items.data.length);
    // console.log(data.data[0].relationships.menus.data.length);
    // console.log(util.inspect(data.data[0], false, 2));
  });
