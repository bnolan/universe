/* globals window */

var level = require('level-browserify');

if (!window.universedb) {
  window.universedb = level('./uni-verse');
}

module.exports = window.universedb;
