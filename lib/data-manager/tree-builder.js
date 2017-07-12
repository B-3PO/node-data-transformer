exports.build = function build(struct, objs = [createSplitObj(struct)], currentObj = objs[0], parentStruct = undefined, tree = { branches:{} }) {
  if (parentStruct && containsResource(struct.$$resource, currentObj)) {
    currentObj = branchSplit(currentObj, parentStruct);
    objs.push(currentObj);
  }
  tree.branches[struct.$$resource.name] = {
    parent: tree,
    struct,
    resource: struct.$$resource,
    split: currentObj,
    branches: {},
  };
  addStruct(struct, currentObj);
  addFields(struct, currentObj);

  // recusively handle sub structures
  Object.keys(struct).forEach((key) => {
    if (!struct[key].$$struct) { return; }
    build(struct[key], objs, currentObj, struct, tree.branches[struct.$$resource.name]);
  });

  return {
    root: tree,
    splits: objs
  };
};


// --- new ---

function addStruct(struct, obj) {
  if (!struct.$$parent) { return; }
  if (obj.structs.indexOf(struct) === -1) {
    obj.structs.push(struct);
    obj.added.push(struct.$$resource.name);
  }
}

function addFields(struct, obj) {
  Object.keys(struct)
    .map(function (key) {
      return struct[key];
    })
    .every(function (item) {
      if (!item.$$struct && obj.added.indexOf(item.resource.name) === -1) {
        obj.added.push(item.resource.name);
        return false;
      }
      return true;
    });
}

function containsResource(resource, currentObj) {
  return currentObj.added.filter(a => a === resource.name).length > 0;
}

function createSplitObj(struct) {
  let obj = { structs: [], added: [] };
  if (struct) {
    obj.structs.push(struct);
    obj.added.push(struct.$$resource.name);
  }
  return obj;
}

function branchSplit(obj, parentStruct) {
  let newObj = createSplitObj();
  let matchedIndex = -1;
  newObj.structs = obj.structs.filter((joinedStruct, index) => {
    if (joinedStruct === parentStruct) { matchedIndex = index; }
    return index <= matchedIndex;
  });

  matchedIndex = matchedIndex + 1;
  if (matchedIndex >= obj.structs.length) { matchedIndex = obj.structs.length - 1; }
  var lastResource = obj.structs[matchedIndex].$$resource.name;
  var valid = true;
  newObj.added = obj.added.filter(resource => {
    if (resource === lastResource) {
      valid = false;
    }
    return valid;
  });

  return newObj;
}
