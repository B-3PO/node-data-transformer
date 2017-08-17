var transformer = require('../../index');

transformer.defineResource('menus', {
  fields: {
    id: {dataType: transformer.ID},
    name: {dataType: transformer.STRING},
    tax_inclusive: {dataType: transformer.BOOLEAN}
  },

  relationships: [
    'menu_items.menu_id',
    {
      resource: 'venues.id',
      field: 'venue_id'
    }
  ]
});
