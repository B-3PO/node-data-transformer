var transformer = require('../../index');

module.exports = transformer.defineStruct({
  id: 'venues.id',

  menus: transformer.defineStruct({
    id: 'menus.id',
    name: 'menus.name',

    categories: transformer.defineStruct({
      id: 'categories.psuedo_id',
      category_id: 'categories.id',
      alcohol: 'categories.alcohol',
      limit: 'categories.limit',
      name: 'categories.name',
      description: 'categories.description',
      position: 'categories.position',

      menu_items: transformer.defineStruct({
        id: 'menu_items.id',
        price: 'menu_items.price',
        state: 'menu_items.state',

        item: transformer.defineStruct({
          id: 'items.id',
          name: 'items.name',
          alcohol: 'items.alcohol',
          archived: 'items.archived',
          position: 'items.position',
          tare_weight: 'items.tare_weight',
          by_weight: 'items.by_weight',
          base_price: 'items.base_price',
          category_id: 'items.category_id',
          description: 'items.description'

          // modefiers: transformer.defineStruct({
          //   id: 'addon_groups.id',
          //   name: 'addon_groups_items.name',
          //
          //   options: transformer.defineStruct({
          //     id: 'addons.id',
          //     name: 'addons.name',
          //     price: 'addons.price',
          //     quantity: 'addon_groups_addons.quantity'
          //   })
          // }),
          //
          // print_group: transformer.defineStruct({
          //   id: 'print_groups.id',
          //   name: 'print_groups.name',
          //   printer_name: 'print_groups.printer_name'
          // }, true)
        }, true)

        // modefiers: transformer.defineStruct({
        //   id: 'addon_groups.id',
        //   name: 'addon_groups_items.name',
        //
        //   options: transformer.defineStruct({
        //     id: 'addons.id',
        //     name: 'addons.name',
        //     price: 'addons.price',
        //     quantity: 'addon_groups_addons.quantity'
        //   })
        // }),
        //
        // print_group: transformer.defineStruct({
        //   id: 'print_groups.id',
        //   name: 'print_groups.name',
        //   printer_name: 'print_groups.printer_name'
        // }, true)
      }),

      // items: transformer.defineStruct({
      //   id: 'menu_items.id',
      //   alcohol: 'items.alcohol',
      //
      //   archived: 'items.archived',
      //   by_weight: 'items.by_weight',
      //   cancelled: 'menu_items.cancelled',
      //   // catalog - is this used?
      //   category_id: 'categories.id',
      //   // disabled - is this used?
      //   // image_url - only used by mlbam and ocpo
      //   item_id: 'items.id',
      //   menu_id: 'menus.id',
      //   menu_name: 'menus.name',
      //   // option_types - is this used?
      //   // parts - is this used ?
      //   // plu - is this used? get from stock_items
      //   position: 'items.position',
      //   // print_group_printer_name: 'print_groups.printer_name',
      //   reporting_group_id: 'items.reporting_group_id',
      //   // sides - is this used?
      //   // sku - is this used? get from stock_items. used for merchandise
      //   state: 'menu_items.state',
      //   tare_weight: 'items.tare_weight',
      //   tax_inclusive: 'menus.tax_inclusive',
      //   // toppings - is this used?
      //   unit_price: 'items.base_price',
      //   // upc - is this used? get from stock_items
      //   // upsales - is this used
      //   // variants - is this used?
      //   // weight - is this used
      //   description: 'items.description',
      //   name: 'items.name',
      //   price: 'menu_items.price',
      //
      //   modefiers: transformer.defineStruct({
      //     id: 'addon_groups.id',
      //     name: 'addon_groups_items.name',
      //
      //     options: transformer.defineStruct({
      //       id: 'addons.id',
      //       name: 'addons.name',
      //       price: 'addons.price',
      //       quantity: 'addon_groups_addons.quantity'
      //     })
      //   }),
      //
      //   // tax_rates: transformer.defineStruct({
      //   //   id: 'tax_rates.id',
      //   //   rate: 'tax_rates.rate',
      //   //   receipt_label: 'tax_rates.receipt_label'
      //   // })
      // })
    })
  })
});
