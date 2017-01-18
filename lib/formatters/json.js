module.exports = function (dataSlices, struct) {
  var data = []; // return data
  var ids = {}; // track root ids
  var types = {}; // track data bhy type/id
  var related = {}; // track relationships by type/id
  dataSlices.forEach(function (item) {
    sliceToTypes(item, struct, types, related);
    if (!ids[item.id]) {
      ids[item.id] = true;
      data.push(types[item.$$type][item.id]);
    }
  });
  return data;
};

// turn slices into data split by type
// this uses objects to track items by type and id for performance
function sliceToTypes(slice, struct, types, related) {
  if (!slice) { return; }

  // default type
  if (!types[slice.$$type]) {
    types[slice.$$type] = {};
    related[slice.$$type] = {};
  }
  // check if type has been added
  if (!types[slice.$$type][slice.id]) {
    types[slice.$$type][slice.id] = copyAttributes(slice, struct); // add items attriburtes (no relations)
    related[slice.$$type][slice.id] = {}; // default relations tracker
  }
  var typeData = types[slice.$$type][slice.id];

  Object.keys(struct).forEach(function (key) {
    if (struct[key].$$struct) {
      var item = slice[key];
      if (!item) { return; }
      // recusivly structure data into types
      sliceToTypes(item, struct[key], types, related);

      // default type relationship data
      if (!typeData[key]) { typeData[key] = []; }
      if (!related[slice.$$type][slice.id][item.$$type]) {
        related[slice.$$type][slice.id][item.$$type] = {};
      }
      // relate data
      if (!related[slice.$$type][slice.id][item.$$type][item.id]) {
        related[slice.$$type][slice.id][item.$$type][item.id] = true;
        typeData[key].push(types[item.$$type][item.id]);
      }
    }
  });
}

// copy attriburtes of data
function copyAttributes(data, struct) {
  var obj = {};
  Object.keys(struct).forEach(function (key) {
    if (!struct[key].$$struct) { obj[key] = data[key]; }
  });
  return obj;
}
