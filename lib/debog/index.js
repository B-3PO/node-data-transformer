const logItem = require('./log-item');
const debugArgs = getArgs();

module.exports = create;
module.exports.chalk = require('chalk');
module.exports.active = false;


function create(label) {
  // if no debugging is enabled then return a dummy function so no exceptions are thrown
  if (inactive(label)) { return logItem.noop; }
  return logItem(label);
}

function inactive(label) {
  if (debugArgs.all === true) { return false; }
  let item = debugArgs;
  label = label.toLowerCase().split(':');
  while (label.length) {
    item = item[label.shift()];
    if (item === true) { return false; }
    if (item && item.all === true) { return false; }
  }
  return true;
}

function getArgs() {
  let data = {};
  (process.env.DEBUG || '').split(',').forEach((key) => {
    if (key === '') { return; } // do not process empty strings
    key = key.trim().toLowerCase();
    if (key === '*') { data.all = true; }
    else if (key.indexOf(':') > -1) {
      data[key] = {};
      key.split(':').forEach((sub) => {
        if (sub === '*') { data[key].all = true; }
        else { data[key][sub] = true; }
      });
    } else { data[key] = true; }
  });
  if (Object.keys(data).length) { module.exports.active = true; }
  return data;
}
