var transformer = require('../../index');

transformer.defineResource('venues', {
  fields: {
    id: {dataType: transformer.ID}
  },

  relationships: [
    'menus.venue_id',
    'items.venue_id'
  ]
});
