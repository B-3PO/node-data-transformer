const types = {
  BOOLEAN: 'boolean',
  ID: 'id',
  INT: 'int',
  NUMBER: 'number',
  STRING: 'string',
  UUID: 'uuid'
};

exports.convert = {
  boolean: processBoolean,
  id: processId,
  int: returnValue,
  number: returnValue,
  string: returnValue,
  uuid: returnValue
};



function processId(value) {
  if (value === null) { return null; }
  return value.toString();
}

function processBoolean(value) {
  return value === 1 || value === true;
}

function returnValue(value) {
  return value;
}
