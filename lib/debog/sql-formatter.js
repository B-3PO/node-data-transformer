const chalk = require('chalk');
const COMMANDS = {
  SELECT: '    SELECT\n',
  FROM: '\n    FROM',
  WHERE: '\n    WHERE',
  'LEFT JOIN': '\n        LEFT JOIN',
  ' AS ': ' AS ',
  ' IN ': ' IN ',
  ' ON ': ' ON ',
  ' AND ': ' AND ',
  '=': '='
};


module.exports = (str) => {
  str = replaceAll(str, '\n', '');
  Object.keys(COMMANDS).forEach((key) => {
    str = replaceAll(str, key, chalk.blue(COMMANDS[key]));
  });
  return str;
};

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}
