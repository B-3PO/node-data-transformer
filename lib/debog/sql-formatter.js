var chalk = require('chalk');
var COMMANDS = {
  select: '    SELECT\n',
  from: '\n    FROM',
  where: '\n    WHERE',
  'left join': '\n        LEFT JOIN',
  ' as ': ' AS ',
  ' in ': ' IN ',
  ' on ': ' ON ',
  '=': '='
};


module.exports = function (str) {
  str = replaceAll(str, '\n', '');
  Object.keys(COMMANDS).forEach(function (key) {
    str = replaceAll(str, key, chalk.blue(COMMANDS[key]));
  });
  return str;
};

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'ig'), replace);
}
