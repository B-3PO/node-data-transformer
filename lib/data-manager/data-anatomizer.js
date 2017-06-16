'use strict';

var formatters = require('./formatters');


module.exports = function (dataPromise) {
  var formatter = formatters(dataPromise);
  return formatter.extend(modefiers(dataPromise, formatter));
};

function modefiers(dataPromise, formatter) {
  return {
    filter: filter(dataPromise, formatter),
    root: root(dataPromise, formatter)
  };
}

function filter(dataPromise, formatter) {
  return function (type, ids) {
    if (typeof ids === 'function') { ids = undefined; }
    else { ids = [].concat(ids); }
    var filterObj = arguments[arguments.length-1];
    var keys;
    dataPromise.then(function (dataObj) {
      // TODO validate type
      var typeData = dataObj.slices[type];
      if (ids) {
        typeData.forEach(function (item) {
          if (ids.indexOf(item.id))  { addFilterProperty(item); }
        });
      }
      if (typeof filterObj === 'function') {
        typeData.$$arr.forEach(function (item) {
          if (!filterObj(item))  { addFilterProperty(item); }
        });
      } else {
        keys = Object.keys(filterObj);
        typeData.forEach(function (item) {
          if (!subFilter(item))  { addFilterProperty(item); }
        });
      }
    }).catch(function (err) { console.error(err.stack) });
    return formatter.extend(modefiers(dataPromise, formatter));

    // object property filtering
    function subFilter(item) {
      return keys.filter(function (key) {
        return filterObj[key](item[key]);
      }).length > 0;
    }

    function addFilterProperty(item) {
      Object.defineProperty(item, '$$filter', {
        value: true,
        enumerable: false, writable: true, configurable: false
      });
    }
  };
}

function root(dataPromise, formatter) {
  return function (type) {
    dataPromise.then(function (dataObj) {
      dataObj.root = dataObj.slices[type].$$arr.length === 1 ? dataObj.slices[type].$$arr[0] : dataObj.slices[type].$$arr;
      return dataObj;
    }).catch(function (err) { console.error(err.stack) });
    return formatter.extend(modefiers(dataPromise, formatter));
  };
}
