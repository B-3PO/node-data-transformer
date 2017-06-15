'use strict';

var resourceManager = require('./resource-manager');
var debog = require('./debog');
var relLog = debog('relationships');
var queryLog = debog('query');

/**
  * @name query-builder
  * @module query-builder
  * @description
  * build and return query object
  *
  * @param {object} struct - structure
  * @param {array} ids - array of ids for calling specific peices fo data
  * @param {functon} callback - callback
  */
module.exports = function (struct, ids) {
  ids = [].concat(ids || []);
  var queryObj = buildQueries(struct);
  var query = 'SELECT '+getAttrQuery(queryObj)+' FROM '+queryObj.root.$$resource.table+'\n'+queryObj.joins.join('\n');
  if (ids && ids.length) {
    query += '\nWHERE '+queryObj.root.$$resource.table+'.'+queryObj.root.$$resource.idField+' IN ('+ids.join(',')+')'
  }
  if (queryLog.active) { queryLog.sql(query); }
  queryObj.query = query;
  return queryObj;
};

function buildQueries(struct, obj) {
  obj = obj || {
    attrs: {},
    root: struct,
    joins: [],
    joinedResources: [struct.$$resource.table]
  };
  addAttributes(struct, obj);

  // add struct join
  if (obj.root !== struct) { // is not root resource
    var relations = findRelations(struct.$$resource, struct.$$parent.$$resource);
    relations.forEach(function (rel) {
      // block from adding the same resource because of multiple fields with the same resource
      if (obj.joinedResources.indexOf(rel.resource.table) !== -1) { return; }
      obj.joins.push(buildRelationJoin(rel));
      obj.joinedResources.push(rel.resource.table);
    });
  }
  // add field level joins
  // there may be none if the fields contain no additional resources
  Object.keys(struct).forEach(function (key) {
    var item = struct[key];
    if (item.$$struct) { return; }
    if (obj.joinedResources.indexOf(item.resource.table) === -1) {
      var relations = findRelations(item.resource, struct.$$resource);
      relations.forEach(function (rel) {
        // block from adding the same resource because of multiple fields with the same resource
        if (obj.joinedResources.indexOf(rel.resource.table) !== -1) { return; }
        obj.joins.push(buildRelationJoin(rel));
        obj.joinedResources.push(rel.resource.table);
      });
    }
  });

  // recusively handle sub structures
  Object.keys(struct).forEach(function (key) {
    if (!struct[key].$$struct) { return; }
    buildQueries(struct[key], obj);
  });

  return obj;
}


function buildRelationJoin(rel) {
  return 'LEFT JOIN '+
    rel.resource.table+
    ' ON '+
    rel.resource.table+'.'+rel.resourceField+
    ' = '+
    rel.root.table+'.'+rel.rootField;
}


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
    arr = arr.reverse();
    return arr;
  }
  // bottom up
  pathFinder(resource, parentResource, {
    added: [],
    parent: resource,
    children: {}
  }, arr);
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
    arr = arr.reverse();
    logJoins(arr);
    relLog.unstash(relLog.chalk.green('path resolved'));
    return;
  }
  relLog.unstash(relLog.chalk.red('could not resolve path, will attemp'), relLog.chalk.yellow('reverse lookup'));

  // bottom up
  relLog.stash(relLog.chalk.yellow('reverse lookup'), relLog.chalk.magenta(parentResource.name), relLog.symbols.arrowLeft, relLog.chalk.magenta(resource.name));
  found = pathFinder(resource, parentResource, {
    added: [],
    parent: resource,
    children: {}
  }, arr);
  logJoins(arr);
  relLog.unstash(found ? relLog.chalk.green('path resolved') : relLog.chalk.red('could not resolve path'));
  if (found) { return; }


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

// TODO fix path finding. currently is not working with legs example
// walk resources for path
function pathFinder(a, b, path, arr, debug) {
  return (a.relationships || []).some(function (item) {
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
      reducePath(path.children[item.resource.name], arr);
      return true;
    }

    // continue finding on paths that have not been explored yet
    if (path.added.indexOf(item.resource.name) === -1) {
      path.added.push(item.resource.name);
      return pathFinder(item.resource, b, path.children[item.resource.name], arr, subDebug);
    }
  });
}

// turn nested path into flat array
function reducePath(path, arr) {
  while (path.item) {
    arr.push(path.item);
    path = path.parent;
  }
}


// flatten attribute object into comma deliminated string
function getAttrQuery(queryObj) {
  return Object.keys(queryObj.attrs).map(function (key) {
    return queryObj.attrs[key].table+'.'+queryObj.attrs[key].field+' AS '+queryObj.attrs[key].alias
  }).join(',');
}

function addAttributes(struct, obj) {
  Object.keys(struct).forEach(function (key) {
    if (struct[key].$$struct) { return; }
    var item = struct[key];
    var id = getUID();
    var name = item.resource.table+'_'+item.field;
    if (item.resource.fields[item.field] === undefined) {
      relLog('Resouce named "'+item.resource.name+'" is missing a field named "'+item.field+'" ');
    }

    // NOTE may want to make multipel hashes so we can lookup by mulple peices of info
    obj.attrs[name] = {
      id: id,
      table: item.resource.table,
      field: item.field,
      alias: id+'_'+name,
      config: item.resource[item.field],
      dataType: item.resource.fields[item.field].dataType
    };
  });
}

// uuids for attribute aliases
var uid = 0;
function getUID() {
  return ''+(uid++);
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
