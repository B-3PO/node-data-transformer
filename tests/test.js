var transformer = require('../index');
transformer.addDatabase({
  host: '127.0.0.1',
  user: 'root',
  database: 'bypass',
  connectionLimit: 10,
  default: true
});


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
    name: {dataType: transformer.STRING}
  },

  relationships: [
    'menu_items.menu_id',
    'location_menus.menu_id'
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
    'item_variants.item_id',
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





var locationStruct = transformer.defineStruct({
  id: 'locations.id',
  name: 'locations.name',

  menus: transformer.defineStruct({
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
  })
});



var start = clock();


locationStruct
  .get([320, 1])
  .toJSONAPI(function (data) {
    console.log(data.data[0].relationships);
  })
  .menus([100, 264], function (data) {
    // console.log(data.data)
  })
  // .menus()
  .toJSONAPI(function (data) {
    console.log(data.data[0].relationships);
  });

// locationStruct
//   .get([320, 1], function (data) {
//     // console.log('root', data.data);
//   })
//   .menus([100, 264], function (data) {
//     console.log('menus:', data.data);
//   })
//   .categories([], function (data) {
//     // console.log('categories:', data);
//   })
//   .toJSONAPI();
//   .items(function (data) {
//     var duration = clock(start);
//     console.log("Total Time "+duration+"ms");
//     console.log('end 4', data);
//   })
//   .jsonapi()
// );


function clock(start) {
  if ( !start ) return process.hrtime();
  var end = process.hrtime(start);
  return Math.round((end[0]*1000) + (end[1]/1000000));
}
