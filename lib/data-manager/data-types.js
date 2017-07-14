exports.convert = {
  boolean: processBoolean,
  id: processId,
  int: returnValue,
  number: returnValue,
  string: processString,
  uuid: returnValue
};

exports.parse = {
  boolean: parseBoolean,
  id: returnValue,
  int: returnValue,
  number: returnValue,
  string: returnValue,
  uuid: returnValue
};



function processId(value) {
  if (value === null) { return null; }
  return value;
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

function parseBoolean(value) {
  if (value === true) { return 1; }
  if (value === false) { return 0; }
  return value;
}
