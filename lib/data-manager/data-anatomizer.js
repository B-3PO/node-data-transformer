'use strict';

var formatters = require('./formatters');


module.exports = function (struct, dataPromise, rootCallback) {
  // invoke first picker by default
  return picker(struct, dataPromise, formatters())(arguments[arguments.length-1]);
};

// build object with picking functions for each type
// tack on formatting functions
function picker(struct, dataPromise, formatter, type) {
  var func = function (ids) {
    if (typeof ids === 'function') { ids = undefined; }
    var callback = arguments[arguments.length-1];

    // callback after data promise resolves
    dataPromise
      .then(function (dataObj) {
        if (type) { dataObj.root = extractType(dataObj.root, dataObj.slices, type); }
        if (ids) { dataObj.root = filterById(dataObj.root, ids); }
        if (typeof callback === 'function') { callback(formatter.format(dataObj.root)); }
        return dataObj;
      })
      .catch(function (err) { console.error(err.stack) });

    // build object of functions
    return Object.keys(struct)
      .filter(function (key) { return struct[key].$$struct; })
      .reduce(function (obj, key) {
        obj[key] = picker(struct[key], dataPromise, formatter, struct[key].$$resource.type);
        return obj;
      }, formatter.extend({}));
  };
  formatter.extend(func);
  return func;
}

// filter data based on type
function extractType(data, slices, type) {
  // return if no data or empty array
  if (!data || data.length === 0) { return data; }
  var ids = {};
  // filter the first item in array for the fieldname based on type
  var typeField = Object.keys(data[0].$$struct).filter(function (key) {
    return data[0].$$struct[key].$$resource && data[0].$$struct[key].$$resource.type === type;
  })[0];

  // derive list of ids from objects of specified type
  data.forEach(function (item) {
    item = item[typeField];
    if (item) {
      if (item instanceof Array) {
        item.forEach(function (sub) {
          ids[sub[sub.$$idField]] = true;
        });
      } else {
        ids[item[item.$$idField]] = true;
      }
    }
  });

  // filer the list from the derived list of ids
  return filterById(slices[type].$$arr, Object.keys(ids));
}


// filter objects based on an array or single id
function filterById(data, ids) {
  // convert ids to an array of strings
  ids = [].concat(ids).map(function (id) {
    return id.toString();
  });

  // filter
  if (ids && ids.length) {
    return data.filter(function (obj) {
      return ids.indexOf(obj.id.toString()) !== -1;
    });
  }

  // return original object
  return data;
}
