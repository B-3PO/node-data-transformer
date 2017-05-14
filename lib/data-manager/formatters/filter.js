module.exports = function (data) {
  walk(data);
  return data;
};

function walk(obj) {
  var key;
  var item;
  var isObj;
  var toRemove = [];
  var keys = getKeys(obj);
  while (key = keys.pop()) {
    item = obj[key];
    isObj = isObject(item);
    if (isObj && item.$$filter) { toRemove.push({value: item, key: key}); }
    if (isObj || isArray(obj)) { walk(item); }
  }

  while (item = toRemove.pop()) {
    if (isArray(obj)) { obj.splice(obj.indexOf(item), 1); }
    else if (isObject(obj)) { delete obj[item]; }
  }

  return obj;
}


function getKeys(value) {
  var keys;
  if (isArray(value)) {
    var i = 0;
    var length = value.length;
    keys = new Array(length);
    for (; i<length; i++) {
      keys[i] = i.toString();
    }
    return keys;
  }

  keys = Object.keys(value);
  return keys;
}

function isObject(value) {
  return typeof value == 'object' && value !== null;
}

function isArray(value) {
  return value instanceof Array;
}
