module.exports = (data) => {
  walk(data);
  return data;
};

function walk(obj) {
  let key;
  let item;
  let isObj;
  let toRemove = [];
  let keys = getKeys(obj);
  while (key = keys.pop()) {
    item = obj[key];
    isObj = isObject(item);
    if (isObj && item.$$filter) { toRemove.push({value: item, key: key}); }

    // if resouce id set to single then remove it from the array. All resources by default are in arrays
    if (obj[key] && obj[key].length && obj[key][0].$$single) {
      item = obj[key] = obj[key][0];
      isObj = true;
    }

    if (isObj || isArray(obj)) { walk(item); }
  }

  while (item = toRemove.pop()) {
    if (isArray(obj)) { obj.splice(obj.indexOf(item), 1); }
    else if (isObject(obj)) { delete obj[item]; }
  }

  return obj;
}


function getKeys(value) {
  let keys;
  if (isArray(value)) {
    let i = 0;
    let length = value.length;
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
