module.exports = function (dataSlices, struct) {
  var formatted = {
    addedData: {},
    data: [],
    addedIncluded: {},
    included: [],
    relationshipIds: {}
  };
  var start = clock();
  format(dataSlices, struct, formatted, true);
  var duration = clock(start);
console.log("Took "+duration+"ms");
  return {
    data: formatted.data,
    included: formatted.included
  };
};
function clock(start) {
    if ( !start ) return process.hrtime();
    var end = process.hrtime(start);
    return Math.round((end[0]*1000) + (end[1]/1000000));
}


function format(arr, struct, obj, root) {
  if (!(arr instanceof Array)) { arr = [arr]; }
  var id;
  var item;
  var processed;
  var dataRoot;
  var addedRoot;
  var type = struct.$$root.name;
  var idField = struct.$$root.idField;
  var data = arr.pop();

  var built;
  var keys;
  var key;

  // set rel ids type obj
  while (data !== undefined) {
    id = data[idField];

    if (root) {
      dataRoot = obj.data;
      addedRoot = obj.addedData;
    } else {
      dataRoot = obj.included;
      addedRoot = obj.addedIncluded;
    }


    if (!addedRoot[type]) { addedRoot[type] = {}; }

    // add item and relation ships
    if (!addedRoot[type][id]) {
      built = {
        attributes: {},
        relationships: {}
      };
      keys = Object.keys(struct);
      key = keys.pop();
      while (key) {
        // attribute
        if (!struct[key].$$struct) {
          built.attributes[key] = data[key];
        // relationship
        } else {
          // TODO add meta data (type, toMany)
          built.relationships[key] = built.relationships[key] || {data:[]};
          // NOTE may need to add check for duplicates here.
          // TODO test for dups with third layer
          built.relationships[key].data.push({
            id: data[key][struct[key].$$root.idField],
            type: struct[key].$$root.name
          });
          format(data[key], struct[key], obj);
        }
        key = keys.pop();
      }

      addedRoot[type][id] = built;
      dataRoot.push(built);

    // item has already been added just add relationships
    } else {
      built = addedRoot[type][id];
      keys = Object.keys(struct);
      key = keys.pop();
      while (key) {
        // relationship
        if (struct[key].$$struct) {
          built.relationships[key] = built.relationships[key] || {data:[]};
          built.relationships[key].data.push({
            id: data[key][struct[key].$$root.idField],
            type: struct[key].$$root.name
          });
          format(data[key], struct[key], obj);
        }
        key = keys.pop();
      }
    }

    data = arr.pop();
  }
}
