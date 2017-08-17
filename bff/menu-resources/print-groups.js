var transformer = require('../../index');

transformer.defineResource('print_groups', {
  fields: {
    id: {dataType: transformer.ID},
    name: {dataType: transformer.STRING},
    printer_name: {dataType: transformer.STRING}
  },
  relationships: [
    'items.print_group_id'
  ]
});
