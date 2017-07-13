const debog = require('../debog');
const relLog = debog('relationships');
const queryLog = debog('query');

exports.build = function getQuery(ids) {
  ids = [].concat(ids || []);

  return (split) => {
    const struct = [].concat(split.structs)[0];
    const queryObj = buildQuery(struct, createQueryObj(struct), split);
    queryObj.query = `SELECT ${getAttrQuery(queryObj)} FROM ${queryObj.root.$$resource.table}\n${queryObj.joins.join('\n')}`;
    if (ids && ids.length) {
      queryObj.query += `\nWHERE ${queryObj.root.$$resource.table}.${queryObj.root.$$resource.idField} IN (${ids.join(',')})`;
    }
    return queryObj;
  };
};

function buildQuery(struct, obj, split) {
  addAttributes(struct, obj);
  addStructJoin(struct, obj);
  addFieldJoins(struct, obj);

  // recusively handle sub structures
  Object.keys(struct).forEach(function (key) {
    if (!struct[key].$$struct) { return; }
    if (split.structs.filter(function (a) { return a.$$resource.table === struct[key].$$resource.table}).length === 0) { return; }
    buildQuery(struct[key], obj, split, struct);
  });
  return obj;
}

function createQueryObj(struct) {
  var obj = {
    attrs: {},
    root: undefined,
    joins: [],
    joinedResources: []
  };
  if (struct) {
    obj.root = struct;
    obj.joinedResources.push(struct.$$resource.table);
  }
  return obj;
}

function addAttributes(struct, obj) {
  Object.keys(struct).forEach(function (key) {
    var item = struct[key];
    if (item.$$struct) { return; }
    var id = getUID();
    var name = item.resource.table+'_'+item.field;
    if (item. resource.fields[item.field] === undefined) {
      relLog('Resouce named "'+item.resource.name+'" is missing a field named "'+item.field+'" ');
    }
    // NOTE may want to make multipel hashes so we can lookup by mulple peices of info
    obj.attrs[name] = {
      id: id,
      table: item.resource.table,
      field: item.field,
      alias: id+'_'+name,
      config: item.resource.fields[item.field],
      dataType: item.resource.fields[item.field].dataType
    };
    Object.defineProperty(obj.attrs[name], '$$struct', {
      value: struct,
      enumerable: false, writable: false, configurable: false
    });
  });
}

// flatten attribute object into comma deliminated string
function getAttrQuery(queryObj) {
  return Object.keys(queryObj.attrs).map(function (key) {
    return queryObj.attrs[key].table+'.'+queryObj.attrs[key].field+' AS '+queryObj.attrs[key].alias
  }).join(',');
}


function addStructJoin(struct, obj) {
  if (!struct.$$parent || obj.joinedResources.indexOf(struct.$$resource.table) > -1) { return; }
  findRelations(struct.$$resource, struct.$$parent.$$resource).filter(function (rel) {
    return obj.joinedResources.indexOf(rel.resource.table) === -1;
  }).forEach(function (rel) {
    obj.joins.push(buildRelationJoin(rel));
    // add struct as joinedResource because the relation linked it up
    obj.joinedResources.push(rel.resource.table);
  });
}

function addFieldJoins(struct, obj) {
  Object.keys(struct).map(function (key) {
    return struct[key];
  }).filter(function (rel) {
    return !rel.$$struct && obj.joinedResources.indexOf(rel.resource.table) === -1;
  }).forEach(function (item) {
    findRelations(item.resource, struct.$$resource).filter(function (rel) {
      return obj.joinedResources.indexOf(rel.resource.table) === -1;
    }).forEach(function (rel) {
      obj.joins.push(buildRelationJoin(rel));
      obj.joinedResources.push(rel.resource.table);
    });
  });
}

function buildRelationJoin(rel) {
  return 'LEFT JOIN '+
    rel.resource.table+
    ' ON '+
    rel.resource.table+'.'+rel.resourceField+
    ' = '+
    rel.root.table+'.'+rel.rootField;
}


// flatten attribute object into comma deliminated string
function getAttrQuery(queryObj) {
  return Object.keys(queryObj.attrs).map(function (key) {
    return queryObj.attrs[key].table+'.'+queryObj.attrs[key].field+' AS '+queryObj.attrs[key].alias
  }).join(',');
}

// uuids for attribute aliases
var uid = 0;
function getUID() {
  return ''+(uid++);
}






// --- Path  Finding ---

// walk resources to find relationship path
function findRelations(resource, parentResource) {
  var arr = [];
  if (relLog.active) { debugRelations(resource, parentResource); }

  // top down
  var found = pathFinder(parentResource, resource, {
    added: [],
    parent: parentResource,
    children: {}
  }, arr);
  if (found) {
    reducePath(arr);
    return arr;
  }

  // NOTE bottum up is currently not working
  // bottom up
  // pathFinder(resource, parentResource, {
  //   added: [],
  //   parent: resource,
  //   children: {}
  // }, arr);
  return arr;
}


function debugRelations(resource, parentResource) {
  var arr = [];
  relLog.stash('lookup', relLog.chalk.magenta(parentResource.name), relLog.symbols.arrowRight, relLog.chalk.magenta(resource.name));

  // top down
  var found = pathFinder(parentResource, resource, {
    added: [],
    parent: parentResource,
    children: {}
  }, arr);
  if (found) {
    arr = reducePath(arr);
    logJoins(arr);
    relLog.unstash(relLog.chalk.green('path resolved'));
    return;
  }
  relLog.unstash(relLog.chalk.red('could not resolve path, will attemp'), relLog.chalk.yellow('reverse lookup'));

  // NOTE bottum up is currently not working
  // // bottom up
  // relLog.stash(relLog.chalk.yellow('reverse lookup'), relLog.chalk.magenta(parentResource.name), relLog.symbols.arrowLeft, relLog.chalk.magenta(resource.name));
  // found = pathFinder(resource, parentResource, {
  //   added: [],
  //   parent: resource,
  //   children: {}
  // }, arr);
  // logJoins(arr);
  // relLog.unstash(found ? relLog.chalk.green('path resolved') : relLog.chalk.red('could not resolve path'));
  // if (found) { return; }


  // run path again and logout bad pathways
  // this code is meant for debugging purposes only
  relLog.stash(relLog.chalk.bgYellow(relLog.chalk.black('debug Code')), relLog.chalk.magenta(parentResource.name), relLog.symbols.arrowRight, relLog.chalk.magenta(resource.name));
  pathFinder(parentResource, resource, {
    added: [],
    parent: parentResource,
    children: {}
  }, arr, true);
  relLog.unstash(relLog.chalk.bgYellow(relLog.chalk.black('debug Code')));
}

// walk resources for path
function pathFinder(a, b, path, arr, debug) {
  var relationships = [];
  // place end path in first position if found
  (a.relationships || []).every(item => {
    if (item.resource.name === b.name) {
      relationships.unshift(item);
      return false;
    }
    if (path.added.indexOf(item.resource.name) === -1) { relationships.push(item); }
    return true;
  });

  return relationships.some(function (item) {
    path.children[item.resource.name] = {
      added: path.added,
      parent: path,
      item: item,
      children: {}
    };

    // NOTE debug code
    var subDebug = debug;
    if (subDebug && relLog.active) {
      if (subDebug === true) { // root
        relLog.stash('Pathway that was used in attempt to find '+relLog.chalk.magenta(b.name)+' resource')
        subDebug = relLog.nest(item.root.name);
      } else { // create new groups for each layer
        subDebug = subDebug.nest(item.root.name);
      }
      subDebug.stash(item.resource.name);
    }
    // END Debug Code

    // path completed
    // convert to flat array and return true for sucessfull
    if (item.resource.name === b.name) {
      flattenPath(path.children[item.resource.name], arr);
      return true;
    }

    // continue finding on paths that have not been explored yet
    if (path.added.indexOf(item.resource.name) === -1) {
      path.added.push(item.resource.name);
      return pathFinder(item.resource, b, path.children[item.resource.name], arr, subDebug);
    }
  });
}

// remove unascasarry walking
function reducePath(arr) {
  if (arr.length === 1) { return arr; }
  arr.reverse();
  var copy = arr.map(function (a) {return a; });
  var place = copy.length - 1;
  while (place >= 0) {
    checkItem(copy[place]);
    place--;
  }
  return copy;


  function checkItem(item) {
    var i = 0;
    var length = place;

    for (i; i <= length; i++) {
      if (copy[i].root.name === item.root.name) { break; }
    }

    if (i < length) {
      var count = place - i;
      place -= count;
      copy.splice(i, count);
    }
  }
}

// turn nested path into flat array
function flattenPath(path, arr) {
  while (path.item) {
    arr.push(path.item);
    path = path.parent;
  }
}

function logJoins(arr) {
  arr.forEach(function (item) {
    relLog.stash('join %s %s %s on %s.%s = %s.%s',
      relLog.chalk.magenta(item.resource.name),
      relLog.symbols.arrowRight,
      relLog.chalk.magenta(item.root.name),
      relLog.chalk.magenta(item.resource.table),
      relLog.chalk.magenta(item.resourceField),
      relLog.chalk.magenta(item.root.table),
      relLog.chalk.magenta(item.rootField)
    );
  });
}
