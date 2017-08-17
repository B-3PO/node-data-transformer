var transformer = require('../../index');

module.exports = transformer.defineStruct({
  id: 'venues.id',

  items: transformer.defineStruct({
    id: 'items.id',
    name: 'items.name',
    alcohol: 'items.alcohol',
    archived: 'items.archived',
    position: 'items.position',
    tare_weight: 'items.tare_weight',
    by_weight: 'items.by_weight',
    base_price: 'items.base_price',
    category_id: 'items.category_id',
    description: 'items.description',

    modefiers: transformer.defineStruct({
      id: 'addon_groups.id',
      name: 'addon_groups_items.name',

      options: transformer.defineStruct({
        id: 'addons.id',
        name: 'addons.name',
        price: 'addons.price',
        quantity: 'addon_groups_addons.quantity'
      })
    }),

    print_group: transformer.defineStruct({
      id: 'print_groups.id',
      name: 'print_groups.name',
      printer_name: 'print_groups.printer_name'
    }, true)
  })
});
