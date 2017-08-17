var transformer = require('../../index');

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
    quantity: {dataType: transformer.NUMBER}
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
    price: {dataType: transformer.NUMBER}
  },

  relationships: [
    'addon_groups_addons.addon_id'
  ]
});
