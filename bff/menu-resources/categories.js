var transformer = require('../../index');

transformer.defineResource('categories', {
  fields: {
    alcohol: {dataType: transformer.BOOLEAN},
    id: {dataType: transformer.INT},
    psuedo_id: {dataType: transformer.ID, concat: ['menus.id', '_', 'categories.id']},
    limit: {dataType: transformer.INT},
    name: {dataType: transformer.STRING},
    description: {dataType: transformer.STRING},
    position: {dataType: transformer.INT}
  },

  relationships: [
    {
      resource: 'items.category_id',
      field: 'id'
    }
  ]
});
