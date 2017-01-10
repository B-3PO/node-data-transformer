var transformer = require('../index');
transformer.addDatabase({
  host: '127.0.0.1',
  user: 'root',
  database: 'bypass',
  connectionLimit: 10,
  default: true
});


// --- transformers ---

transformer.defineResource('menus', {
  table: 'menus',
  fields: {
    id: {dataType: transformer.ID},
    name: {dataTpe: transformer.STRING}
  },

  relationships: [
    'menu_items.menu_id'
  ]
});


transformer.defineResource('menu_items', {
  table: 'menu_items',
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
      field: 'item_id'
    },
    {
      resource: 'menus.id',
      field: 'menu_id'
    }
  ]
});

transformer.defineResource('items', {
  table: 'items',
  fields: {
    id: {dataType: transformer.ID},
    name: {dataTpe: transformer.STRING},
    price: {dataType: transformer.NUMBER}
  },

  relationships: [
    'menu_items.item_id'
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

menuStruct.get([], function (error, data) {
  // console.log(data);
  console.log('Done');
  process.exit(0);
});


// menuStruct.menuItems.get([], function (error, data) {
//   // console.log(data);
//   console.log('Done');
//   process.exit(0);
// });

// var menuRouter = transformer.routes(struct);
// var menuItemsRouter = transformer.Routes(struct.menuItems);
// var itemsRouter = transformer.routes('itmes');
// app.use('/menus', menuRouter);
// app.use('/menu_items', menuItemsRouter);
// app.use('/items', itemsRouter);
