const filter = require('./filter');
const jsonapi = require('./json-api');
const json = data => filter(data);

module.exports = function (dataPromise) {
  // wrap format function in a set function
  let foramtters = {
    toJSON: set(json),
    toJSONAPI: set(jsonapi)
  };
  Object.defineProperties(foramtters, {
    format: {
      value: json, // defualt format function
      enumerable: false,
      writable: true
    },
    extend: {
      value: extend,
      enumerable: false
    }
  });
  return foramtters;

  // add set functions for each format function to given object
  // calling one of theses functions will set the main format function
  function extend(obj) {
    return Object.keys(foramtters)
      .reduce(function (a, key) {
        a[key] = foramtters[key];
        return a;
      }, obj);
  }

  // set the format functon to be used when calling format
  function set(func) {
    return function (callback) {
      foramtters.format = func;

      // if callback passed in then invoke with formatted data
      if (typeof callback === 'function') {
        dataPromise.then(function (dataObj) {
          callback(func(dataObj.root));
        }).catch(function (err) { console.error(err.stack) });;
      }
      return this;
    };
  }
};
