var transformer = require('../../index');

transformer.defineResource('items', {
  fields: {
    id: {dataType: transformer.ID},
    name: {dataType: transformer.STRING},
    alcohol: {dataType: transformer.BOOLEAN},
    archived: {dataType: transformer.BOOLEAN},
    position: {dataType: transformer.INT},
    reporting_group_id: {dataType: transformer.INT},
    tare_weight: {dataType: transformer.STRING},
    by_weight: {dataType: transformer.BOOLEAN},
    base_price: {dataType: transformer.NUMBER},
    category_id: {dataType: transformer.INT},
    description: {dataType: transformer.STRING}
  },

  relationships: [
    {
      resource: 'venues.id',
      field: 'venue_id'
    },
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
    name: {dataType: transformer.STRING},
    price: {dataType: transformer.NUMBER},
    cancelled: {dataType: transformer.BOOLEAN},
    state: {dataType: transformer.STRING},
    print_group_id: {dataType: transformer.INT}
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
    }
  ]
});
