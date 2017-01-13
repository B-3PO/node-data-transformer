var transformer = require('../index');
transformer.addDatabase({
  host: '127.0.0.1',
  user: 'root',
  database: 'bypass',
  connectionLimit: 10,
  default: true
});


// --- resources ---

transformer.defineResource('locations', {
  fields: {
    id: {dataType: transformer.ID},
    name: {dataTpe: transformer.STRING},
    description: {dataTpe: transformer.STRING},
    venue_id: {dataType: transformer.INT}
  },

  relationships: [
    'location_menus.location_id'
  ]
});

transformer.defineResource('location_menus', {
  fields: {
    id: {dataType: transformer.ID},
    location_id: {dataType: transformer.INT},
    menu_id: {dataType: transformer.INT}
  },

  relationships: [
    {
      resource: 'locations.id',
      field: 'location_id' // this is assum,ed to be id if not defined
    },
    {
      resource: 'menus.id',
      field: 'menu_id' // this is assum,ed to be id if not defined
    }
  ]
});

transformer.defineResource('menus', {
  fields: {
    id: {dataType: transformer.ID},
    name: {dataTpe: transformer.STRING}
  },

  relationships: [
    'menu_items.menu_id',
    'location_menus.menu_id' // TODO `findJoinRelation()`: coimment this out to break
  ]
});


transformer.defineResource('menu_items', {
  fields: {
    id: {dataType: transformer.ID},
    item_id: {dataType: transformer.INT},
    menu_id: {dataType: transformer.INT},
    name: {dataTpe: transformer.STRING},
    base_price: {dataType: transformer.NUMBER}
  },

  relationships: [
    {
      resource: 'items.id',
      field: 'item_id' // this is assum,ed to be id if not defined
    },
    {
      resource: 'menus.id',
      field: 'menu_id' // this is assum,ed to be id if not defined
    }
  ]
});

transformer.defineResource('items', {
  fields: {
    id: {dataType: transformer.ID},
    name: {dataTpe: transformer.STRING},
    price: {dataType: transformer.NUMBER}
  },

  relationships: [
    'menu_items.item_id',
    'item_variants.item_id'
  ]
});


transformer.defineResource('item_variants', {
  fields: {
    id: {dataType: transformer.ID},
    item_id: {dataTpe: transformer.INT},
    default_variant: {dataTpe: transformer.STRING},
    name: {dataType: transformer.STRING},
    price_cents: {dataType: transformer.INT}
  },

  relationships: [
    {
      resource: 'items.id',
      field: 'item_id'
    }
  ]
});


var menuStruct = transformer.defineStruct({
  id: 'menus.id',
  name: 'menus.name',

  menuItems: transformer.defineStruct({
    id: 'menu_items.id',
    name: 'items.name',
    base_price: 'items.base_price',
    price: 'menu_items.price'
  })
});

var locationStruct = transformer.defineStruct({
  id: 'locations.id',
  location_name: 'locations.name',

  menus: transformer.defineStruct({
    id: 'menus.id',
    name: 'menus.name',

    menuItems: transformer.defineStruct({
      id: 'menu_items.id',
      name: 'items.name',
      base_price: 'items.base_price',
      price: 'menu_items.price',

      variants: transformer.defineStruct({
        id: 'item_variants.id',
        name: 'item_variants.name'
      })
    })
  })
});

var start = clock();
locationStruct.get([41], function (error, data) {
  var duration = clock(start);
  console.log("Total Time "+duration+"ms");
  // console.log(data.data[0]);
  console.log(data[0]);
  process.exit(0);
});

// var start = clock();
// locationStruct.menus.menuItems.get([], function (error, data) {
//   var duration = clock(start);
//   console.log("Total Time "+duration+"ms");
//   console.log(data.data[0]);
//   process.exit(0);
// });

function clock(start) {
    if ( !start ) return process.hrtime();
    var end = process.hrtime(start);
    return Math.round((end[0]*1000) + (end[1]/1000000));
}



// var menuRouter = transformer.routes(struct);
// var menuItemsRouter = transformer.Routes(struct.menuItems);
// var itemsRouter = transformer.routes('itmes');
// app.use('/menus', menuRouter);
// app.use('/menu_items', menuItemsRouter);
// app.use('/items', itemsRouter);
