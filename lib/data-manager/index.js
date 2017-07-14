const { build: buildTree } = require('./tree-builder');
const { build: buildQuery } = require('./query-builder');
const database = require('../database');
const dataSlicer = require('./data-slicer');
const dataAnatomizer = require('./data-anatomizer');


module.exports = (struct, ids) => {
  const tree = buildTree(struct);
  const queryObjs = tree.splits.map(buildQuery(ids));
  const promises = queryObjs.map(obj => database.query(obj.query));
  struct.$$filters = {}; // clear filters
  const dataPromise = Promise
    .all(promises)
    .then((data) => {
      let slices;
      data.forEach((item, index) => {
        slices = dataSlicer(item, queryObjs[index].attrs, struct, slices);
      });
      return {
        root: slices[struct.$$resource.type].$$arr,
        subRoot: slices[struct.$$resource.type].$$arr,
        slices,
      };
    });

  return dataAnatomizer(dataPromise, arguments[arguments.length - 1]);
};
