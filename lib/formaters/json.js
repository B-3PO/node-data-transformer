module.exports = function (dataSlices, struct) {
  var data = [];
  var types = {};
  var relationships = {};
  dataSlices.forEach(function (item) {
    formatSlice(item, struct, types, relationships, data, true);
  });
  return data;
};


function formatSlice(slice, struct, types, relationships, arr, root) {
  // check if item type has been added before
  if (!types[slice.$$type]) {
    types[slice.$$type] = {};
    relationships[slice.$$type] = {};
  }

  // check if tyope id has been added before
  if (!types[slice.$$type][slice.id]) {
    types[slice.$$type][slice.id] = copyData(slice, struct);
    relationships[slice.$$type][slice.id] = {};
  }
  var typeItem = types[slice.$$type][slice.id];
  var relItem = relationships[slice.$$type][slice.id];

  // if root then add item to return array
  if (root) { arr.push(typeItem); }

  // add and parse relationships
  Object.keys(struct).forEach(function (key) {
    if (struct[key].$$struct) {
      if (!relItem[key]) {
        relItem[key] = {};
        typeItem[key] = [];
      }

      // add item if it has not been added before
      if (!relItem[key][slice[key].id]) {
        relItem[key][slice[key].id] = true;
        typeItem[key].push(copyData(slice[key], struct[key]));
      }

      formatSlice(slice[key], struct[key], types, relationships, arr);
    }
  });
}

// copy only attributes
function copyData(data, struct) {
  var obj = {};
  Object.keys(struct).forEach(function (key) {
    if (!struct[key].$$struct) { obj[key] = data[key]; }
  });
  return obj;
}
