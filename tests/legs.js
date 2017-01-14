var transformer = require('../index');
transformer.addDatabase({
  host: '127.0.0.1',
  user: 'root',
  database: 'bypass',
  connectionLimit: 10,
  default: true
});


transformer.defineResource('menus', {
  fields: {
    id: {dataType: transformer.ID},
    name: {dataType: transformer.STRING}
  },

  relationships: [
    'menu_items.menu_id'
  ]
});



transformer.defineResource('categories', {
  fields: {
    alcohol: {dataType: transformer.BOOLEAN},
    id: {dataType: transformer.ID},
    limit: {dataType: transformer.INT},
    name: {dataType: transformer.STRING}
  },

  relationships: [
    'items.category_id'
  ]
});



transformer.defineResource('items', {
  fields: {
    alcohol: {dataType: transformer.BOOLEAN},
    base_price: {dataType: transformer.NUMBER},
    category_id: {dataType: transformer.INT},
    description: {dataType: transformer.STRING},
    id: {dataType: transformer.ID},
    name: {dataType: transformer.STRING}
  },

  relationships: [
    {
      resource: 'categories.id',
      field: 'category_id'
    },
    'menu_items.item_id'
  ]
});


transformer.defineResource('menu_items', {
  fields: {
    id: {dataType: transformer.ID},
    item_id: {dataType: transformer.INT},
    menu_id: {dataType: transformer.INT},
    name: {dataTpe: transformer.STRING},
    price: {dataType: transformer.NUMBER}
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


transformer.defineResource('item_variants', {
  fields: {
    id: {dataType: transformer.ID}
  },

  relationships: [
    {
      resource: 'items.id',
      field: 'item_id'
    },
    {
      resource: 'addon_groups_items.item_variant_id'
    }
  ]
});


transformer.defineResource('addon_groups_items', {
  fields: {
    id: {dataType: transformer.ID},
    name: {dataTpe: transformer.STRING}
  },

  relationships: [
    {
      resource: 'addon_groups.id',
      field: 'addon_group_id'
    },
    {
      resource: 'item_variants.id',
      field: 'item_variant_id'
    }
  ]
});


transformer.defineResource('addon_groups', {
  fields: {
    id: {dataType: transformer.ID}
  },

  relationships: [
    'addon_groups_addons.addon_group_id'
  ]
});


transformer.defineResource('addon_groups_addons', {
  fields: {
    id: {dataType: transformer.ID}
  },

  relationships: [
    {
      resource: 'addon_groups.id',
      field: 'addon_group_id'
    },
    {
      resource: 'addons.id',
      field: 'addon_id'
    }
  ]
});

transformer.defineResource('addons', {
  fields: {
    id: {dataType: transformer.ID},
    name: {dataTpe: transformer.STRING}
  },

  relationships: [
    'addon_groups_addons.addon_id'
  ]
});






var menuStruct = transformer.defineStruct({
  id: 'menus.id',
  name: 'menus.name',

  categories: transformer.defineStruct({
    id: 'categories.id',
    alcohol: 'categories.alcohol',
    limit: 'categories.limit',
    name: 'categories.name',

    items: transformer.defineStruct({
      id: 'menu_items.id',
      alcohol: 'items.alcohol',
      base_price: 'items.base_price',
      category_id: 'items.category_id',
      description: 'items.description',
      name: 'items.name',
      price: 'menu_items.price',

      modefiers: transformer.defineStruct({
        id: 'addon_groups.id',
        name: 'addon_groups_items.name',

        options: transformer.defineStruct({
          id: 'addons.id',
          name: 'addons.name'
        })
      })
    })
  })
});



transformer.setFormatter(transformer.JSON);
var start = clock();
menuStruct.get([41], function (error, data) {
  var duration = clock(start);
  console.log("Total Time "+duration+"ms");
  console.log(data[0].categories[1].items[0])
  console.log(data[0].categories[1].items[0].modefiers[0])
  process.exit(0);
});

function clock(start) {
    if ( !start ) return process.hrtime();
    var end = process.hrtime(start);
    return Math.round((end[0]*1000) + (end[1]/1000000));
}
