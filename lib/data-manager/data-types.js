exports.convert = {
  boolean: processBoolean,
  id: processId,
  int: returnValue,
  number: returnValue,
  string: processString,
  uuid: returnValue
};



function processId(value) {
  if (value === null) { return null; }
  return value;
  return value.toString();
}

function processBoolean(value) {
  return value === 1 || value === true;
}

function processString(value) {
  if (typeof value === 'number') {
    return value.toString();
  }
  return value;
}

function returnValue(value) {
  return value;
}
