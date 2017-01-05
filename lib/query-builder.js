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
  var query = 'SELECT '+getAttrQuery(queryObj)+' FROM '+queryObj.root.$$root.table+'\n'+queryObj.joins.join('\n');
  if (ids && ids.length) {
    query += '\nWHERE '+queryObj.root.$$root.table+'.'+queryObj.root.$$root.idField+' IN ('+ids.join(',')+')'
  }
  queryObj.query = query;
  return queryObj;
};

// flatten attribute object into comma deliminated string
function getAttrQuery(queryObj) {
  return Object.keys(queryObj.attrs).map(function (key) {
    return queryObj.attrs[key].table+'.'+queryObj.attrs[key].field+' AS '+queryObj.attrs[key].alias
  }).join(',');
}

// build query object
function buildQueries(struct, obj, parentResource) {
  obj = obj || {
    root: struct,
    attrs: {},
    joins: [],
    joinedResources: [struct.$$root.name]
  };

  addAttributes(struct, obj);

  // combine fields
  var joins = [];
  Object.keys(struct).forEach(function (key) {
    if (struct[key].$$struct) { return; }
    var item = struct[key];
    if (!joins[item.resource.name]) { joins[item.resource.name] = {resource: item.resource, fields: []}; }
    joins[item.resource.name].fields.push(item.field);
  });

  // default parent if not set
  if (!parentResource) {
    parentResource = struct.$$root;
  }

  // add joins
  Object.keys(joins).forEach(function (key) {
    var relations = getRelations(joins[key], parentResource);
    var relateResource = parentResource;
    relations.forEach(function (item) {
      // block from joining resource more than once
      if (obj.joinedResources.indexOf(item.resource.name) > -1) { return; }

      // add join
      obj.joins.push(
        'LEFT JOIN '+item.resource.table+' ON '+item.resource.table+'.'+item.resourceRelationField+' = '+relateResource.table+'.'+item.parentField
      );
      obj.joinedResources.push(item.resource.name);
      relateResource = item.resource;
    });
  });

  // recusively handle sub structures
  Object.keys(struct).forEach(function (key) {
    if (!struct[key].$$struct) { return; }
    buildQueries(struct[key], obj, struct[key].$$root);
  });

  return obj;


  // TODO refactor and make more generic
  // get relation object based on parent
  function getRelations(join, parentResource) {
    var relations = [];

    // find relation on join resource
    var relationArr = join.resource.relationships.filter(function (item) {
      return item.resource.name === parentResource.name;
    });
    if (relationArr.length) { return [relationArr[0]]; }

    // find relationship on parentResource resource
    relationArr = (parentResource.relationships || []).filter(function (item) {
      return item.resource.name === join.resource.name;
    });
    if (relationArr.length) { return [relationArr[0]]; }

    // check for join relation. this will add 2 relations
    var parentRelations = (parentResource.relationships || []).map(function (item) {
      return item.resource.name;
    });
    join.resource.relationships.every(function (item) {
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
