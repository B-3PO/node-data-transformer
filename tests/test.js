var util = require('util');
var fs = require('fs');
var transformer = require('../index');
// transformer.addDatabase({
//   host: '127.0.0.1',
//   user: 'root',
//   database: 'bypass',
//   connectionLimit: 10,
//   default: true
// });
transformer.addDatabase({
  host: 'menu-transformation.cd6beaqpt0ll.us-east-1.rds.amazonaws.com',
  user: 'brubin',
  password: 'sR5J8qWLkd436',
  database: 'menu-transform'
});


transformer.defineResource('locations', {
  fields: {
    id: {dataType: transformer.ID},
    name: {dataType: transformer.STRING},
    description: {dataType: transformer.STRING},
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
    name: {dataType: transformer.STRING},
    tax_inclusive: {dataType: transformer.BOOLEAN}
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
    name: {dataType: transformer.STRING},
    description: {dataType: transformer.STRING},
    position: {dataType: transformer.INT}
  },

  relationships: [
    'items.category_id'
  ]
});



// transformer.defineResource('items', {
//   fields: {
//     alcohol: {dataType: transformer.BOOLEAN},
//     base_price: {dataType: transformer.NUMBER},
//     category_id: {dataType: transformer.INT},
//     description: {dataType: transformer.STRING},
//     id: {dataType: transformer.ID},
//     name: {dataType: transformer.STRING}
//   },
//
//   relationships: [
//     {
//       resource: 'categories.id',
//       field: 'category_id'
//     },
//     'item_variants.item_id',
//     'menu_items.item_id'
//   ]
// });


transformer.defineResource('menu_items', {
  fields: {
    id: {dataType: transformer.ID},
    item_id: {dataType: transformer.INT},
    menu_id: {dataType: transformer.INT},
    name: {dataType: transformer.STRING},
    price: {dataType: transformer.STRING},
    cancelled: {dataType: transformer.BOOLEAN},
    state: {dataType: transformer.STRING}
  },

  relationships: [
    {
      resource: 'items.id',
      field: 'item_id'
    },
    {
      resource: 'menus.id',
      field: 'menu_id'
    },
    {
      resource: 'print_groups.id',
      field: 'print_group_id'
    },
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
    name: {dataType: transformer.STRING}
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
    id: {dataType: transformer.ID},
    quantity: {dataType: transformer.STRING}
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
    name: {dataType: transformer.STRING},
    price: {dataType: transformer.STRING}
  },

  relationships: [
    'addon_groups_addons.addon_id'
  ]
});


transformer.defineResource('print_groups', {
  fields: {
    id: {dataType: transformer.ID},
    printer_name: {dataType: transformer.STRING}
  },

  relationships: [
    'menu_items.print_group_id'
  ]
});


transformer.defineResource('tax_groups', {
  fields: {
    id: {dataType: transformer.ID}
  },

  relationships: [
    'items.tax_group_id',
    'tax_rates.tax_group_id'
  ]
});

transformer.defineResource('tax_rates', {
  fields: {
    id: {dataType: transformer.ID},
    rate: {dataType: transformer.STRING},
    receipt_label: {dataType: transformer.STRING}
  },

  relationships: [
    'tax_groups.id'
  ]
});


transformer.defineResource('items', {
  fields: {
    id: {dataType: transformer.ID},
    alcohol: {dataType: transformer.BOOLEAN},

    archived: {dataType: transformer.BOOLEAN},
    by_weight: {dataType: transformer.BOOLEAN},
    position: {dataType: transformer.INT},
    reporting_group_id: {dataType: transformer.INT},
    tare_weight: {dataType: transformer.STRING},

    base_price: {dataType: transformer.STRING},
    category_id: {dataType: transformer.INT},
    description: {dataType: transformer.STRING},
    name: {dataType: transformer.STRING}
  },

  relationships: [
    {
      resource: 'categories.id',
      field: 'category_id'
    },
    {
      resource: 'tax_groups.id',
      field: 'tax_group_id'
    },
    'item_variants.item_id',
    'menu_items.item_id'
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
      description: 'categories.description',
      position: 'categories.position',

      items: transformer.defineStruct({
        id: 'menu_items.id',
        alcohol: 'items.alcohol',

        archived: 'items.archived',
        by_weight: 'items.by_weight',
        cancelled: 'menu_items.cancelled',
        // catalog - is this used?
        category_id: 'categories.id',
        // disabled - is this used?
        // image_url - only used by mlbam and ocpo
        item_id: 'items.id',
        menu_id: 'menus.id',
        menu_name: 'menus.name',
        // option_types - is this used?
        // parts - is this used ?
        // plu - is this used? get from stock_items
        position: 'items.position',
        print_group_printer_name: 'print_groups.printer_name',
        reporting_group_id: 'items.reporting_group_id',
        // sides - is this used?
        // sku - is this used? get from stock_items. used for merchandise
        state: 'menu_items.state',
        tare_weight: 'items.tare_weight',
        tax_inclusive: 'menus.tax_inclusive',
        // toppings - is this used?
        unit_price: 'items.base_price',
        // upc - is this used? get from stock_items
        // upsales - is this used
        // variants - is this used?
        // weight - is this used



        description: 'items.description',
        name: 'items.name',
        price: 'menu_items.price',

        modifiers: transformer.defineStruct({
          id: 'addon_groups.id',
          name: 'addon_groups_items.name',

          options: transformer.defineStruct({
            id: 'addons.id',
            name: 'addons.name',
            price: 'addons.price',
            quantity: 'addon_groups_addons.quantity'
          })
        }),

        tax_rates: transformer.defineStruct({
          id: 'tax_rates.id',
          rate: 'tax_rates.rate',
          receipt_label: 'tax_rates.receipt_label'
        })
      }),
    })
  })
});



// var start = clock();
locationStruct
  .menus
  .get('7475')
  .categories()
  .items(function (items) {
    items.forEach(function (item) {
      item.disabled = false;
      item.catalog = null;
      item.image_url = '';
      item.option_types = [];
      item.parts = [];
      item.plu = null;
      item.sides = [];
      item.sku = null;
      item.toppings = [];
      item.upc = null;
      item.upsales = [];
      item.variants = [];
      item.weight = null;
      item.tax_rate = '0.0825';
    });
  })
  .modifiers(function (mods) {
    mods.forEach(function (item) {
      item.additional_price = null;
      item.limit_selection_to = null;
      item.require_selection = null;
      item.type = 'multi_selection';
    });
  })
  .toJSON(function (data) {
    // console.log(util.inspect(data, false, null));
    // console.log(util.inspect(data[0].categories[0].items[0], false, null));
    fs.writeFile('/Users/benrubin/Desktop/7475.json', '{ "categories": '+JSON.stringify(data[0].categories) + ', "meta":{"incorporated_menu_ids": [7575]}}', function (err, data) {
      if (err) {
        return console.log(err);
      }
      console.log('wrote it');
    });
  });


// locationStruct
//   .get(['320'])
//   // .filter(function (data) {
//   //   return true;
//   // })
//   .menus()
//   .filter({
//     id: function (value) {
//       return value === '264';
//     }
//   })
//   .toJSON(function (data) {
//     // console.log(data);
//   })
//   // // .menus([100, 264], function (data) {
//   // //   // console.log(data.data)
//   // // })
//   // .menus()
//   // .filter({
//   //   id: function (value) {
//   //     return value === '264' || value === '100';
//   //   }
//   // })
//   // .menus()
//   // .filter(function (data) {
//   //   return true;
//   // })
//   // .toJSONAPI(function (data) {
//   //
//   // });

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
