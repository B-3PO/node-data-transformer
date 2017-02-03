'use strict';

var formatters = require('./formatters');

module.exports = function (struct, dataPromise) {
  // invoke first picker by default
  return picker(struct, dataPromise, formatters(dataPromise))(arguments[arguments.length-1]);
};

// build object with picking functions for each type
// tack on formatting functions
function picker(struct, dataPromise, formatter, type) {
  var func = function (ids) {
    if (typeof ids === 'function') { ids = undefined; }
    var callback = arguments[arguments.length-1];
    var holder;

    // callback after data promise resolves
    dataPromise
      .then(function (dataObj) {
        // track previous
        // this will be used by the filter function
        dataObj.previousRoot = dataObj.subRoot;
        dataObj.previousType = type;

        if (type) { dataObj.subRoot = filterOnIdAndType(dataObj.subRoot, ids, type); }
        if (typeof callback === 'function') { callback(formatter.format(dataObj.subRoot)); }
        return dataObj;
      })
      .catch(function (err) { console.error(err.stack) });

    // build object of functions
    return Object.keys(struct)
      .filter(function (key) { return struct[key].$$struct; })
      .reduce(function (obj, key) {
        obj[key] = picker(struct[key], dataPromise, formatter, struct[key].$$resource.type);
        return obj;
      }, formatter.extend({ filter: filter }));
  };
  func.filter = filter;

  return formatter.extend(func);

  // filter on top of previous data set
  function filter(obj) {
    dataPromise
      .then(function (dataObj) {
        if (!dataObj.previousType) {
          if (typeof obj === 'function') {
            dataObj.root = dataObj.root.filter(obj);
          } else {
            var keys = Object.keys(obj);
            dataObj.root = dataObj.root.filter(function (item) {
              return keys.filter(function (key) {
                return obj[key](item[key]);
              }).length > 0;
            });
          }
          return dataObj;
        }

        var typeField = getTypeFieldName(dataObj.previousRoot, dataObj.previousType);

        dataObj.previousRoot.forEach(function (item) {
          if (item[typeField]) {
            if (typeof obj === 'function') {
              item[typeField] = item[typeField].filter(obj);
            } else {
              var keys = Object.keys(obj);
              item[typeField] = item[typeField].filter(function (item) {
                return keys.filter(function (key) {
                  return obj[key](item[key]);
                }).length > 0;
              });
            }
          }
        });

        return dataObj;
      })
      .catch(function (err) { console.error(err.stack) });
    return this;
  }
}


function filterOnIdAndType(data, ids, type) {
  var typeArr = [];
  var typeField = getTypeFieldName(data, type);

  // no ids
  // return array of given `type`
  if (!ids) {
    data.forEach(function (item) {
      if (item[typeField]) { typeArr = typeArr.concat(item[typeField]); }
    });
    return typeArr;
  }

  // convert ids to an array of strings
  ids = [].concat(ids).map(function (id) {
    return id.toString();
  });

  // add items of given type to an array based on `ids`
  // delete/filter any items that are not in `ids`
  data.forEach(function (item) {
    if (item[typeField]) {
      if (item[typeField] instanceof Array) {
        item[typeField] = item[typeField].filter(function (sub) {
          return ids.indexOf(sub[sub.$$idField].toString()) > -1;
        });
        typeArr = typeArr.concat(item[typeField])
      } else if (ids.indexOf(item[typeField][item.$$idField].toStirng()) > -1) {
        typeArr = typeArr.push(item[typeField]);
      } else {
        delete item[typeField];
      }
    }
  });

  return typeArr;
}

// filter the first item in array for the fieldname based on type
function getTypeFieldName(data, type) {
  return Object.keys(data[0].$$struct).filter(function (key) {
    return data[0].$$struct[key].$$resource && data[0].$$struct[key].$$resource.type === type;
  })[0];
}
