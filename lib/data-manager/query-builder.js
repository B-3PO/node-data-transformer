const debog = require('../debog');
const relLog = debog('relationships');
// const queryLog = debog('query');

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
  addStructJoin(struct, obj, split);
  addFieldJoins(struct, obj, split);

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
    var name = item.resource.table+'_'+key;
    if (item. resource.fields[key] === undefined) {
      relLog('Resouce named "'+item.resource.name+'" is missing a field named "'+key+'" ');
    }
    // NOTE may want to make multipel hashes so we can lookup by mulple peices of info
    obj.attrs[name] = {
      id: id,
      table: item.resource.table,
      field: key,
      alias: id+'_'+name,
      config: item.resource.fields[key],
      dataType: item.resource.fields[key].dataType
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


function addStructJoin(struct, obj, split) {
  if (!struct.$$parent || obj.joinedResources.indexOf(struct.$$resource.table) > -1) { return; }
  struct.$$resource.relationships.filter(function (rel) {
    return rel.root.table === struct.$$resource.table && rel.resource.table === struct.$$parent.$$resource.table;
  }).forEach(function (rel) {
    // join relation
    obj.joins.push(buildReverseRelationJoin(rel));
    // add struct as joinedResource because the relation linked it up
    obj.joinedResources.push(struct.$$resource.table);
  });
}

function addFieldJoins(struct, obj, split) {
  // there may be none if the fields contain no additional resources
  Object.keys(struct)
    .map(function (key) { return struct[key]; })
    .filter(function (item) {
      return !item.$$struct && obj.joinedResources.indexOf(item.resource.table) === -1;
    }).forEach(function (item) {
      item.resource.relationships.filter(function (rel) {
        return rel.root.table === item.resource.table && rel.resource.table === struct.$$resource.table;
      }).forEach(function (rel) {
        // join relation
        obj.joins.push(buildReverseRelationJoin(rel));
        // add struct as joinedResource because the relation linked it up
        obj.joinedResources.push(item.resource.table);
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

function buildReverseRelationJoin(rel) {
  return 'LEFT JOIN '+
    rel.root.table+
    ' ON '+
    rel.root.table+'.'+rel.rootField+
    ' = '+
    rel.resource.table+'.'+rel.resourceField;
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
