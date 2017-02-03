var chalk = require('chalk');
var symbols = require('./symbols');
var sqlFormatter = require('./sql-formatter');
var log = console.log.bind(console);

module.exports = function (label) {
  return create(label);
};

function create(label, depth) {
  depth = depth || 0;
  var stash = [];
  // var groups = {};
  var logger = function () {
    var args = toArray(arguments);
    args.unshift(chalk.dim(label));
    log.apply(this, args);
  };
  logger.active = true;
  logger.chalk = chalk;
  logger.symbols = symbols;
  logger.$$stash = stash;
  logger.$$depth = depth;
  logger.$$label = label;
  logger.sql = function (str) {
    log(chalk.dim(label), chalk.cyan('begin sql'));
    log(sqlFormatter(str));
    log(chalk.dim(label), chalk.cyan('end sql'));
    log('')
  };
  logger.nest = function (_label) {
    var sub = create(_label, (depth + 1));
    sub.$$nest = true;
    stash.push(sub);
    return sub;
  };

  logger.stash = function () {
    stash.push(arguments);
  };

  logger.unstash = function () {
    if (!stash) { return; }
    log.apply(this, prepend(stash.shift(), [chalk.dim(label), chalk.cyan('start')]));
    logStash(stash, new Array(label.length+1).join(' '), depth);
    log.apply(this, prepend(arguments, [chalk.dim(label), chalk.cyan('end')]));
    log(''); // empty line for readability
  };

  return logger;


  function logStash(stash, labelspace, depth) {
    var args;
    while (args = stash.shift()) {
      if (args.$$nest) {
        logStash(args.$$stash, labelspace, args.$$depth);
      } else {
        if (depth > 0) {
          depth = chalk.dim(new Array((depth * 4)-1).join(' ') + '|--');
        } else {
          depth = '';
        }
        log.apply(this, prepend(args, [labelspace, depth]));
      }
    }
  }
}

var noop = function () {};
noop.active = false;
noop.stash = function () {};
noop.unstash = function () {};
noop.nest = function () {};
noop.chalk = chalk;
module.exports.noop = noop;

var slice = Array.prototype.slice;
function toArray(args) {
  return slice.call(args);
}

function prepend(args, arr) {
  args = toArray(args);
  if (!args.length) {
    args.push('');
  }
  args[0] = arr.join(' ')+' '+args[0];
  return args;
}
