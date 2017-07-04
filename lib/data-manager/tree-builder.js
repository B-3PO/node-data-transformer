exports.build = function build(struct, objs = [createSplitObj(struct)], currentObj = objs[0], parentStruct = undefined, tree = { branches:{} }) {
  if (parentStruct && containsStruct(struct, currentObj)) {
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

  // recusively handle sub structures
  Object.keys(struct).forEach((key) => {
    if (!struct[key].$$struct) { return; }
    build(struct[key], objs, currentObj, struct, tree.branches[struct.$$resource.name]);
  });

  return {
    root: tree,
    splits: objs,
  };
};

function addStruct(struct, obj) {
  if (!struct.$$parent) { return; }
  if (obj.structs.indexOf(struct) === -1) {
    obj.structs.push(struct);
  }
}

function containsStruct(struct, currentObj) {
  return currentObj.structs.filter(a => a.$$resource.name === struct.$$resource.name).length > 0;
}

function createSplitObj(struct) {
  let obj = { structs: [] };
  if (struct) { obj.structs.push(struct); }
  return obj;
}

function branchSplit(obj, parentStruct) {
  let newObj = createSplitObj();
  let matchedIndex = -1;
  newObj.structs = obj.structs.filter((joinedStruct, index) => {
    if (joinedStruct === parentStruct) { matchedIndex = index; }
    return index <= matchedIndex;
  });
  return newObj;
}
