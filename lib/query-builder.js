var resourceManager = require('./resource-manager');



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
  ids = [].concat(ids);
  var queryObj = buildQueries(struct);
  var query = 'SELECT '+getAttrQuery(queryObj)+' FROM '+queryObj.root.$$resource.table+'\n'+queryObj.joins.join('\n');
  if (ids && ids.length) {
    query += '\nWHERE '+queryObj.root.$$resource.table+'.'+queryObj.root.$$resource.idField+' IN ('+ids.join(',')+')'
  }
  console.log(query)
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


// TODO add in proper error reporting if no relationship was found
// walk resources to find relationship path
function findRelations(resource, parentResource) {
  var arr = [];
  console.log(parentResource.name, resource.name)

  // top down
  pathFinder(parentResource, resource, {
    added: [],
    parent: parentResource,
    children: {}
  }, arr);
  if (arr.length) { return arr.reverse(); }

  // bottom up
  pathFinder(resource, parentResource, {
    added: [],
    parent: resource,
    children: {}
  }, arr);
  return arr;
}

// TODO fix path finding. currently is not working with legs example
// walk resources for path
function pathFinder(a, b, path, arr) {
  return (a.relationships || []).some(function (item) {
    path.children[item.resource.name] = {
      added: path.added,
      parent: path,
      item: item,
      children: {}
    };

    if (item.resource.name === b.name) {
      reducePath(path.children[item.resource.name], arr);
      return true;
    }

    if (path.added.indexOf(item.resource.name) === -1) {
      path.added.push(item.resource.name);
      // short return if path found
      return pathFinder(item.resource, b, path.children[item.resource.name], arr);
    }
  });
}

// run nested path into flat array
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

    // NOTE may want to make multipel hashes so we can lookup by mulple peices of info
    obj.attrs[name] = {
      id: id,
      table: item.resource.table,
      field: item.field,
      alias: id+'_'+name,
      config: item.resource[item.field]
    };
  });
}

// uuids for attribute aliases
var uid = 0;
function getUID() {
  return ''+(uid++);
}
