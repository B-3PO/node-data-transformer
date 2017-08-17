require('./menu-resources');
var inspect = require('util').inspect;
var structures = require('./menu-structures');
var transformer = require('../index');
var venueMenuStructure = structures.venueMenus;
var venueItemsStructure = structures.venueItems;
transformer.addDatabase({
  host: '127.0.0.1',
  user: 'root',
  database: 'bypass',
  connectionLimit: 10,
  default: true
});


// venueItemsStructure
//   .get('86')
//   // .root('menus')
//   .toJSONAPI(function (data) {
//     // console.log(data);
//   });


venueMenuStructure.menus
  .queryFilter('items', { id: 24993 })
  .get([264, 2040])
  .toJSONAPI(function (data) {
    // console.log(inspect(data, false, null, true));
  });
