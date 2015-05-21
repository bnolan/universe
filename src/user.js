var _ = require('lodash');

function User (args) {
  _.assign(this, args);
  this.posts = [];
};

User.prototype.toJson = function () {
  return { name: this.name, pkf: this.pkf };
};

module.exports = User;
