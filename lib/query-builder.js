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
  
  queryObj.query = query;
  return queryObj;
};




function buildQueries(struct, obj) {
  obj = obj || {
    attrs: {},
    root: struct,
    joins: [],
    joinedResources: [struct.$$resource.name]
  };

  addAttributes(struct, obj);

  // add struct join
  if (obj.root !== struct) { // is not root resource
    var relations = findRelationPath(struct.$$resource, struct.$$parent.$$resource);

    // TODO add in proper error reporting if no relationship was found
    relations.forEach(function (rel) {
      obj.joins.push(addRelationJoin(rel));
      obj.joinedResources.push(rel.root.table);
    });
  }

  // add filed level joins
  // there may be none if the fields contain no additional resources
  Object.keys(struct).forEach(function (key) {
    var item = struct[key];
    if (item.$$struct) { return; }
    if (obj.joinedResources.indexOf(item.resource.name) === -1) {
      var relations = findRelationPath(item.resource, struct.$$resource);
      relations.forEach(function (rel) {
        obj.joins.push(addRelationJoin(rel));
        obj.joinedResources.push(rel.root.table);
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

function addRelationJoin(rel) {
  return 'LEFT JOIN '+
    rel.root.table+
    ' ON '+
    rel.root.table+'.'+rel.rootField+
    ' = '+
    rel.resource.table+'.'+rel.resourceField;
}


// traverse in resources from bnoth directions to find rfelations
function findRelationPath(resource, parentResource) {
  // find relation on join resource
  var relationArr = (resource.relationships || []).filter(function (item) {
    return item.resource.name === parentResource.name;
  });
  // console.log(relationArr)
  if (relationArr.length) { return [relationArr[0]]; }

  // find relationship on parentResource resource
  relationArr = (parentResource.relationships || []).filter(function (item) {
    return item.resource.name === resource.name;
  });
  // console.log(relationArr)
  if (relationArr.length) { return [relationArr[0]]; }


  // -- check for join relation. this will add 2 relations --

  // from resource
  relationArr = findJoinRelation(resource, parentResource);
  if (relationArr.length) { return relationArr; }

  // from parent
  // TODO `findJoinRelation()`: fix function so this will work
  relationArr = findJoinRelation(parentResource, resource);
  if (relationArr.length) { return relationArr; }
}

// TODO cleanup and refactor code so it can find a join path from either direction
function findJoinRelation(resource, parentResource) {
  var relations = [];
  var parentRelations = (parentResource.relationships || []).map(function (item) {
    return item.resource.name;
  });
  resource.relationships.every(function (item) {
    if (parentRelations.indexOf(item.resource.name) > -1) {
      item.resource.relationships.every(function (subRel) {
        if (subRel.resource === parentResource) {
          relations.push(subRel); // join relation
          return false;
        }
        return true;
      });
      relations.push(item); // relation
      return false;
    }
    return true;
  });
  return relations;
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
